import { createI18n } from 'vue-i18n';
import en from './locales/en.json';
import zh from './locales/zh.json';

const messages = {
  en,
  zh
};

function setLanguage() {
  let locale = 'en';
  let lang = localStorage.getItem('locale');
  if (lang != null){
    // 如果用户更改了 lang，则优先使用用户的
    return lang
  }
  const browserLanguage = navigator.language || navigator.userLanguage;
  const bl = browserLanguage.substring(0, 2);
  if (['en', 'zh',].includes(bl)) {
    locale = bl;
  } else {
    locale = 'en';
  }

  return locale;
}


const i18n = createI18n({
  legacy: false,  // 禁用 legacy API
  locale: setLanguage(),   // 默认语言
  fallbackLocale: 'en', // 回退语言
  messages
});

export default i18n;
