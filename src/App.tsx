import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LanguageProvider, useLanguage } from '@/context/LanguageContext';
import ChatScreen from '@/components/ChatScreen';
import RecipeScreen from '@/components/RecipeScreen';
import type { UserPreferences } from '@/components/ChatScreen';

function LanguageToggle({ className = '' }: { className?: string }) {
  const { lang, toggleLang } = useLanguage();

  return (
    <div className={`z-50 ${className}`}>
      <div className="flex rounded-full border-2 border-[#1C1C1E] bg-white overflow-hidden"
        style={{ boxShadow: '2px 2px 0px #1C1C1E' }}
      >
        <button
          onClick={toggleLang}
          className={`px-3 py-1.5 text-xs font-bold transition-all ${
            lang === 'en' ? 'bg-[#FF3B30] text-white' : 'bg-white text-[#1C1C1E] hover:bg-[#F9F9F7]'
          }`}
        >
          EN
        </button>
        <button
          onClick={toggleLang}
          className={`px-3 py-1.5 text-xs font-bold transition-all ${
            lang === 'ru' ? 'bg-[#FF3B30] text-white' : 'bg-white text-[#1C1C1E] hover:bg-[#F9F9F7]'
          }`}
        >
          RU
        </button>
      </div>
    </div>
  );
}

type Screen = 'chat' | 'recipes';

function AppContent() {
  const [screen, setScreen] = useState<Screen>('chat');
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);

  const handleFindRecipes = useCallback((userPrefs: UserPreferences) => {
    setPrefs(userPrefs);
    setScreen('recipes');
  }, []);

  const handleBack = useCallback(() => {
    setScreen('chat');
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#1C1C1E] md:flex md:items-center md:justify-center md:p-8">
      {/* Desktop wrapper - phone frame */}
      <div className="relative w-full md:max-w-[430px] md:h-[850px] h-screen overflow-hidden bg-[#F9F9F7] md:rounded-[40px] md:border-[3px] md:border-[#333] md:shadow-2xl">
        {/* Language toggle */}
        <div className="absolute top-3 right-3 z-50">
          <LanguageToggle />
        </div>

        <AnimatePresence mode="wait">
          {screen === 'chat' ? (
            <motion.div
              key="chat"
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="h-full"
            >
              <ChatScreen onFindRecipes={handleFindRecipes} />
            </motion.div>
          ) : (
            prefs && (
              <motion.div
                key="recipes"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 40 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="h-full overflow-y-auto"
              >
                <RecipeScreen prefs={prefs} onBack={handleBack} />
              </motion.div>
            )
          )}
        </AnimatePresence>

        {/* Desktop notch indicator */}
        <div className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#333] rounded-b-2xl z-50" />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
