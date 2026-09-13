import React from 'react';
import {
  Sparkles,
  Compass,
  Atom,
  Landmark,
  Palette,
  Shuffle,
  HelpCircle,
} from 'lucide-react';

interface QuickPromptsProps {
  onSelectPrompt: (prompt: string) => void;
  onRandomArticle: () => void;
  isLoadingRandom?: boolean;
}

export const QuickPrompts: React.FC<QuickPromptsProps> = ({
  onSelectPrompt,
  onRandomArticle,
  isLoadingRandom = false,
}) => {
  const categories = [
    {
      title: 'Sciences & Univers',
      icon: Atom,
      color: 'from-blue-500 to-cyan-500',
      textColor: 'text-blue-600 dark:text-blue-400',
      borderColor: 'border-blue-200 dark:border-blue-900/50',
      bgColor: 'bg-blue-50/50 dark:bg-blue-950/20',
      topics: ['Système solaire', 'Trous noirs', 'ADN', 'Photosynthèse'],
    },
    {
      title: 'Histoire & Monuments',
      icon: Landmark,
      color: 'from-amber-500 to-orange-500',
      textColor: 'text-amber-600 dark:text-amber-400',
      borderColor: 'border-amber-200 dark:border-amber-900/50',
      bgColor: 'bg-amber-50/50 dark:bg-amber-950/20',
      topics: ['Tour Eiffel', 'Révolution française', 'Pyramides de Gizeh', 'Château de Versailles'],
    },
    {
      title: 'Art, Culture & Tech',
      icon: Palette,
      color: 'from-purple-500 to-pink-500',
      textColor: 'text-purple-600 dark:text-purple-400',
      borderColor: 'border-purple-200 dark:border-purple-900/50',
      bgColor: 'bg-purple-50/50 dark:bg-purple-950/20',
      topics: ['Intelligence artificielle', 'Impressionnisme', 'Marie Curie', 'Léonard de Vinci'],
    },
  ];

  return (
    <div className="max-w-2xl mx-auto py-8 sm:py-12 px-4 space-y-6 sm:space-y-8 animate-fade-in">
      {/* Welcome Hero */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
          <span>Encyclopédie libre & universelle</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Que souhaitez-vous explorer ?
        </h2>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-lg mx-auto">
          Posez n'importe quelle question sur une personne, un lieu, une invention
          ou un concept. WikiBot recherche instantanément le savoir sur Wikipédia.
        </p>
      </div>

      {/* Random Article Callout */}
      <div className="flex justify-center">
        <button
          onClick={onRandomArticle}
          disabled={isLoadingRandom}
          className="group inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white font-semibold text-sm shadow-md shadow-indigo-500/25 hover:shadow-lg hover:shadow-indigo-500/35 hover:scale-[1.02] active:scale-[0.99] transition-all disabled:opacity-50"
        >
          <Shuffle className={`w-4 h-4 ${isLoadingRandom ? 'animate-spin' : 'group-hover:rotate-45 transition-transform'}`} />
          <span>{isLoadingRandom ? 'Recherche d’un article...' : 'Découvrir un article au hasard'}</span>
        </button>
      </div>

      {/* Category Suggestion Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4 pt-2">
        {categories.map((cat, idx) => {
          const Icon = cat.icon;
          return (
            <div
              key={idx}
              className={`p-4 rounded-2xl border ${cat.borderColor} ${cat.bgColor} backdrop-blur-xs space-y-3`}
            >
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg bg-white dark:bg-slate-900 shadow-xs ${cat.textColor}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  {cat.title}
                </h3>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {cat.topics.map((topic, tIdx) => (
                  <button
                    key={tIdx}
                    onClick={() => onSelectPrompt(topic)}
                    className="text-left px-2.5 py-1.5 rounded-xl text-xs font-medium bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-300 transition-all hover:scale-102 shadow-xs"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Help hint */}
      <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 text-center">
        <HelpCircle className="w-3.5 h-3.5" />
        <span>Astuce : Vous pouvez poser des questions en français courant (ex: "Qui est Marie Curie ?")</span>
      </div>
    </div>
  );
};
