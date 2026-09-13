import React, { useState } from 'react';
import {
  X,
  Trash2,
  Download,
  Search,
  MessageSquare,
  Clock,
  ShieldCheck,
  ShieldAlert,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { ChatSession, UserSettings } from '../types';

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  currentSessionId: string;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onClearAllSessions: () => void;
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({
  isOpen,
  onClose,
  sessions,
  currentSessionId,
  onSelectSession,
  onDeleteSession,
  onClearAllSessions,
  settings,
  onUpdateSettings,
}) => {
  const [searchFilter, setSearchFilter] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);

  if (!isOpen) return null;

  const filteredSessions = sessions.filter((s) => {
    const titleMatch = s.title.toLowerCase().includes(searchFilter.toLowerCase());
    const messageMatch = s.messages.some((m) =>
      m.content.toLowerCase().includes(searchFilter.toLowerCase())
    );
    return titleMatch || messageMatch;
  });

  const exportHistory = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(sessions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `wikibot-historique-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) {
      return `Aujourd'hui à ${date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      })}`;
    } else if (diffDays === 1) {
      return `Hier à ${date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      })}`;
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar Content */}
      <aside
        id="history-sidebar"
        className="relative ml-auto w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 z-10 transition-transform duration-300"
      >
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Historique des recherches
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {sessions.length} discussion{sessions.length > 1 ? 's' : ''} enregistrée{sessions.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
            aria-label="Fermer l'historique"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conservation Toggle Card */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              {settings.preserveHistory ? (
                <ShieldCheck className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              ) : (
                <ShieldAlert className="w-5 h-5 text-amber-500 flex-shrink-0" />
              )}
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Conservation automatique
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {settings.preserveHistory
                    ? 'Activée (sauvegarde locale sur cet appareil)'
                    : 'Désactivée (sessions éphémères)'}
                </p>
              </div>
            </div>

            {/* Toggle switch */}
            <button
              id="history-preserve-toggle"
              onClick={() =>
                onUpdateSettings({ preserveHistory: !settings.preserveHistory })
              }
              role="switch"
              aria-checked={settings.preserveHistory}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                settings.preserveHistory ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
              title="Activer ou désactiver la conservation d'historique"
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.preserveHistory ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Search bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Rechercher dans les discussions..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredSessions.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-center p-6 text-slate-400 dark:text-slate-500">
              <MessageSquare className="w-10 h-10 mb-2 opacity-40" />
              <p className="text-sm font-medium">
                {searchFilter ? 'Aucun résultat trouvé' : 'Aucun historique pour le moment'}
              </p>
              <p className="text-xs mt-1 text-slate-400 dark:text-slate-500">
                {searchFilter
                  ? 'Essayez avec un autre mot-clé'
                  : 'Posez une question à WikiBot pour débuter !'}
              </p>
            </div>
          ) : (
            filteredSessions.map((session) => {
              const isSelected = session.id === currentSessionId;
              const lastMessage = session.messages[session.messages.length - 1];

              return (
                <div
                  key={session.id}
                  className={`group relative rounded-xl p-3 border transition-all cursor-pointer flex items-start justify-between gap-2 ${
                    isSelected
                      ? 'bg-indigo-50/80 border-indigo-200 dark:bg-indigo-950/40 dark:border-indigo-800 shadow-xs'
                      : 'border-slate-200/80 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                  onClick={() => {
                    onSelectSession(session.id);
                    onClose();
                  }}
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate block">
                        {session.title || 'Discussion sans titre'}
                      </span>
                    </div>
                    {lastMessage && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {lastMessage.content}
                      </p>
                    )}
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
                      {formatDate(session.updatedAt)} • {session.messages.length} message{session.messages.length > 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSession(session.id);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                      title="Supprimer cette discussion"
                      aria-label="Supprimer cette discussion"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={exportHistory}
              disabled={sessions.length === 0}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Exporter (.json)
            </button>

            {confirmClear ? (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    onClearAllSessions();
                    setConfirmClear(false);
                  }}
                  className="px-3 py-2 text-xs font-semibold rounded-xl bg-rose-600 text-white hover:bg-rose-700 transition-colors"
                >
                  Confirmer
                </button>
                <button
                  onClick={() => setConfirmClear(false)}
                  className="px-2 py-2 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400"
                >
                  Annuler
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmClear(true)}
                disabled={sessions.length === 0}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900/60 dark:text-rose-400 dark:hover:bg-rose-950/40 disabled:opacity-40 transition-colors"
                title="Effacer tout l'historique"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Vider
              </button>
            )}
          </div>
          <p className="text-[11px] text-center text-slate-400 dark:text-slate-500">
            Les données restent strictement privées dans votre navigateur.
          </p>
        </div>
      </aside>
    </div>
  );
};
