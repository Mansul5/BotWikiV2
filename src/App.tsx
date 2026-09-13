import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { HistorySidebar } from './components/HistorySidebar';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { QuickPrompts } from './components/QuickPrompts';
import { SettingsModal } from './components/SettingsModal';
import { Message, ChatSession, UserSettings } from './types';
import { searchWikipedia, getRandomArticle } from './services/wikipedia';
import { Sparkles, Trash2, Bot } from 'lucide-react';

const STORAGE_KEY_SESSIONS = 'wikibot_chat_sessions_v2';
const STORAGE_KEY_SETTINGS = 'wikibot_user_settings_v2';

const createDefaultSession = (): ChatSession => {
  const now = Date.now();
  return {
    id: `session_${now}`,
    title: 'Nouvelle discussion',
    createdAt: now,
    updatedAt: now,
    messages: [
      {
        id: `msg_${now}`,
        role: 'bot',
        content: 'Salut ! Je suis WikiBot, votre assistant connecté à Wikipédia. Posez-moi une question ou explorez un sujet fascinant ci-dessous !',
        timestamp: now,
      },
    ],
  };
};

export default function App() {
  // 1. Settings state with localStorage
  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Erreur lecture réglages:', e);
    }
    // Default theme check: prefers dark
    const prefersDark =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;

    return {
      preserveHistory: true,
      language: 'fr',
      theme: prefersDark ? 'dark' : 'light',
      fontSize: 'normal',
    };
  });

  // 2. Chat sessions with localStorage
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SESSIONS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Erreur lecture sessions:', e);
    }
    return [createDefaultSession()];
  });

  const [currentSessionId, setCurrentSessionId] = useState<string>(() => {
    return sessions[0]?.id || `session_${Date.now()}`;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingRandom, setIsLoadingRandom] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync dark class on document root
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else if (settings.theme === 'light') {
      root.classList.remove('dark');
    } else {
      // System mode
      const isSysDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isSysDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [settings.theme]);

  // Persist settings
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Erreur sauvegarde réglages:', e);
    }
  }, [settings]);

  // Persist sessions if preserveHistory is true
  useEffect(() => {
    if (settings.preserveHistory) {
      try {
        localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
      } catch (e) {
        console.error('Erreur sauvegarde historique:', e);
      }
    }
  }, [sessions, settings.preserveHistory]);

  const currentSession =
    sessions.find((s) => s.id === currentSessionId) || sessions[0];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages, isLoading]);

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const handleNewChat = () => {
    const newSession = createDefaultSession();
    setSessions((prev) => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setIsHistoryOpen(false);
  };

  const handleDeleteSession = (sessionId: string) => {
    setSessions((prev) => {
      const remaining = prev.filter((s) => s.id !== sessionId);
      if (remaining.length === 0) {
        const fresh = createDefaultSession();
        setCurrentSessionId(fresh.id);
        return [fresh];
      }
      if (currentSessionId === sessionId) {
        setCurrentSessionId(remaining[0].id);
      }
      return remaining;
    });
  };

  const handleClearAllSessions = () => {
    const fresh = createDefaultSession();
    setSessions([fresh]);
    setCurrentSessionId(fresh.id);
    if (settings.preserveHistory) {
      localStorage.removeItem(STORAGE_KEY_SESSIONS);
    }
  };

  const handleSendMessage = async (queryText: string) => {
    if (!queryText.trim() || isLoading) return;

    const userMsgId = `user_${Date.now()}`;
    const userMessage: Message = {
      id: userMsgId,
      role: 'user',
      content: queryText.trim(),
      timestamp: Date.now(),
    };

    // Update session title if it's the first real question
    const updatedTitle =
      currentSession.messages.length <= 1
        ? queryText.length > 25
          ? `${queryText.substring(0, 25)}...`
          : queryText
        : currentSession.title;

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === currentSessionId) {
          return {
            ...s,
            title: updatedTitle,
            updatedAt: Date.now(),
            messages: [...s.messages, userMessage],
          };
        }
        return s;
      })
    );

    setIsLoading(true);

    try {
      const wikiData = await searchWikipedia(queryText, settings.language);

      const botMessage: Message = {
        id: `bot_${Date.now()}`,
        role: 'bot',
        content: wikiData.extract,
        timestamp: Date.now(),
        wikipediaData: wikiData,
      };

      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === currentSessionId) {
            return {
              ...s,
              title: wikiData.title || updatedTitle,
              updatedAt: Date.now(),
              messages: [...s.messages, botMessage],
            };
          }
          return s;
        })
      );
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : "Désolé, je n'ai pas pu trouver d'informations sur ce sujet.";

      const botErrorMessage: Message = {
        id: `bot_err_${Date.now()}`,
        role: 'bot',
        content: `Désolé, ${errorMsg}. Essayez avec un autre mot-clé ou vérifiez l'orthographe.`,
        timestamp: Date.now(),
        isError: true,
      };

      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === currentSessionId) {
            return {
              ...s,
              updatedAt: Date.now(),
              messages: [...s.messages, botErrorMessage],
            };
          }
          return s;
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRandomArticle = async () => {
    if (isLoading || isLoadingRandom) return;

    setIsLoadingRandom(true);
    try {
      const randomData = await getRandomArticle(settings.language);

      const userMsg: Message = {
        id: `user_rand_${Date.now()}`,
        role: 'user',
        content: `🎲 Découverte aléatoire : ${randomData.title}`,
        timestamp: Date.now(),
      };

      const botMsg: Message = {
        id: `bot_rand_${Date.now()}`,
        role: 'bot',
        content: randomData.extract,
        timestamp: Date.now(),
        wikipediaData: randomData,
      };

      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === currentSessionId) {
            return {
              ...s,
              title: randomData.title,
              updatedAt: Date.now(),
              messages: [...s.messages, userMsg, botMsg],
            };
          }
          return s;
        })
      );
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingRandom(false);
    }
  };

  const handleExportHistory = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(sessions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `wikibot-historique-${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const isInitialChat = currentSession.messages.length <= 1;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 selection:bg-indigo-500 selection:text-white font-sans">
      {/* Top Navigation */}
      <Header
        settings={settings}
        onUpdateSettings={updateSettings}
        onToggleHistory={() => setIsHistoryOpen((prev) => !prev)}
        isHistoryOpen={isHistoryOpen}
        historyCount={sessions.length}
        onNewChat={handleNewChat}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 flex flex-col max-w-4xl w-full mx-auto px-3 sm:px-6 relative">
        {/* Messages list */}
        <div
          id="chat-messages-container"
          className="flex-1 py-4 sm:py-6 overflow-y-auto space-y-4"
        >
          {isInitialChat ? (
            <QuickPrompts
              onSelectPrompt={handleSendMessage}
              onRandomArticle={handleRandomArticle}
              isLoadingRandom={isLoadingRandom}
            />
          ) : (
            <div className="space-y-4">
              {currentSession.messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  onSelectTopic={handleSendMessage}
                  onRetry={handleSendMessage}
                />
              ))}

              {/* Typing indicator */}
              {isLoading && (
                <div className="flex items-center gap-3 my-4 animate-pulse">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-pink-500 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-indigo-500/20">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-2xl rounded-tl-xs shadow-xs flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300">
                      WikiBot consulte Wikipédia
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="sticky bottom-0 z-20 pb-2 sm:pb-4 pt-1 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent dark:from-slate-950 dark:via-slate-950">
          <ChatInput
            onSendMessage={handleSendMessage}
            isLoading={isLoading || isLoadingRandom}
            onRandomArticle={handleRandomArticle}
          />
        </div>
      </main>

      {/* History Sidebar */}
      <HistorySidebar
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={setCurrentSessionId}
        onDeleteSession={handleDeleteSession}
        onClearAllSessions={handleClearAllSessions}
        settings={settings}
        onUpdateSettings={updateSettings}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={updateSettings}
        totalSavedSessions={sessions.length}
        onClearHistory={handleClearAllSessions}
        onExportHistory={handleExportHistory}
      />
    </div>
  );
}
