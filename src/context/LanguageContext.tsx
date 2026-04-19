import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export type Language = 'en' | 'ru';

interface LanguageContextType {
  lang: Language;
  toggleLang: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>('en');

  const toggleLang = useCallback(() => {
    setLang(prev => prev === 'en' ? 'ru' : 'en');
  }, []);

  const t = useCallback((key: string): string => {
    const keys = key.split('.');
    let value: unknown = translations[lang];
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        return key;
      }
    }
    return typeof value === 'string' ? value : key;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}

const translations: Record<Language, Record<string, unknown>> = {
  en: {
    app: {
      name: 'FAMILY CHEF',
      tagline: 'What\'s cooking today?',
    },
    lang: {
      en: 'EN',
      ru: 'RU',
    },
    chat: {
      moodQuestion: 'Hey there! What cuisine are you in the mood for?',
      dishQuestion: 'What kind of meal are you thinking?',
      timeQuestion: 'How much time do you have?',
      servingsQuestion: 'How many people are we feeding?',
      ingredientsQuestion: 'What do you have in the kitchen?',
      findRecipes: 'FIND MY RECIPES!',
      typing: 'Chef is thinking...',
      otherOption: 'Other...',
      moreOptions: 'More options',
      searchPlaceholder: 'Type to search ingredients...',
      selected: 'Selected:',
      suggested: 'Suggested based on your choices:',
      customAdd: 'Add your own',
    },
    moods: {
      italian: 'Italian',
      american: 'American',
      asian: 'Asian',
      indian: 'Indian',
      mexican: 'Mexican',
      mediterranean: 'Mediterranean',
      french: 'French',
      any: 'Surprise Me!',
    },
    dishTypes: {
      main: 'Main Dish',
      quick: 'Quick Lunch',
      healthy: 'Healthy',
      breakfast: 'Breakfast',
      snack: 'Snack',
      dessert: 'Dessert',
      soup: 'Soup',
      other: 'Other...',
    },
    otherOptions: {
      pizza: 'Pizza',
      pasta: 'Pasta',
      sushi: 'Sushi',
      tacos: 'Tacos',
      burger: 'Burger',
      salad: 'Salad',
      curry: 'Curry',
      sandwich: 'Sandwich',
      noodles: 'Noodles',
      steak: 'Steak',
    },
    time: {
      min15: '15 min',
      min20: '20 min',
      min30: '30 min',
      min45: '45 min',
      min60: '1 hour',
      more: '1 hour+',
    },
    servings: {
      person: 'person',
      people: 'people',
    },
    recipe: {
      perfectMatch: 'PERFECT MATCHES',
      flexible: 'FLEXIBLE OPTIONS',
      ingredients: 'Ingredients',
      steps: 'Steps',
      chefTip: 'Chef Tip',
      min: 'min',
      servings: 'servings',
      ready: 'Ready to cook!',
      needsMoreTime: '+{n} MINS MORE!',
      buyIngredient: 'BUY {item}!',
      quickFix: 'QUICK FIX!',
      almostThere: 'ALMOST THERE!',
      noMatches: 'No perfect matches found',
      noMatchesHint: 'Try selecting different ingredients or more time',
      back: 'Back',
      cookMode: 'Cook Mode',
      stepOf: 'Step {current} of {total}',
      tapToExpand: 'Tap to see recipe',
    },
    ingredients: {
      // Veggies
      tomato: 'Tomato', potato: 'Potato', broccoli: 'Broccoli', 'bell pepper': 'Bell Pepper',
      spinach: 'Spinach', onion: 'Onion', zucchini: 'Zucchini', carrot: 'Carrot',
      mushrooms: 'Mushrooms', corn: 'Corn', garlic: 'Garlic', eggplant: 'Eggplant',
      cabbage: 'Cabbage', peas: 'Peas', 'sweet potato': 'Sweet Potato', cauliflower: 'Cauliflower',
      leek: 'Leek', celery: 'Celery', asparagus: 'Asparagus', kale: 'Kale',
      // Protein
      chicken: 'Chicken', 'ground beef': 'Ground Beef', eggs: 'Eggs', tofu: 'Tofu',
      shrimp: 'Shrimp', sausage: 'Sausage', beans: 'Beans', tuna: 'Tuna',
      salmon: 'Salmon', pork: 'Pork', lamb: 'Lamb', lentils: 'Lentils',
      chickpeas: 'Chickpeas', bacon: 'Bacon', turkey: 'Turkey', ham: 'Ham',
      // Grains
      rice: 'Rice', pasta: 'Pasta', quinoa: 'Quinoa', oatmeal: 'Oatmeal',
      couscous: 'Couscous', barley: 'Barley', noodles: 'Noodles', polenta: 'Polenta',
      // Bread
      bread: 'Bread', tortilla: 'Tortilla', pita: 'Pita', baguette: 'Baguette',
      'crescent rolls': 'Crescent Rolls', 'rice paper': 'Rice Paper', crackers: 'Crackers',
      // Fruit
      apple: 'Apple', banana: 'Banana', berries: 'Berries', orange: 'Orange',
      mango: 'Mango', pineapple: 'Pineapple', lemon: 'Lemon', avocado: 'Avocado',
      peach: 'Peach', pear: 'Pear', coconut: 'Coconut', lime: 'Lime',
      // Dairy
      cheese: 'Cheese', milk: 'Milk', butter: 'Butter', yogurt: 'Yogurt',
      'cream cheese': 'Cream Cheese', 'heavy cream': 'Heavy Cream', mozzarella: 'Mozzarella', parmesan: 'Parmesan',
      // Pantry
      'tomato sauce': 'Tomato Sauce', 'soy sauce': 'Soy Sauce', honey: 'Honey', broth: 'Broth',
      salsa: 'Salsa', 'coconut milk': 'Coconut Milk', tahini: 'Tahini', 'curry paste': 'Curry Paste',
      miso: 'Miso', 'hot sauce': 'Hot Sauce', mustard: 'Mustard', vinegar: 'Vinegar',
      worcestershire: 'Worcestershire', 'peanut butter': 'Peanut Butter', chocolate: 'Chocolate',
    },
  },
  ru: {
    app: {
      name: 'FAMILY CHEF',
      tagline: 'Что приготовим сегодня?',
    },
    lang: {
      en: 'EN',
      ru: 'RU',
    },
    chat: {
      moodQuestion: 'Привет! Какая кухня тебе по душе?',
      dishQuestion: 'Что хочешь приготовить?',
      timeQuestion: 'Сколько у тебя времени?',
      servingsQuestion: 'На сколько человек готовим?',
      ingredientsQuestion: 'Что есть на кухне?',
      findRecipes: 'НАЙТИ РЕЦЕПТЫ!',
      typing: 'Шеф думает...',
      otherOption: 'Другое...',
      moreOptions: 'Больше вариантов',
      searchPlaceholder: 'Начни печатать...',
      selected: 'Выбрано:',
      suggested: 'Подборка по твоему выбору:',
      customAdd: 'Добавить свое',
    },
    moods: {
      italian: 'Итальянская',
      american: 'Американская',
      asian: 'Азиатская',
      indian: 'Индийская',
      mexican: 'Мексиканская',
      mediterranean: 'Средиземноморская',
      french: 'Французская',
      any: 'Удиви меня!',
    },
    dishTypes: {
      main: 'Главное блюдо',
      quick: 'Быстрый обед',
      healthy: 'Полезное',
      breakfast: 'Завтрак',
      snack: 'Закуска',
      dessert: 'Десерт',
      soup: 'Суп',
      other: 'Другое...',
    },
    otherOptions: {
      pizza: 'Пицца',
      pasta: 'Паста',
      sushi: 'Суши',
      tacos: 'Тако',
      burger: 'Бургер',
      salad: 'Салат',
      curry: 'Карри',
      sandwich: 'Сэндвич',
      noodles: 'Лапша',
      steak: 'Стейк',
    },
    time: {
      min15: '15 мин',
      min20: '20 мин',
      min30: '30 мин',
      min45: '45 мин',
      min60: '1 час',
      more: '1 час+',
    },
    servings: {
      person: 'человек',
      people: 'человек',
    },
    recipe: {
      perfectMatch: 'ИДЕАЛЬНЫЕ ВАРИАНТЫ',
      flexible: 'ДРУГИЕ ВАРИАНТЫ',
      ingredients: 'Ингредиенты',
      steps: 'Шаги',
      chefTip: 'Совет шефа',
      min: 'мин',
      servings: 'порций',
      ready: 'Готовить!',
      needsMoreTime: 'НУЖНО +{n} МИН!',
      buyIngredient: 'КУПИТЬ {item}!',
      quickFix: 'БЫСТРО!',
      almostThere: 'ПОЧТИ!',
      noMatches: 'Идеальных вариантов не найдено',
      noMatchesHint: 'Попробуй другие ингредиенты или больше времени',
      back: 'Назад',
      cookMode: 'Режим готовки',
      stepOf: 'Шаг {current} из {total}',
      tapToExpand: 'Нажми, чтобы открыть рецепт',
    },
    ingredients: {
      tomato: 'Помидор', potato: 'Картофель', broccoli: 'Брокколи', 'bell pepper': 'Перец',
      spinach: 'Шпинат', onion: 'Лук', zucchini: 'Кабачок', carrot: 'Морковь',
      mushrooms: 'Грибы', corn: 'Кукуруза', garlic: 'Чеснок', eggplant: 'Баклажан',
      cabbage: 'Капуста', peas: 'Горошек', 'sweet potato': 'Батат', cauliflower: 'Цветная капуста',
      leek: 'Лук-порей', celery: 'Сельдерей', asparagus: 'Спаржа', kale: 'Кале',
      chicken: 'Курица', 'ground beef': 'Фарш', eggs: 'Яйца', tofu: 'Тофу',
      shrimp: 'Креветки', sausage: 'Колбаса', beans: 'Фасоль', tuna: 'Тунец',
      salmon: 'Лосось', pork: 'Свинина', lamb: 'Баранина', lentils: 'Чечевица',
      chickpeas: 'Нут', bacon: 'Бекон', turkey: 'Индейка', ham: 'Ветчина',
      rice: 'Рис', pasta: 'Паста', quinoa: 'Киноа', oatmeal: 'Овсянка',
      couscous: 'Кускус', barley: 'Перловка', noodles: 'Лапша', polenta: 'Полента',
      bread: 'Хлеб', tortilla: 'Тортилья', pita: 'Пита', baguette: 'Багет',
      'crescent rolls': 'Круассаны', 'rice paper': 'Рисовая бумага', crackers: 'Крекеры',
      apple: 'Яблоко', banana: 'Банан', berries: 'Ягоды', orange: 'Апельсин',
      mango: 'Манго', pineapple: 'Ананас', lemon: 'Лимон', avocado: 'Авокадо',
      peach: 'Персик', pear: 'Груша', coconut: 'Кокос', lime: 'Лайм',
      cheese: 'Сыр', milk: 'Молоко', butter: 'Масло', yogurt: 'Йогурт',
      'cream cheese': 'Сливочный сыр', 'heavy cream': 'Сливки', mozzarella: 'Моцарелла', parmesan: 'Пармезан',
      'tomato sauce': 'Томатный соус', 'soy sauce': 'Соевый соус', honey: 'Мед', broth: 'Бульон',
      salsa: 'Сальса', 'coconut milk': 'Кокосовое молоко', tahini: 'Тахини', 'curry paste': 'Паста карри',
      miso: 'Мисо', 'hot sauce': 'Острый соус', mustard: 'Горчица', vinegar: 'Уксус',
      worcestershire: 'Вустерский соус', 'peanut butter': 'Арахисовая паста', chocolate: 'Шоколад',
    },
  },
};
