import { useEffect, useRef, useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Bot, Send, Sparkles, X } from 'lucide-react';
import { LANGUAGES, useLanguage } from '../../context/LanguageContext';
import { VoiceInputButton } from '../accessibility/VoiceInputButton';
import {
  assistantService,
  type AssistantLanguage,
  type AssistantSection,
} from '../../services/api';
import { extractApiError } from '../../services/api';

interface StockNovaAssistantProps {
  section: AssistantSection;
  publicAccess?: boolean;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

interface AssistantCopy {
  title: string;
  subtitle: string;
  languageLabel: string;
  welcome: string;
  privacy: string;
  placeholder: string;
  send: string;
  thinking: string;
  close: string;
  fallbackError: string;
}

const COPY: Record<AssistantLanguage, AssistantCopy> = {
  'es-CO': {
    title: 'Asistente StockNova',
    subtitle: 'Ayuda contextual de la aplicación',
    languageLabel: 'Idioma de respuesta',
    welcome: '¡Hola! Puedo orientarte sobre el uso de StockNova. No puedo consultar tus datos ni realizar acciones por ti.',
    privacy: 'No compartas contraseñas, claves ni datos personales. El asistente no accede a tus pedidos ni a tu inventario.',
    placeholder: 'Escribe una pregunta sobre la aplicación…',
    send: 'Enviar pregunta',
    thinking: 'Preparando respuesta…',
    close: 'Cerrar asistente',
    fallbackError: 'No se pudo obtener una respuesta. Inténtalo de nuevo.',
  },
  en: {
    title: 'StockNova assistant',
    subtitle: 'Contextual help for the app',
    languageLabel: 'Response language',
    welcome: 'Hello! I can guide you through StockNova. I cannot view your data or take actions for you.',
    privacy: 'Do not share passwords, keys, or personal data. The assistant cannot access your orders or inventory.',
    placeholder: 'Ask a question about the app…',
    send: 'Send question',
    thinking: 'Preparing an answer…',
    close: 'Close assistant',
    fallbackError: 'Could not get an answer. Please try again.',
  },
  ru: {
    title: 'Помощник StockNova',
    subtitle: 'Подсказки по приложению',
    languageLabel: 'Язык ответа',
    welcome: 'Здравствуйте! Я помогу разобраться в StockNova. Я не вижу ваши данные и не могу выполнять действия.',
    privacy: 'Не отправляйте пароли, ключи или личные данные. Помощник не имеет доступа к заказам и запасам.',
    placeholder: 'Задайте вопрос о приложении…',
    send: 'Отправить вопрос',
    thinking: 'Готовлю ответ…',
    close: 'Закрыть помощника',
    fallbackError: 'Не удалось получить ответ. Попробуйте ещё раз.',
  },
  it: {
    title: 'Assistente StockNova',
    subtitle: 'Guida contestuale all’app',
    languageLabel: 'Lingua della risposta',
    welcome: 'Ciao! Posso aiutarti a usare StockNova. Non posso vedere i tuoi dati né eseguire operazioni.',
    privacy: 'Non condividere password, chiavi o dati personali. L’assistente non accede a ordini o inventario.',
    placeholder: 'Fai una domanda sull’app…',
    send: 'Invia domanda',
    thinking: 'Sto preparando la risposta…',
    close: 'Chiudi assistente',
    fallbackError: 'Impossibile ottenere una risposta. Riprova.',
  },
  fr: {
    title: 'Assistant StockNova',
    subtitle: 'Aide contextuelle dans l’application',
    languageLabel: 'Langue de réponse',
    welcome: 'Bonjour ! Je peux vous guider dans StockNova. Je ne peux pas consulter vos données ni effectuer d’actions.',
    privacy: 'Ne partagez pas de mots de passe, de clés ou de données personnelles. L’assistant n’accède ni aux commandes ni au stock.',
    placeholder: 'Posez une question sur l’application…',
    send: 'Envoyer la question',
    thinking: 'Préparation de la réponse…',
    close: 'Fermer l’assistant',
    fallbackError: 'Impossible d’obtenir une réponse. Réessayez.',
  },
  'pt-BR': {
    title: 'Assistente StockNova',
    subtitle: 'Ajuda contextual do aplicativo',
    languageLabel: 'Idioma da resposta',
    welcome: 'Olá! Posso orientar você no uso do StockNova. Não consigo consultar seus dados nem realizar ações.',
    privacy: 'Não compartilhe senhas, chaves ou dados pessoais. O assistente não acessa pedidos nem estoque.',
    placeholder: 'Faça uma pergunta sobre o aplicativo…',
    send: 'Enviar pergunta',
    thinking: 'Preparando a resposta…',
    close: 'Fechar assistente',
    fallbackError: 'Não foi possível obter uma resposta. Tente novamente.',
  },
  'zh-CN': {
    title: 'StockNova 助手',
    subtitle: '应用使用帮助',
    languageLabel: '回复语言',
    welcome: '你好！我可以帮助你了解如何使用 StockNova。我无法查看你的数据或替你执行操作。',
    privacy: '请勿分享密码、密钥或个人信息。助手无法访问你的订单或库存。',
    placeholder: '请输入有关应用的问题…',
    send: '发送问题',
    thinking: '正在准备回答…',
    close: '关闭助手',
    fallbackError: '无法获取回答，请重试。',
  },
  ja: {
    title: 'StockNova アシスタント',
    subtitle: 'アプリの使い方ガイド',
    languageLabel: '回答言語',
    welcome: 'こんにちは。StockNova の使い方をご案内します。個人データの確認や操作の実行はできません。',
    privacy: 'パスワード、キー、個人情報を入力しないでください。注文や在庫にはアクセスできません。',
    placeholder: 'アプリについて質問する…',
    send: '質問を送信',
    thinking: '回答を準備しています…',
    close: 'アシスタントを閉じる',
    fallbackError: '回答を取得できませんでした。もう一度お試しください。',
  },
  la: {
    title: 'Adiutor StockNova',
    subtitle: 'Auxilium de applicatione',
    languageLabel: 'Lingua responsi',
    welcome: 'Salve! De usu StockNova te monere possum. Data tua videre vel actiones facere non possum.',
    privacy: 'Noli tesserae, claves, aut data privata communicare. Adiutor ordines aut inventarium tuum non videt.',
    placeholder: 'Interroga de applicatione…',
    send: 'Mitte quaestionem',
    thinking: 'Responsum paro…',
    close: 'Claude adiutorem',
    fallbackError: 'Responsum obtinere non potui. Iterum conare.',
  },
  de: {
    title: 'StockNova-Assistent',
    subtitle: 'Kontextbezogene Hilfe zur App',
    languageLabel: 'Antwortsprache',
    welcome: 'Hallo! Ich helfe dir bei der Nutzung von StockNova. Ich kann deine Daten nicht einsehen oder Aktionen ausführen.',
    privacy: 'Teile keine Passwörter, Schlüssel oder persönlichen Daten. Der Assistent hat keinen Zugriff auf Bestellungen oder Lagerbestand.',
    placeholder: 'Stelle eine Frage zur App…',
    send: 'Frage senden',
    thinking: 'Antwort wird vorbereitet…',
    close: 'Assistent schließen',
    fallbackError: 'Keine Antwort erhalten. Bitte versuche es erneut.',
  },
  ar: {
    title: 'مساعد StockNova',
    subtitle: 'مساعدة داخل التطبيق',
    languageLabel: 'لغة الرد',
    welcome: 'مرحبًا! يمكنني إرشادك إلى استخدام StockNova. لا يمكنني الاطلاع على بياناتك أو تنفيذ إجراءات نيابةً عنك.',
    privacy: 'لا تشارك كلمات المرور أو المفاتيح أو البيانات الشخصية. لا يمكن للمساعد الوصول إلى الطلبات أو المخزون.',
    placeholder: 'اكتب سؤالًا عن التطبيق…',
    send: 'إرسال السؤال',
    thinking: 'جارٍ إعداد الإجابة…',
    close: 'إغلاق المساعد',
    fallbackError: 'تعذر الحصول على إجابة. حاول مرة أخرى.',
  },
  ko: {
    title: 'StockNova 도우미',
    subtitle: '앱 사용에 대한 도움말',
    languageLabel: '응답 언어',
    welcome: '안녕하세요! StockNova 사용 방법을 안내해 드릴게요. 계정 데이터를 보거나 작업을 대신 수행할 수는 없습니다.',
    privacy: '비밀번호, 키 또는 개인 정보를 입력하지 마세요. 도우미는 주문이나 재고에 접근할 수 없습니다.',
    placeholder: '앱에 관해 질문하세요…',
    send: '질문 보내기',
    thinking: '답변을 준비하고 있어요…',
    close: '도우미 닫기',
    fallbackError: '답변을 가져오지 못했습니다. 다시 시도해 주세요.',
  },
  hi: {
    title: 'StockNova सहायक',
    subtitle: 'ऐप के लिए संदर्भ-सहायता',
    languageLabel: 'जवाब की भाषा',
    welcome: 'नमस्ते! मैं StockNova का उपयोग समझने में मदद कर सकता हूँ। मैं आपका डेटा नहीं देख सकता और न ही कोई कार्रवाई कर सकता हूँ।',
    privacy: 'पासवर्ड, कुंजी या निजी जानकारी साझा न करें। सहायक आपके ऑर्डर या इन्वेंटरी तक पहुँच नहीं सकता।',
    placeholder: 'ऐप के बारे में प्रश्न लिखें…',
    send: 'प्रश्न भेजें',
    thinking: 'उत्तर तैयार हो रहा है…',
    close: 'सहायक बंद करें',
    fallbackError: 'उत्तर नहीं मिल सका। कृपया फिर से प्रयास करें।',
  },
};

export function StockNovaAssistant({
  section,
  publicAccess = false,
}: StockNovaAssistantProps) {
  const { locale, setLocale } = useLanguage();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const copy = COPY[locale];
  const isRtl = locale === 'ar';

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, busy, error]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const message = draft.trim();
    if (message.length < 2 || busy) return;

    setMessages((current) => [...current, { role: 'user', text: message }]);
    setDraft('');
    setError('');
    setBusy(true);
    try {
      const request = { message, language: locale, section };
      const response = publicAccess
        ? await assistantService.askPublic(request)
        : await assistantService.ask(request);
      setMessages((current) => [...current, { role: 'assistant', text: response.answer }]);
    } catch (requestError) {
      setError(extractApiError(requestError, copy.fallbackError));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed bottom-3 right-3 z-40 sm:bottom-4 sm:right-4" dir={isRtl ? 'rtl' : 'ltr'}>
      <AnimatePresence>
        {open && (
          <motion.section
            role="dialog"
            aria-label={copy.title}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            className="absolute bottom-16 right-0 flex h-[min(34rem,calc(100vh-7rem))] w-80 max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-[rgba(170,184,204,0.2)] bg-[#101B35] shadow-2xl"
          >
            <header className="flex items-start justify-between gap-3 border-b border-[rgba(170,184,204,0.14)] p-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#176BFF]/15 text-[#00D9FF]">
                  <Bot className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-semibold text-[#EAF4FF]">{copy.title}</h2>
                  <p className="mt-0.5 text-[11px] text-[#AAB8CC]">{copy.subtitle}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={copy.close}
                className="rounded-lg p-1.5 text-[#AAB8CC] transition-colors hover:bg-[#080D1B] hover:text-[#EAF4FF]"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <div className="border-b border-[rgba(170,184,204,0.1)] px-4 py-3">
              <label htmlFor="assistant-language" className="mb-1.5 block text-[11px] text-[#AAB8CC]">
                {copy.languageLabel}
              </label>
              <select
                id="assistant-language"
                value={locale}
                onChange={(event) => {
                  const option = LANGUAGES.find((item) => item.code === event.target.value);
                  if (option) setLocale(option.code);
                }}
                className="h-9 w-full rounded-lg border border-[rgba(170,184,204,0.2)] bg-[#080D1B] px-2.5 text-xs text-[#EAF4FF]"
              >
                {LANGUAGES.map((option) => (
                  <option key={option.code} value={option.code}>{option.label}</option>
                ))}
              </select>
            </div>

            <div ref={scrollRef} aria-live="polite" className="flex-1 space-y-3 overflow-y-auto p-4">
              <div className="flex items-start gap-2">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[#00D9FF]" aria-hidden="true" />
                <p className="rounded-xl rounded-tl-sm bg-[#080D1B] p-3 text-xs leading-relaxed text-[#EAF4FF]">
                  {copy.welcome}
                </p>
              </div>
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <p
                    className={`max-w-[90%] whitespace-pre-wrap rounded-xl p-3 text-xs leading-relaxed ${
                      message.role === 'user'
                        ? 'rounded-br-sm bg-[#176BFF] text-white'
                        : 'rounded-bl-sm bg-[#080D1B] text-[#EAF4FF]'
                    }`}
                  >
                    {message.text}
                  </p>
                </div>
              ))}
              {busy && (
                <p className="flex items-center gap-2 text-xs text-[#AAB8CC]">
                  <span className="sn-ai-loader" aria-hidden="true">
                    <span className="sn-ai-loader__core" />
                  </span>
                  {copy.thinking}
                </p>
              )}
              {error && <p role="alert" className="text-xs leading-relaxed text-rose-300">{error}</p>}
            </div>

            <div className="border-t border-[rgba(170,184,204,0.12)] p-3">
              <p className="mb-2 text-[10px] leading-relaxed text-[#AAB8CC]">{copy.privacy}</p>
              <form onSubmit={handleSubmit} className="flex items-end gap-2">
                <textarea
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  maxLength={1000}
                  rows={2}
                  placeholder={copy.placeholder}
                  aria-label={copy.placeholder}
                  className="max-h-24 min-h-10 flex-1 resize-y rounded-xl border border-[rgba(170,184,204,0.2)] bg-[#080D1B] px-3 py-2 text-xs leading-relaxed text-[#EAF4FF] placeholder:text-[#AAB8CC]/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176BFF]"
                />
                <VoiceInputButton value={draft} onChange={setDraft} />
                <button
                  type="submit"
                  disabled={busy || draft.trim().length < 2}
                  aria-label={copy.send}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#176BFF] text-white transition-colors hover:bg-[#2A7BFF] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send className="h-4 w-4" aria-hidden="true" />
                </button>
              </form>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-label={open ? copy.close : copy.title}
        className="sn-ai-launcher flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg shadow-[#176BFF]/30 transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D9FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#080D1B] sm:h-14 sm:w-14"
      >
        {open ? <X className="h-4 w-4 sm:h-5 sm:w-5" /> : <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />}
      </button>
    </div>
  );
}
