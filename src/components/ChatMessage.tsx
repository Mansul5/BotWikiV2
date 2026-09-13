import React, { useState } from 'react';
import {
  ExternalLink,
  Volume2,
  VolumeX,
  Copy,
  Check,
  BookOpen,
  User,
  Sparkles,
  ArrowRight,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
  onSelectTopic?: (topic: string) => void;
  onRetry?: (query: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onSelectTopic,
  onRetry,
}) => {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const isUser = message.role === 'user';

  const handleCopy = () => {
    const textToCopy = message.wikipediaData
      ? `${message.wikipediaData.title}\n${message.wikipediaData.extract}\nSource: ${message.wikipediaData.pageUrl}`
      : message.content;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const textToSpeak = message.wikipediaData
      ? `${message.wikipediaData.title}. ${message.wikipediaData.extract}`
      : message.content;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = message.wikipediaData?.lang || 'fr-FR';
    utterance.rate = 1.0;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isUser) {
    return (
      <div className="flex items-end justify-end gap-2.5 my-3 animate-fade-in">
        <div className="flex flex-col items-end max-w-[85%] sm:max-w-[75%]">
          <div className="px-4 py-3 rounded-2xl rounded-tr-xs bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 text-white shadow-md shadow-indigo-500/15 text-sm sm:text-base leading-relaxed break-words font-medium">
            {message.content}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 px-1">
            {formatTime(message.timestamp)}
          </span>
        </div>
        <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center flex-shrink-0 mb-5 shadow-xs">
          <User className="w-4 h-4" />
        </div>
      </div>
    );
  }

  // Bot message
  return (
    <div className="flex items-start gap-3 my-4 animate-fade-in">
      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-pink-500 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-indigo-500/20 mt-1">
        <BookOpen className="w-4 h-4" />
      </div>

      <div className="flex-1 max-w-[95%] sm:max-w-[85%] space-y-2">
        <div className="bg-white dark:bg-slate-800/95 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl rounded-tl-xs p-4 sm:p-5 shadow-sm space-y-3 transition-colors">
          {/* Header if Wikipedia Article */}
          {message.wikipediaData ? (
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-slate-700/60 pb-3">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    {message.wikipediaData.title}
                  </h3>
                  {message.wikipediaData.description && (
                    <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/60">
                      {message.wikipediaData.description}
                    </span>
                  )}
                </div>

                {/* Quick actions: Speak & Copy */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={handleSpeak}
                    className={`p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 dark:hover:text-indigo-400 transition-colors ${
                      isSpeaking ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 dark:text-indigo-400' : ''
                    }`}
                    title={isSpeaking ? 'Arrêter la lecture' : 'Écouter le résumé'}
                    aria-label="Lecture vocale"
                  >
                    {isSpeaking ? (
                      <VolumeX className="w-4 h-4 animate-pulse text-indigo-600" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={handleCopy}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 dark:hover:text-indigo-400 transition-colors"
                    title="Copier le résumé"
                    aria-label="Copier le résumé"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Body: Thumbnail + Extract */}
              <div className="flex flex-col sm:flex-row gap-4 items-start pt-1">
                {message.wikipediaData.thumbnail && (
                  <div className="w-full sm:w-36 h-36 flex-shrink-0 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 shadow-xs relative group">
                    <img
                      src={message.wikipediaData.thumbnail.source}
                      alt={message.wikipediaData.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="flex-1 text-sm sm:text-[15px] leading-relaxed text-slate-700 dark:text-slate-200 space-y-2">
                  <p>{message.wikipediaData.extract}</p>
                </div>
              </div>

              {/* Wikipedia External Link */}
              <div className="pt-2">
                <a
                  href={message.wikipediaData.pageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 text-indigo-600 dark:bg-slate-700/70 dark:hover:bg-indigo-950/50 dark:text-indigo-300 text-xs font-semibold border border-slate-200 dark:border-slate-600 transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Lire l'article complet sur Wikipédia</span>
                  <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
                </a>
              </div>

              {/* Related Topics Suggestions */}
              {message.wikipediaData.relatedTopics &&
                message.wikipediaData.relatedTopics.length > 0 &&
                onSelectTopic && (
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Sujets associés à explorer :</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {message.wikipediaData.relatedTopics.map((topic, i) => (
                        <button
                          key={i}
                          onClick={() => onSelectTopic(topic)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 dark:bg-slate-750 dark:hover:bg-indigo-950/60 dark:text-slate-300 dark:hover:text-indigo-300 border border-slate-200/80 dark:border-slate-700 transition-all hover:scale-102"
                        >
                          <span>{topic}</span>
                          <ArrowRight className="w-2.5 h-2.5 opacity-60" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          ) : message.isError ? (
            <div className="flex items-start gap-3 text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-500" />
              <div className="space-y-2 flex-1">
                <p className="text-sm">{message.content}</p>
                {onRetry && (
                  <button
                    onClick={() => onRetry(message.content)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-200 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Réessayer avec un autre terme
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-sm sm:text-base text-slate-800 dark:text-slate-100 whitespace-pre-wrap leading-relaxed">
              {message.content}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] text-slate-400">
            WikiBot • {formatTime(message.timestamp)}
          </span>
        </div>
      </div>
    </div>
  );
};
