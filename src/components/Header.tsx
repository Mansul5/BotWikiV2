import React from 'react';
import { History, Moon, Sun, Plus, Globe, Settings, Sparkles, BookOpen } from 'lucide-react';
import { UserSettings } from '../types';

interface HeaderProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onToggleHistory: () => void;
  isHistoryOpen: boolean;
  historyCount: number;
  onNewChat: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  onUpdateSettings,
  onToggleHistory,
  isHistoryOpen,
  historyCount,
  onNewChat,
  onOpenSettings,
}) => {
  const toggleTheme = () => {
    const nextTheme = settings.theme === 'dark' ? 'light' : 'dark';
    onUpdateSettings({ theme: nextTheme });
  };

  const languages = [
    { code: 'fr', label: 'FR' },
    { code: 'en', label: 'EN' },
    { code: 'es', label: 'ES' },
    { code: 'de', label: 'DE' },
  ];

  return (
    <header
      id="app-header"
      className="sticky top-0 z-30 w-full border-b backdrop-blur-md transition-colors duration-300
        bg-white/90 border-slate-200/80
        dark:bg-slate-900/90 dark:border-slate-800"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Left: Brand / Logo */}
        <div className="flex items-center gap-3">
          <button
            id="history-toggle-button"
            onClick={onToggleHistory}
            className={`p-2.5 rounded-xl border transition-all relative flex items-center justify-center ${
              isHistoryOpen
                ? 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-950/50 dark:border-indigo-800 dark:text-indigo-400'
                : 'border-slate-200 hover:bg-slate-100 text-slate-700 dark:border-slate-800 dark:hover:bg-slate-800 dark:text-slate-300'
            }`}
            title="Afficher l'historique"
            aria-label="Afficher l'historique des discussions"
          >
            <History className="w-5 h-5" />
            {historyCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                {historyCount > 9 ? '9+' : historyCount}
              </span>
            )}
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-0.5 shadow-md shadow-indigo-500/20">
              <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[10px] flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
                  WikiBot
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Wikipédia
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                Exploration du savoir mondial en temps réel
              </p>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* New Chat */}
          <button
            id="new-chat-button"
            onClick={onNewChat}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 dark:text-slate-200 dark:border-slate-800 dark:hover:bg-slate-800 transition-colors"
            title="Nouvelle discussion"
          >
            <Plus className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden md:inline">Nouvelle discussion</span>
          </button>

          {/* Language Selector */}
          <div className="relative flex items-center bg-slate-100 dark:bg-slate-800/80 rounded-xl p-0.5 border border-slate-200 dark:border-slate-700">
            {languages.map((l) => (
              <button
                key={l.code}
                onClick={() => onUpdateSettings({ language: l.code })}
                className={`px-2 py-1 text-xs font-bold rounded-lg transition-all ${
                  settings.language === l.code
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title={`Rechercher sur Wikipédia (${l.code.toUpperCase()})`}
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* Dark Mode Toggle */}
          <button
            id="theme-toggle-button"
            onClick={toggleTheme}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 dark:border-slate-800 dark:hover:bg-slate-800 dark:text-slate-300 transition-colors"
            title={
              settings.theme === 'dark'
                ? 'Activer le mode clair'
                : 'Activer le mode sombre'
            }
            aria-label="Basculer le mode sombre"
          >
            {settings.theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* Settings modal trigger */}
          <button
            id="settings-modal-button"
            onClick={onOpenSettings}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 dark:border-slate-800 dark:hover:bg-slate-800 dark:text-slate-300 transition-colors"
            title="Paramètres et conservation"
            aria-label="Ouvrir les paramètres"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
