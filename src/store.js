// store.js
import { defineStore } from 'pinia';

export const useMainStore = defineStore('main', {

    state: () => ({
        lang: 'en',
        isMobile: false,

    }),
    actions: {
        // 设置当前 route 路径

        // 设置移动模式
        setIsMobile(payload) {
            this.isMobile = payload;
        },

        // 从本地存储加载用户偏好设置
        loadPreferences() {
         
        },
    }
});