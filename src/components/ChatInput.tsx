import React, { useState, useRef, useEffect } from 'react';
import { Send, Shuffle, Sparkles, X } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  onRandomArticle: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  onRandomArticle,
}) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const maxLength = 250;

  useEffect(() => {
    if (!isLoading && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isLoading]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    onSendMessage(input.trim());
    setInput('');

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (val.length <= maxLength) {
      setInput(val);
      // Auto adjust height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
      }
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-3 sm:p-4">
      {/* Quick suggested tags or random button bar */}
      <div className="flex items-center justify-between mb-2 px-1 text-xs text-slate-500 dark:text-slate-400">
        <button
          type="button"
          onClick={onRandomArticle}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium transition-colors disabled:opacity-50"
          title="Consulter un article aléatoire"
        >
          <Shuffle className="w-3.5 h-3.5 text-indigo-500" />
          <span>Article surprise</span>
        </button>

        <span className="text-[11px] tabular-nums text-slate-400">
          {input.length}/{maxLength}
        </span>
      </div>

      {/* Input container */}
      <form
        onSubmit={handleSubmit}
        className="relative flex items-end gap-2 p-2 sm:p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg shadow-indigo-500/5 focus-within:border-indigo-500 dark:focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all"
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Posez votre question ou recherchez un sujet..."
          rows={1}
          disabled={isLoading}
          className="flex-1 max-h-32 min-h-[44px] py-2.5 px-3 bg-transparent text-sm sm:text-base text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 resize-none outline-none leading-relaxed"
        />

        {/* Clear input if has text */}
        {input.length > 0 && !isLoading && (
          <button
            type="button"
            onClick={() => {
              setInput('');
              if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
              }
            }}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl transition-colors"
            title="Effacer le texte"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Send Button */}
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="h-11 px-4 sm:px-5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 hover:from-indigo-500 hover:to-pink-400 text-white font-semibold text-sm shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/30 flex items-center justify-center gap-1.5 transition-all disabled:opacity-40 disabled:pointer-events-none active:scale-95"
          aria-label="Envoyer la question"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span className="hidden sm:inline">Envoyer</span>
              <Send className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
