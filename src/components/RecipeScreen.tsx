import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ChefHat } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { RECIPES, ALWAYS } from '@/data/recipes';
import RecipeCard from './RecipeCard';
import type { UserPreferences } from './ChatScreen';
import type { Recipe } from '@/data/recipes';

interface RecipeScreenProps {
  prefs: UserPreferences;
  onBack: () => void;
}

export interface RecipeMatch {
  recipe: Recipe;
  matchScore: number;
  missingIngredients: string[];
  timeDiff: number;
  feedback: string[];
}

export default function RecipeScreen({ prefs, onBack }: RecipeScreenProps) {
  const { lang, t } = useLanguage();

  const matches = useMemo(() => {
    const results: RecipeMatch[] = [];

    for (const recipe of RECIPES) {
      // Filter by dish type
      const typeMap: Record<string, string[]> = {
        main: ['main'], quick: ['main', 'snack'], healthy: ['main', 'soup', 'salad'],
        breakfast: ['breakfast'], snack: ['snack'], dessert: ['dessert'],
        soup: ['soup'], pizza: ['main'], pasta: ['main'], sushi: ['main'],
        tacos: ['main'], burger: ['main'], salad: ['main'], curry: ['main'],
        sandwich: ['snack'], noodles: ['main'], steak: ['main'],
      };

      if (prefs.dishType) {
        const allowedTypes = typeMap[prefs.dishType];
        if (allowedTypes && !allowedTypes.includes(recipe.type)) continue;
      }

      // Check ingredients match
      const missing: string[] = [];
      for (const ing of recipe.ingredients) {
        const ingLower = ing.toLowerCase();
        if (ALWAYS.some(a => ingLower.includes(a))) continue;
        const hasIngredient = prefs.ingredients.some(ui => {
          const uiLower = ui.toLowerCase();
          return ingLower.includes(uiLower) || uiLower.includes(ingLower);
        });
        if (!hasIngredient) missing.push(ing);
      }

      // Calculate time difference
      const timeDiff = prefs.time ? Math.max(0, recipe.time - prefs.time) : 0;

      // Skip if way over time
      if (prefs.time && recipe.time > prefs.time * 1.5) continue;

      // Calculate match score
      const totalIngs = recipe.ingredients.length;
      const matchScore = ((totalIngs - missing.length) / totalIngs) * 100;

      // Generate feedback
      const feedback: string[] = [];
      if (timeDiff > 0) {
        feedback.push(t('recipe.needsMoreTime').toString().replace('{n}', String(timeDiff)));
      }
      if (missing.length === 1) {
        const item = t(`ingredients.${missing[0]}`) || missing[0];
        feedback.push(t('recipe.buyIngredient').toString().replace('{item}', item.toUpperCase()));
      } else if (missing.length === 2) {
        feedback.push(t('recipe.almostThere'));
      } else if (missing.length > 2) {
        feedback.push(`+${missing.length} ${lang === 'ru' ? 'ингр.' : 'items'}`);
      }
      if (timeDiff === 0 && missing.length === 0) {
        feedback.push(t('recipe.ready'));
      }

      results.push({ recipe, matchScore, missingIngredients: missing, timeDiff, feedback });
    }

    results.sort((a, b) => {
      if (a.matchScore !== b.matchScore) return b.matchScore - a.matchScore;
      return a.recipe.time - b.recipe.time;
    });

    return results;
  }, [prefs, lang, t]);

  const perfectMatches = matches.filter(m => m.matchScore >= 80 && m.timeDiff === 0);
  const flexibleMatches = matches.filter(m => m.matchScore < 80 || m.timeDiff > 0);

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="min-h-screen bg-[#F9F9F7]"
    >
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b-2 border-[#1C1C1E]">
        <div className="flex items-center gap-3 px-4 py-3.5">
          <button onClick={onBack}
            className="pop-btn w-11 h-11 rounded-full border-2 border-[#1C1C1E] bg-[#F9F9F7] flex items-center justify-center">
            <ArrowLeft size={20} strokeWidth={2.5} />
          </button>
          <div className="flex items-center gap-2 flex-1">
            <ChefHat size={22} strokeWidth={2.5} className="text-[#FF3B30]" />
            <span className="font-bangers text-lg tracking-wide text-[#1C1C1E]">
              {matches.length} {lang === 'ru' ? 'рецептов' : 'recipes'}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-5 space-y-6">
        {perfectMatches.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-[#34C759]" />
              <h2 className="font-bangers text-xl tracking-wider text-[#1C1C1E]">{t('recipe.perfectMatch')}</h2>
            </div>
            <div className="space-y-5">
              {perfectMatches.map((match, i) => (
                <RecipeCard key={match.recipe.id} match={match} index={i} />
              ))}
            </div>
          </div>
        )}

        {flexibleMatches.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-[#FF9500]" />
              <h2 className="font-bangers text-xl tracking-wider text-[#1C1C1E]">{t('recipe.flexible')}</h2>
            </div>
            <div className="space-y-5">
              {flexibleMatches.map((match, i) => (
                <RecipeCard key={match.recipe.id} match={match} index={i + perfectMatches.length} />
              ))}
            </div>
          </div>
        )}

        {matches.length === 0 && (
          <div className="text-center py-20">
            <div className="w-24 h-24 rounded-full border-2 border-[#1C1C1E] bg-[#FFCC00] flex items-center justify-center mx-auto mb-4">
              <ChefHat size={40} strokeWidth={2} className="text-[#1C1C1E]" />
            </div>
            <h3 className="font-bangers text-2xl text-[#1C1C1E] mb-2">{t('recipe.noMatches')}</h3>
            <p className="text-base text-[#1C1C1E]/50 font-semibold">{t('recipe.noMatchesHint')}</p>
          </div>
        )}

        <div className="h-8" />
      </div>
    </motion.div>
  );
}
