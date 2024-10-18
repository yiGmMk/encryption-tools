
// main.ts
import { createApp } from 'vue'
import './assets/base.css'
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css'
import { analytics } from './utils/use-analytics';
import App from './App.vue'
// 统一导入el-icon图标
import * as ElIconModules from '@element-plus/icons-vue'
import i18n from './i18n';
import enLocale from 'element-plus/es/locale/lang/en';
import zhLocale from 'element-plus/es/locale/lang/zh-cn';

import router from './router'


router.beforeEach((to, from, next) => {
    const defaultTitle = 'dazheng.site';  // 默认标题
    document.title = to.meta.title + ' | ' + defaultTitle;  // 设置标题
    next();
  });



const app = createApp(App)


// 启动 Google Analytics
analytics.page();
app.config.globalProperties.$analytics = analytics;

// 注册全局事件跟踪函数，改造完程序后移除
app.config.globalProperties.$trackEvent = function (category, action, label) {
    analytics.track(action, {
        category: category,
        label: label,
    });
};

// 根据当前语言选择Element Plus的语言包
app.use(ElementPlus, {
  locale: i18n.global.locale === 'zh' ? zhLocale : enLocale
});

app.use(i18n);
for (const iconName in ElIconModules) {
    app.component(iconName, ElIconModules[iconName])
}
app.use(router)
app.mount('#app')