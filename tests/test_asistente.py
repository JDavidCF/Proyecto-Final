import asyncio
from types import SimpleNamespace

import httpx
import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient
from pydantic import ValidationError

from app.api.routers import asistente
from app.api.routers.asistente import (
    AssistantRequest,
    build_model_payload,
    contains_sensitive_data,
    extract_model_answer,
)
from app.main import app


def test_assistant_request_trims_message_and_rejects_private_data():
    request = AssistantRequest(message="  ¿Cómo consulto mis pedidos?  ")
    assert request.message == "¿Cómo consulto mis pedidos?"

    with pytest.raises(ValidationError):
        AssistantRequest(message="Mi correo es cliente@example.com")


def test_assistant_request_rejects_unsupported_language_and_extra_fields():
    with pytest.raises(ValidationError):
        AssistantRequest(message="Help me", language="xx")

    with pytest.raises(ValidationError):
        AssistantRequest(message="Help me", account_id=123)


def test_model_payload_contains_only_question_and_allowlisted_section_context():
    request = AssistantRequest(
        message="¿Cómo registro un ajuste?",
        language="es-CO",
        section="movements",
    )
    payload = build_model_payload(request)
    serialized = str(payload)

    assert "¿Cómo registro un ajuste?" in serialized
    assert "inventory movements" in serialized
    assert "Reply in Spanish (Colombia)" in serialized
    assert "user@example.com" not in serialized
    assert "private_user_data" not in serialized


def test_extract_model_answer_joins_text_parts_and_handles_empty_response():
    payload = {
        "candidates": [
            {"content": {"parts": [{"text": "Primera parte."}, {"text": "Segunda parte."}]}}
        ]
    }
    assert extract_model_answer(payload) == "Primera parte. Segunda parte."
    assert extract_model_answer({"candidates": []}) is None


@pytest.mark.parametrize(
    "message",
    [
        "Mi teléfono es +57 300 123 4567",
        "Mi teléfono es 3001234567",
        "Mi clave es super-secret-value",
        "Mi token es eyJabcdefghijk.abcdefghijk.abcdefghijk",
        "Consulta mi pedido PED-1047",
    ],
)
def test_sensitive_values_are_detected(message):
    assert contains_sensitive_data(message)


def test_assistant_endpoint_uses_server_key_and_sends_only_current_question(monkeypatch):
    sent_requests = []
    real_async_client = httpx.AsyncClient

    async def provider_response(request):
        sent_requests.append(request)
        return httpx.Response(
            200,
            json={
                "candidates": [
                    {"content": {"parts": [{"text": "Abre el módulo de pedidos."}]}}
                ]
            },
            request=request,
        )

    transport = httpx.MockTransport(provider_response)
    monkeypatch.setenv("GEMINI_API_KEY", "test-server-key")

    def mock_client(*, timeout):
        return real_async_client(timeout=timeout, transport=transport)

    monkeypatch.setattr(asistente.httpx, "AsyncClient", mock_client)
    asistente._requests_by_actor.pop(321, None)
    request = AssistantRequest(
        message="¿Dónde veo mis pedidos?",
        language="es-CO",
        section="orders",
    )

    result = asyncio.run(
        asistente.consultar_asistente(request, usuario=SimpleNamespace(id=321))
    )

    assert result.answer == "Abre el módulo de pedidos."
    assert len(sent_requests) == 1
    outgoing = sent_requests[0]
    assert outgoing.headers["x-goog-api-key"] == "test-server-key"
    assert outgoing.headers.get("authorization") is None
    assert "test-server-key" not in str(outgoing.url)
    outgoing_body = outgoing.content.decode("utf-8")
    assert "¿Dónde veo mis pedidos?" in outgoing_body
    assert "321" not in outgoing_body
    assert "test-server-key" not in outgoing_body
    asistente._requests_by_actor.pop(321, None)


def test_assistant_endpoint_reports_missing_server_key(monkeypatch):
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)
    asistente._requests_by_actor.pop(654, None)

    with pytest.raises(HTTPException) as error:
        asyncio.run(
            asistente.consultar_asistente(
                AssistantRequest(message="¿Cómo creo un pedido?"),
                usuario=SimpleNamespace(id=654),
            )
        )

    assert error.value.status_code == 503
    assert ".env" in error.value.detail
    assert "reinicia FastAPI" in error.value.detail


@pytest.mark.parametrize("provider_status", [401, 403])
def test_assistant_reports_invalid_or_unauthorized_provider_key(monkeypatch, provider_status):
    real_async_client = httpx.AsyncClient

    async def provider_response(request):
        return httpx.Response(
            provider_status,
            json={"error": {"message": "provider details"}},
            request=request,
        )

    transport = httpx.MockTransport(provider_response)
    monkeypatch.setenv("GEMINI_API_KEY", "invalid-test-key")

    def mock_client(*, timeout):
        return real_async_client(timeout=timeout, transport=transport)

    monkeypatch.setattr(asistente.httpx, "AsyncClient", mock_client)
    user_id = f"invalid-provider-key:{provider_status}"
    asistente._requests_by_actor.pop(user_id, None)

    with pytest.raises(HTTPException) as error:
        asyncio.run(
            asistente.consultar_asistente(
                AssistantRequest(message="¿Cómo creo un pedido?"),
                usuario=SimpleNamespace(id=user_id),
            )
        )

    assert error.value.status_code == 503
    assert "clave del servicio de IA" in error.value.detail
    asistente._requests_by_actor.pop(user_id, None)


def test_assistant_rate_limit_is_per_user():
    user_id = 987
    asistente._requests_by_actor.pop(user_id, None)

    async def make_requests():
        for _ in range(asistente.REQUESTS_PER_MINUTE):
            await asistente.enforce_rate_limit(user_id)
        with pytest.raises(HTTPException) as error:
            await asistente.enforce_rate_limit(user_id)
        assert error.value.status_code == 429

    asyncio.run(make_requests())
    asistente._requests_by_actor.pop(user_id, None)


def test_assistant_route_is_registered_and_requires_authentication():
    response = TestClient(app).post(
        "/asistente/consulta",
        json={"message": "¿Cómo consulto mis pedidos?", "language": "es-CO", "section": "orders"},
    )
    assert response.status_code == 401


def test_public_assistant_route_is_available_without_login(monkeypatch):
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)
    asistente._requests_by_actor.pop("guest:testclient", None)
    response = TestClient(app).post(
        "/asistente/consulta-publica",
        json={"message": "¿Qué puedo hacer en StockNova?", "section": "general"},
    )
    assert response.status_code == 503
    assert "GEMINI_API_KEY" in response.json()["detail"]

def test_assistant_request_rejects_messages_outside_length_limits():
    with pytest.raises(ValidationError):
        AssistantRequest(message="a")

    with pytest.raises(ValidationError):
        AssistantRequest(message="x" * 1001)


def test_extract_model_answer_ignores_non_text_parts():
    payload = {
        "candidates": [
            {
                "content": {
                    "parts": [
                        {"inline_data": "imagen"},
                        {"text": ""},
                        {"text": "Respuesta válida."}
                    ]
                }
            }
        ]
    }

    assert extract_model_answer(payload) == "Respuesta válida."


@pytest.mark.parametrize(
    "message",
    [
        "¿Cómo registro un producto nuevo?",
        "¿Dónde consulto el stock disponible?",
        "¿Cómo reviso las estadísticas de ventas?",
    ],
)
def test_normal_inventory_questions_are_not_sensitive(message):
    assert not contains_sensitive_data(message)
