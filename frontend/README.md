# StockNova — Frontend integrado

## Requisitos
- Node.js 20.19+ o 22.12+
- Backend FastAPI ejecutándose en `http://127.0.0.1:8000`

## Instalación
```bash
npm install
```

Copia `frontend/.env.example` a `frontend/.env` para configurar la URL del backend:
`VITE_API_BASE_URL=http://127.0.0.1:8000`.

## Ejecutar
```bash
npm run dev
```
Abre la dirección que muestre Vite (normalmente `http://localhost:5173`).

## Compilar
```bash
npm run build
```

El frontend utiliza los endpoints reales de FastAPI. No contiene credenciales; no compartas tu `.env` ni agregues claves privadas al frontend.

## Consideraciones de integración
- El backend registra ventas por producto; el frontend envía una petición por cada línea de venta.
- El backend no almacena método de pago, dirección de envío, motivo de movimiento ni datos comerciales adicionales que el diseño muestra.
- El backend registra el costo y precio del producto, pero no tiene campos de costo, ubicación, proveedor separado o stock mínimo; algunos datos visuales usan valores predeterminados.

## Asistente de IA
El asistente usa el proxy de Gemini del backend. Para habilitar respuestas, configura
`GEMINI_API_KEY` en el `.env` del backend (puedes partir de `.env.example`) y reinicia
FastAPI. `GEMINI_MODEL` es opcional; el backend usa el valor de ejemplo si se omite.
Sin la clave, el backend devuelve un error explícito de configuración. No pongas la clave
en `frontend/.env`, en variables `VITE_*` ni en el código del navegador.

## Dictado por voz
El dictado usa Web Speech API cuando el navegador la ofrece; requiere permiso de
micrófono y un contexto seguro (HTTPS o `localhost`). La disponibilidad de idiomas
depende del navegador y del dispositivo. Según el navegador, el reconocimiento puede
procesarse mediante un servicio externo; evita dictar contraseñas o datos sensibles.
