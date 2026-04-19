import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Minus, Plus, ChefHat, ArrowRight, X, Search } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { CATEGORIES, ALL_INGREDIENTS, MOOD_TO_INGREDIENTS } from '@/data/recipes';

interface ChatMessage {
  id: string;
  type: 'system' | 'user';
  content: string;
}

export interface UserPreferences {
  mood: string | null;
  dishType: string | null;
  time: number | null;
  servings: number;
  ingredients: string[];
}

interface ChatScreenProps {
  onFindRecipes: (prefs: UserPreferences) => void;
}

const STEP_MOOD = 0;
const STEP_DISH = 1;
const STEP_TIME = 2;
const STEP_SERVINGS = 3;
const STEP_INGREDIENTS = 4;

export default function ChatScreen({ onFindRecipes }: ChatScreenProps) {
  const { lang, t } = useLanguage();
  const [step, setStep] = useState(STEP_MOOD);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [prefs, setPrefs] = useState<UserPreferences>({
    mood: null, dishType: null, time: null, servings: 2, ingredients: [],
  });
  const [showModal, setShowModal] = useState<string | null>(null);
  const [ingSearch, setIngSearch] = useState('');
  const [customIng, setCustomIng] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, isTyping, showModal]);

  useEffect(() => {
    const timer = setTimeout(() => {
      addSystemMessage(t('chat.moodQuestion') as string);
      setShowModal('mood');
    }, 400);
    return () => clearTimeout(timer);
  }, [lang]);

  function addSystemMessage(content: string) {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { id: Date.now().toString(), type: 'system', content }]);
    }, 500);
  }

  function addUserMessage(content: string) {
    setMessages(prev => [...prev, { id: Date.now().toString(), type: 'user', content }]);
  }

  function handleMoodSelect(mood: string) {
    const label = t(`moods.${mood}`) as string;
    addUserMessage(label);
    setPrefs(p => ({ ...p, mood }));
    setShowModal(null);
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      addSystemMessage(t('chat.dishQuestion') as string);
      setShowModal('dish');
      setStep(STEP_DISH);
    }, 600);
  }

  function handleDishSelect(dishType: string) {
    const label = t(`dishTypes.${dishType}`) as string;
    addUserMessage(label);
    setPrefs(p => ({ ...p, dishType }));
    setShowModal(null);
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      addSystemMessage(t('chat.timeQuestion') as string);
      setShowModal('time');
      setStep(STEP_TIME);
    }, 600);
  }

  function handleTimeSelect(time: number) {
    const timeLabel = `${time} ${t('recipe.min')}`;
    addUserMessage(timeLabel);
    setPrefs(p => ({ ...p, time }));
    setShowModal(null);
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      addSystemMessage(t('chat.servingsQuestion') as string);
      setShowModal('servings');
      setStep(STEP_SERVINGS);
    }, 600);
  }

  function handleServingsConfirm() {
    const servingsText = `${prefs.servings} ${prefs.servings === 1 ? t('servings.person') : t('servings.people')}`;
    addUserMessage(servingsText);
    setShowModal(null);
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      addSystemMessage(t('chat.ingredientsQuestion') as string);
      setStep(STEP_INGREDIENTS);
    }, 600);
  }

  function toggleIngredient(ing: string) {
    setPrefs(p => {
      const has = p.ingredients.includes(ing);
      return { ...p, ingredients: has ? p.ingredients.filter(i => i !== ing) : [...p.ingredients, ing] };
    });
  }

  function addCustomIngredient() {
    const val = customIng.trim().toLowerCase();
    if (val && !prefs.ingredients.includes(val)) {
      setPrefs(p => ({ ...p, ingredients: [...p.ingredients, val] }));
      setCustomIng('');
    }
  }

  function getSuggestedIngredients(): string[] {
    if (!prefs.mood) return [];
    const suggestions = MOOD_TO_INGREDIENTS[prefs.mood] || [];
    return suggestions.filter(s => !prefs.ingredients.includes(s));
  }

  const filteredIngredients = ingSearch.length > 0
    ? ALL_INGREDIENTS.filter(i => i.n.toLowerCase().includes(ingSearch.toLowerCase()) && !prefs.ingredients.includes(i.n)).slice(0, 20)
    : [];

  const servingsLabel = prefs.servings === 1 ? t('servings.person') : t('servings.people');

  // Mood options
  const moodOptions = ['italian', 'american', 'asian', 'indian', 'mexican', 'mediterranean', 'french', 'any'];
  const dishOptions = ['main', 'quick', 'healthy', 'breakfast', 'snack', 'dessert', 'soup', 'other'];
  const otherOptions = ['pizza', 'pasta', 'sushi', 'tacos', 'burger', 'salad', 'curry', 'sandwich', 'noodles', 'steak'];
  const timeOptions = [15, 20, 30, 45, 60, 90];

  return (
    <div className="h-full flex flex-col bg-[#F9F9F7] relative">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b-2 border-[#1C1C1E] px-4 py-3.5 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full border-2 border-[#1C1C1E] bg-[#FFCC00] flex items-center justify-center">
            <ChefHat size={26} strokeWidth={2.5} className="text-[#1C1C1E]" />
          </div>
          <div>
            <span className="font-bangers text-xl tracking-wide text-[#1C1C1E] block">FAMILY CHEF</span>
            <span className="text-xs font-semibold text-[#1C1C1E]/40">{t('app.tagline')}</span>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex items-start gap-3 slide-in-up">
            <div className="w-11 h-11 rounded-full border-2 border-[#1C1C1E] overflow-hidden flex-shrink-0 bg-white">
              <img src="/chef-avatar.png" alt="Chef" className="w-full h-full object-cover" />
            </div>
            <div className="chat-bubble-system px-5 py-3.5 max-w-[80%]">
              <p className="text-base font-bold text-[#1C1C1E]">{t('app.tagline')}</p>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id}>
            {msg.type === 'system' ? (
              <div className="flex items-start gap-3 slide-in-up">
                <div className="w-11 h-11 rounded-full border-2 border-[#1C1C1E] overflow-hidden flex-shrink-0 bg-white">
                  <img src="/chef-avatar.png" alt="Chef" className="w-full h-full object-cover" />
                </div>
                <div className="chat-bubble-system px-5 py-3.5 inline-block max-w-[80%]">
                  <p className="text-base font-bold text-[#1C1C1E]">{msg.content}</p>
                </div>
              </div>
            ) : (
              <div className="flex justify-end slide-in-up">
                <div className="chat-bubble-user px-5 py-3.5 max-w-[75%]">
                  <p className="text-base font-bold">{msg.content}</p>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-full border-2 border-[#1C1C1E] overflow-hidden flex-shrink-0 bg-white">
              <img src="/chef-avatar.png" alt="Chef" className="w-full h-full object-cover" />
            </div>
            <div className="chat-bubble-system px-5 py-3.5">
              <div className="flex gap-1.5">
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ══════════ POPUP MODALS ══════════ */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm z-40 flex items-end justify-center"
            onClick={() => setShowModal(null)}
          >
            <motion.div
              initial={{ y: 300 }}
              animate={{ y: 0 }}
              exit={{ y: 300 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white rounded-t-3xl border-t-2 border-x-2 border-[#1C1C1E] w-full max-h-[70%] overflow-y-auto no-scrollbar"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-12 h-1.5 rounded-full bg-[#1C1C1E]/20" />
              </div>

              {/* MOOD MODAL */}
              {showModal === 'mood' && (
                <div className="px-5 pb-8 pt-2">
                  <h3 className="font-bangers text-2xl text-[#1C1C1E] mb-4 text-center tracking-wide">{t('chat.moodQuestion')}</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {moodOptions.map(opt => (
                      <button key={opt} onClick={() => handleMoodSelect(opt)}
                        className="pop-btn py-4 px-4 rounded-2xl border-2 border-[#1C1C1E] bg-white text-base font-bold text-[#1C1C1E] hover:bg-[#FFCC00] transition-colors text-center">
                        {t(`moods.${opt}`)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* DISH MODAL */}
              {showModal === 'dish' && (
                <div className="px-5 pb-8 pt-2">
                  <h3 className="font-bangers text-2xl text-[#1C1C1E] mb-4 text-center tracking-wide">{t('chat.dishQuestion')}</h3>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {dishOptions.map(opt => (
                      <button key={opt} onClick={() => opt === 'other' ? setShowModal('other') : handleDishSelect(opt)}
                        className="pop-btn py-4 px-4 rounded-2xl border-2 border-[#1C1C1E] bg-white text-base font-bold text-[#1C1C1E] hover:bg-[#0055FF] hover:text-white transition-colors text-center">
                        {t(`dishTypes.${opt}`)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* OTHER OPTIONS MODAL */}
              {showModal === 'other' && (
                <div className="px-5 pb-8 pt-2">
                  <div className="flex items-center gap-2 mb-4">
                    <button onClick={() => setShowModal('dish')} className="pop-btn w-10 h-10 rounded-full border-2 border-[#1C1C1E] flex items-center justify-center">
                      <ArrowRight size={18} className="rotate-180" />
                    </button>
                    <h3 className="font-bangers text-xl text-[#1C1C1E] tracking-wide">{t('chat.moreOptions')}</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {otherOptions.map(opt => (
                      <button key={opt} onClick={() => handleDishSelect(opt)}
                        className="pop-btn py-4 px-4 rounded-2xl border-2 border-[#1C1C1E] bg-white text-base font-bold text-[#1C1C1E] hover:bg-[#0055FF] hover:text-white transition-colors text-center">
                        {t(`otherOptions.${opt}`)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* TIME MODAL */}
              {showModal === 'time' && (
                <div className="px-5 pb-8 pt-2">
                  <h3 className="font-bangers text-2xl text-[#1C1C1E] mb-4 text-center tracking-wide">{t('chat.timeQuestion')}</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {timeOptions.map(tval => (
                      <button key={tval} onClick={() => handleTimeSelect(tval)}
                        className="pop-btn py-5 rounded-2xl border-2 border-[#1C1C1E] bg-white text-lg font-bold text-[#1C1C1E] hover:bg-[#0055FF] hover:text-white transition-colors">
                        {tval < 60 ? tval : '60+'}
                        <span className="block text-xs font-medium opacity-60">{t('recipe.min')}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* SERVINGS MODAL */}
              {showModal === 'servings' && (
                <div className="px-5 pb-8 pt-2">
                  <h3 className="font-bangers text-2xl text-[#1C1C1E] mb-6 text-center tracking-wide">{t('chat.servingsQuestion')}</h3>
                  <div className="flex items-center justify-center gap-6 mb-6">
                    <button onClick={() => setPrefs(p => ({ ...p, servings: Math.max(1, p.servings - 1) }))}
                      className="pop-btn w-14 h-14 rounded-full border-2 border-[#1C1C1E] bg-[#F9F9F7] flex items-center justify-center">
                      <Minus size={24} strokeWidth={2.5} />
                    </button>
                    <div className="text-center min-w-[100px]">
                      <div className="font-bangers text-5xl text-[#1C1C1E]">{prefs.servings}</div>
                      <div className="text-sm font-bold text-[#1C1C1E] opacity-50">{servingsLabel}</div>
                    </div>
                    <button onClick={() => setPrefs(p => ({ ...p, servings: Math.min(12, p.servings + 1) }))}
                      className="pop-btn w-14 h-14 rounded-full border-2 border-[#1C1C1E] bg-[#F9F9F7] flex items-center justify-center">
                      <Plus size={24} strokeWidth={2.5} />
                    </button>
                  </div>
                  <button onClick={handleServingsConfirm}
                    className="pop-btn w-full py-4 bg-[#FFCC00] border-2 border-[#1C1C1E] rounded-2xl font-bangers text-xl text-[#1C1C1E] tracking-wide"
                    style={{ boxShadow: '3px 3px 0px #1C1C1E' }}>
                    OK ✓
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════ INGREDIENTS STEP (inline, not modal) ══════════ */}
      {step === STEP_INGREDIENTS && !showModal && (
        <div className="flex-shrink-0 bg-white border-t-2 border-[#1C1C1E] px-4 py-4 space-y-4 max-h-[50vh] overflow-y-auto no-scrollbar">
          {/* Search */}
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1C1C1E] opacity-40" />
            <input
              type="text"
              value={ingSearch}
              onChange={e => setIngSearch(e.target.value)}
              placeholder={t('chat.searchPlaceholder') as string}
              className="w-full pl-12 pr-4 py-3.5 border-2 border-[#1C1C1E] rounded-2xl bg-white text-base font-bold focus:outline-none focus:ring-2 focus:ring-[#FF3B30]"
            />
          </div>

          {/* Suggested */}
          {getSuggestedIngredients().length > 0 && ingSearch.length === 0 && (
            <div>
              <p className="text-sm font-bold text-[#1C1C1E] mb-2 opacity-60 uppercase tracking-wider">{t('chat.suggested')}</p>
              <div className="flex flex-wrap gap-2">
                {getSuggestedIngredients().map(ing => {
                  const item = ALL_INGREDIENTS.find(i => i.n === ing);
                  const isSelected = prefs.ingredients.includes(ing);
                  return item ? (
                    <button key={ing} onClick={() => toggleIngredient(ing)}
                      className={`pop-btn px-3 py-2 rounded-xl border-2 border-[#1C1C1E] text-sm font-bold transition-all ${isSelected ? 'bg-[#FF3B30] text-white' : 'bg-white text-[#1C1C1E] hover:bg-[#FFCC00]'}`}>
                      {item.e} {t(`ingredients.${ing}`)}
                    </button>
                  ) : null;
                })}
              </div>
            </div>
          )}

          {/* Search Results */}
          {ingSearch.length > 0 && filteredIngredients.length > 0 && (
            <div className="max-h-40 overflow-y-auto no-scrollbar space-y-1">
              {filteredIngredients.map(item => (
                <button key={item.n} onClick={() => { toggleIngredient(item.n); setIngSearch(''); }}
                  className="pop-btn w-full text-left px-4 py-3 rounded-xl border border-[#1C1C1E]/10 bg-white hover:bg-[#FFCC00] text-base font-bold flex items-center gap-3">
                  <span className="text-xl">{item.e}</span>
                  <span>{t(`ingredients.${item.n}`)}</span>
                </button>
              ))}
            </div>
          )}

          {/* Category Select */}
          {ingSearch.length === 0 && (
            <div className="space-y-3">
              {Object.entries(CATEGORIES).map(([cat, items]) => (
                <div key={cat}>
                  <p className="text-sm font-bold text-[#1C1C1E] mb-1.5 opacity-40 uppercase tracking-wider">{cat}</p>
                  <div className="flex flex-wrap gap-2">
                    {items.slice(0, 8).map(item => {
                      const isSelected = prefs.ingredients.includes(item.n);
                      return (
                        <button key={item.n} onClick={() => toggleIngredient(item.n)}
                          className={`pop-btn px-2.5 py-1.5 rounded-lg border-2 border-[#1C1C1E] text-sm font-bold transition-all ${isSelected ? 'bg-[#FF3B30] text-white' : 'bg-white text-[#1C1C1E] hover:bg-[#F9F9F7]'}`}>
                          {item.e} {t(`ingredients.${item.n}`)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Custom Add */}
          <div className="flex gap-2">
            <input type="text" value={customIng} onChange={e => setCustomIng(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addCustomIngredient()}
              placeholder={t('chat.customAdd') as string}
              className="flex-1 px-4 py-3 border-2 border-[#1C1C1E] rounded-2xl bg-white text-base font-bold focus:outline-none focus:ring-2 focus:ring-[#FF3B30]" />
            <button onClick={addCustomIngredient}
              className="pop-btn w-12 h-12 rounded-full border-2 border-[#1C1C1E] bg-[#FF3B30] text-white flex items-center justify-center flex-shrink-0">
              <Plus size={20} strokeWidth={2.5} />
            </button>
          </div>

          {/* Selected Chips */}
          {prefs.ingredients.length > 0 && (
            <div>
              <p className="text-sm font-bold text-[#1C1C1E] mb-2 opacity-60 uppercase tracking-wider">{t('chat.selected')}</p>
              <div className="flex flex-wrap gap-2">
                <AnimatePresence>
                  {prefs.ingredients.map(ing => {
                    const item = ALL_INGREDIENTS.find(i => i.n === ing);
                    return (
                      <motion.span key={ing} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}
                        className="ingredient-chip inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#FFCC00] border-2 border-[#1C1C1E] text-sm font-bold text-[#1C1C1E]">
                        {item?.e || '🍽️'} {t(`ingredients.${ing}`) || ing}
                        <button onClick={() => toggleIngredient(ing)} className="ml-1 hover:opacity-60"><X size={14} strokeWidth={3} /></button>
                      </motion.span>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Find Recipes CTA */}
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => onFindRecipes(prefs)}
            className="w-full py-5 bg-[#FF3B30] border-2 border-[#1C1C1E] rounded-2xl font-bangers text-2xl text-white tracking-wide sticky bottom-0"
            style={{ boxShadow: '4px 4px 0px #1C1C1E' }}>
            <span className="flex items-center justify-center gap-3">
              {t('chat.findRecipes')} <Send size={22} strokeWidth={2.5} />
            </span>
          </motion.button>
        </div>
      )}
    </div>
  );
}
