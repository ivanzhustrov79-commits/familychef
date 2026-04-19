import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Clock, Users, Check, X, ChefHat, Lightbulb } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { COUNTRY_FLAGS, COUNTRY_NAMES } from '@/data/recipes';
import type { RecipeMatch } from './RecipeScreen';

interface RecipeCardProps {
  match: RecipeMatch;
  index: number;
}

export default function RecipeCard({ match, index }: RecipeCardProps) {
  const { lang, t } = useLanguage();
  const [expanded, setExpanded] = useState(false);
  const { recipe, missingIngredients, feedback } = match;

  const flag = COUNTRY_FLAGS[recipe.country] || '🌍';
  const countryName = COUNTRY_NAMES[recipe.country]?.[lang] || recipe.country;
  const displayName = lang === 'ru' ? recipe.nameRu : recipe.name;
  const displayTip = lang === 'ru' ? recipe.tipRu : recipe.tip;
  const hasMissing = missingIngredients.length > 0;

  // Determine border color based on match quality
  const borderClass = match.matchScore >= 80 && match.timeDiff === 0
    ? 'comic-border'
    : match.matchScore >= 60
    ? 'comic-border-yellow'
    : 'comic-border-blue';

  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className={`relative bg-white rounded-2xl ${borderClass} overflow-hidden`}
    >
      {/* Flag Badge - oversized breaking out */}
      <div className="flag-badge" style={{ top: '-10px', left: '-6px', width: '48px', height: '48px', fontSize: '26px' }}>
        {flag}
      </div>

      {/* Feedback Badges */}
      {feedback.length > 0 && (
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5 items-end">
          {feedback.map((fb, i) => (
            <span
              key={i}
              className={`feedback-badge wobble ${
                fb.includes('READY') || fb.includes('ГОТОВ') ? 'bg-[#34C759] text-white' :
                fb.includes('BUY') || fb.includes('КУПИ') ? 'bg-[#FF3B30] text-white' :
                fb.includes('QUICK') || fb.includes('БЫСТРО') ? 'bg-[#FF9500] text-white' :
                fb.includes('ALMOST') || fb.includes('ПОЧТИ') ? 'bg-[#AF52DE] text-white' :
                'bg-[#0055FF] text-white'
              }`}
            >
              {fb}
            </span>
          ))}
        </div>
      )}

      {/* Recipe Image */}
      <div className="relative h-52 overflow-hidden">
        <img
          src={recipe.image}
          alt={displayName}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-4 right-4">
          <h3 className="font-bangers text-2xl text-white tracking-wide drop-shadow-lg leading-tight">
            {displayName}
          </h3>
          <p className="text-xs font-bold text-white/70 mt-0.5">{countryName}</p>
        </div>
      </div>

      {/* Info Bar */}
      <div className="flex items-center gap-4 px-4 py-3 border-b-2 border-[#1C1C1E]/10">
        <div className="flex items-center gap-1.5 text-sm font-bold text-[#1C1C1E]">
          <Clock size={16} strokeWidth={2.5} className="text-[#FF3B30]" />
          {recipe.time} {t('recipe.min')}
        </div>
        <div className="flex items-center gap-1.5 text-sm font-bold text-[#1C1C1E]">
          <Users size={16} strokeWidth={2.5} className="text-[#0055FF]" />
          {recipe.servings} {t('recipe.servings')}
        </div>
        <div className="flex items-center gap-1 ml-auto">
          {recipe.tags.slice(0, 2).map(tag => (
            <span key={tag} className="px-2 py-0.5 rounded-full bg-[#FFCC00] border border-[#1C1C1E] text-xs font-bold">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Ingredients Preview */}
      <div className="px-4 py-3">
        <div className="flex flex-wrap gap-1.5">
          {recipe.ingredients.slice(0, 6).map(ing => {
            const isMissing = missingIngredients.includes(ing);
            return (
              <span
                key={ing}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold border ${
                  isMissing
                    ? 'bg-[#F9F9F7] border-[#1C1C1E]/20 text-[#1C1C1E]/50'
                    : 'bg-[#34C759]/10 border-[#34C759] text-[#34C759]'
                }`}
              >
                {isMissing ? <X size={10} /> : <Check size={10} />}
                {t(`ingredients.${ing}`) || ing}
              </span>
            );
          })}
          {recipe.ingredients.length > 6 && (
            <span className="px-2 py-1 text-xs font-bold text-[#1C1C1E]/40">
              +{recipe.ingredients.length - 6} {lang === 'ru' ? 'ещё' : 'more'}
            </span>
          )}
        </div>
      </div>

      {/* Expand Toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-center gap-2 py-3 border-t-2 border-[#1C1C1E]/10 hover:bg-[#F9F9F7] transition-colors"
      >
        <span className="text-sm font-bold text-[#1C1C1E]">
          {expanded ? (lang === 'ru' ? 'Скрыть' : 'Hide') : t('recipe.tapToExpand')}
        </span>
        <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={18} strokeWidth={2.5} />
        </motion.div>
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4">
              {/* Full Ingredient List */}
              <div>
                <h4 className="font-bangers text-lg text-[#1C1C1E] mb-2 flex items-center gap-2">
                  <span>📋</span> {t('recipe.ingredients')}
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {recipe.ingredients.map(ing => {
                    const isMissing = missingIngredients.includes(ing);
                    return (
                      <div
                        key={ing}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-bold ${
                          isMissing
                            ? 'bg-[#F9F9F7] border-[#1C1C1E]/10 text-[#1C1C1E]/50'
                            : 'bg-[#34C759]/10 border-[#34C759]/30 text-[#1C1C1E]'
                        }`}
                      >
                        {isMissing ? (
                          <X size={12} className="text-[#FF3B30] flex-shrink-0" />
                        ) : (
                          <Check size={12} className="text-[#34C759] flex-shrink-0" />
                        )}
                        {t(`ingredients.${ing}`) || ing}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Steps */}
              <div>
                <h4 className="font-bangers text-lg text-[#1C1C1E] mb-3 flex items-center gap-2">
                  <ChefHat size={18} strokeWidth={2.5} className="text-[#FF3B30]" />
                  {t('recipe.steps')}
                </h4>
                <div className="space-y-4">
                  {recipe.steps.map((step, i) => (
                    <div key={i} className="relative pl-8">
                      {/* Step number line */}
                      {i < recipe.steps.length - 1 && <div className="step-line" />}

                      {/* Step icon */}
                      <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-[#FFCC00] border-2 border-[#1C1C1E] flex items-center justify-center text-sm z-10">
                        {step.ic}
                      </div>

                      {/* Step content */}
                      <div className="bg-[#F9F9F7] rounded-xl p-3 border border-[#1C1C1E]/10">
                        <p className="text-sm font-bold text-[#1C1C1E] leading-relaxed">
                          {lang === 'ru' ? step.dRu : step.d}
                        </p>
                        {step.t && (
                          <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full bg-[#0055FF]/10 text-[#0055FF] text-xs font-bold">
                            ⏱ {step.t}
                          </span>
                        )}
                        {/* Chef hint */}
                        <div className="mt-2 flex items-start gap-1.5">
                          <Lightbulb size={12} className="text-[#FF9500] flex-shrink-0 mt-0.5" />
                          <p className="text-xs font-semibold text-[#FF9500]">
                            {lang === 'ru' ? step.hRu : step.h}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chef Tip */}
              {displayTip && (
                <div className="bg-gradient-to-r from-[#FFCC00]/20 to-[#FF9500]/20 rounded-xl p-4 border-2 border-[#FFCC00]">
                  <div className="flex items-center gap-2 mb-1">
                    <ChefHat size={16} strokeWidth={2.5} className="text-[#FF3B30]" />
                    <span className="font-bangers text-sm text-[#1C1C1E]">{t('recipe.chefTip')}</span>
                  </div>
                  <p className="text-sm font-bold text-[#1C1C1E] leading-relaxed">{displayTip}</p>
                </div>
              )}

              {/* Missing Ingredients CTA */}
              {hasMissing && (
                <div className="bg-[#FF3B30]/10 rounded-xl p-3 border-2 border-[#FF3B30]/30">
                  <p className="text-xs font-bold text-[#FF3B30] uppercase tracking-wider mb-1.5">
                    {lang === 'ru' ? 'Нужно купить' : 'Need to buy'}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {missingIngredients.map(ing => (
                      <span key={ing} className="px-2 py-1 rounded-lg bg-white border border-[#FF3B30]/30 text-xs font-bold text-[#FF3B30]">
                        🛒 {t(`ingredients.${ing}`) || ing}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
