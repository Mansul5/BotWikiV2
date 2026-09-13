import React from 'react';
import {
  X,
  Moon,
  Sun,
  Laptop,
  ShieldCheck,
  ShieldAlert,
  Globe,
  Trash2,
  Download,
  Info,
} from 'lucide-react';
import { UserSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  totalSavedSessions: number;
  onClearHistory: () => void;
  onExportHistory: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  totalSavedSessions,
  onClearHistory,
  onExportHistory,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 space-y-6 z-10 animate-fade-in"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h2
              id="settings-title"
              className="text-lg font-bold text-slate-900 dark:text-white"
            >
              Paramètres & Préférences
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Personnalisez l'affichage et la gestion de vos données
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Setting 1: Conservation de l'historique (Core requirement) */}
        <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
                {settings.preserveHistory ? (
                  <ShieldCheck className="w-5 h-5" />
                ) : (
                  <ShieldAlert className="w-5 h-5" />
                )}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Conservation de l'historique
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  Conserver vos recherches et discussions entre vos visites.
                </p>
              </div>
            </div>

            {/* Toggle switch */}
            <button
              onClick={() =>
                onUpdateSettings({ preserveHistory: !settings.preserveHistory })
              }
              role="switch"
              aria-checked={settings.preserveHistory}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                settings.preserveHistory ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.preserveHistory ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-indigo-100/80 dark:border-indigo-900/40">
            <span>Statut : {settings.preserveHistory ? 'Activé (Stockage local sécurisé)' : 'Désactivé'}</span>
            <span>{totalSavedSessions} session{totalSavedSessions > 1 ? 's' : ''} en mémoire</span>
          </div>
        </div>

        {/* Setting 2: Mode d'affichage (Sombre / Clair / Système) */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Apparence & Confort Visuel
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { mode: 'light', label: 'Clair', icon: Sun },
              { mode: 'dark', label: 'Sombre', icon: Moon },
              { mode: 'system', label: 'Système', icon: Laptop },
            ].map(({ mode, label, icon: Icon }) => (
              <button
                key={mode}
                onClick={() =>
                  onUpdateSettings({
                    theme: mode as 'light' | 'dark' | 'system',
                  })
                }
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-semibold gap-1.5 transition-all ${
                  settings.theme === mode
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:border-indigo-500 dark:text-indigo-300 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Setting 3: Langue de recherche Wikipédia */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Globe className="w-4 h-4" />
            <span>Édition linguistique Wikipédia</span>
          </label>
          <select
            value={settings.language}
            onChange={(e) => onUpdateSettings({ language: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="fr">Français (fr.wikipedia.org)</option>
            <option value="en">English (en.wikipedia.org)</option>
            <option value="es">Español (es.wikipedia.org)</option>
            <option value="de">Deutsch (de.wikipedia.org)</option>
          </select>
        </div>

        {/* Action Buttons: Export & Clear */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
          <button
            onClick={onExportHistory}
            disabled={totalSavedSessions === 0}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Exporter l'historique
          </button>

          <button
            onClick={onClearHistory}
            disabled={totalSavedSessions === 0}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 disabled:opacity-40 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Effacer tout l'historique
          </button>
        </div>
      </div>
    </div>
  );
};
