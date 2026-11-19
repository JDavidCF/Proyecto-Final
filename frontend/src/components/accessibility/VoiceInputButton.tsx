import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface RecognitionResult {
  readonly 0?: { transcript: string };
  readonly length: number;
  readonly isFinal: boolean;
}

interface RecognitionEvent extends Event {
  results: ArrayLike<RecognitionResult>;
}

interface RecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: ((event: RecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface SpeechRecognitionWindow extends Window {
  SpeechRecognition?: new () => SpeechRecognitionLike;
  webkitSpeechRecognition?: new () => SpeechRecognitionLike;
}

interface VoiceInputButtonProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  compact?: boolean;
}

export function VoiceInputButton({
  value,
  onChange,
  className = '',
  compact = false,
}: VoiceInputButtonProps) {
  const { locale, t } = useLanguage();
  const [listening, setListening] = useState(false);
  const [message, setMessage] = useState('');
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const valueRef = useRef(value);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => () => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    recognition.onend = null;
    recognition.onresult = null;
    recognition.onerror = null;
    recognition.abort();
  }, []);

  const toggleListening = () => {
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }

    const speechWindow = window as SpeechRecognitionWindow;
    const Recognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    if (!Recognition) {
      setMessage(t('El dictado por voz no está disponible en este navegador.'));
      return;
    }

    setMessage('');
    const recognition = new Recognition();
    recognition.lang = locale;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript ?? '')
        .join(' ')
        .trim();
      if (!transcript) return;

      const currentValue = valueRef.current.trimEnd();
      onChange(currentValue ? `${currentValue} ${transcript}` : transcript);
    };
    recognition.onerror = (event) => {
      const errorMessage = event.error === 'not-allowed' || event.error === 'service-not-allowed'
        ? t('No se pudo acceder al micrófono. Revisa los permisos del navegador.')
        : event.error === 'language-not-supported'
          ? t('El idioma de dictado no está disponible en este dispositivo.')
          : event.error === 'no-speech'
            ? t('No se detectó voz. Inténtalo de nuevo.')
            : t('No se pudo iniciar el dictado. Inténtalo otra vez.');
      setMessage(errorMessage);
    };
    recognition.onend = () => {
      recognitionRef.current = null;
      setListening(false);
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
      setListening(true);
    } catch (error) {
      if (!(error instanceof DOMException)) throw error;
      recognitionRef.current = null;
      setListening(false);
      setMessage(
        error.name === 'NotAllowedError'
          ? t('No se pudo acceder al micrófono. Revisa los permisos del navegador.')
          : t('No se pudo iniciar el dictado. Inténtalo otra vez.')
      );
    }
  };

  const buttonSize = compact ? 'h-8 w-8' : 'h-10 w-10';

  return (
    <span className={`inline-flex shrink-0 ${className}`}>
      <span className="relative inline-flex">
        <button
          type="button"
          onClick={toggleListening}
          aria-label={listening ? t('Detener dictado') : t('Dictado por voz')}
          aria-pressed={listening}
          title={listening ? t('Escuchando…') : t('Dictado por voz')}
          className={`${buttonSize} inline-flex items-center justify-center rounded-xl border border-[rgba(170,184,204,0.2)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176BFF] ${
            listening
              ? 'border-rose-400/60 bg-rose-500/15 text-rose-400'
              : 'bg-[#101B35]/70 text-[#AAB8CC] hover:border-[#176BFF]/60 hover:text-[#00D9FF]'
          }`}
        >
          {listening
            ? <MicOff className="h-4 w-4" aria-hidden="true" />
            : <Mic className="h-4 w-4" aria-hidden="true" />}
        </button>
        {(message || listening) && (
          <span
            role={message ? 'alert' : 'status'}
            className="absolute bottom-full right-0 z-30 mb-2 w-56 rounded-lg border border-[rgba(170,184,204,0.2)] bg-[#101B35] px-3 py-2 text-xs leading-relaxed text-[#EAF4FF] shadow-xl"
          >
            {message || t('Escuchando…')}
          </span>
        )}
      </span>
    </span>
  );
}
