/**
 * 主题管理模块
 * 支持明亮和暗黑主题切换
 */

// 当前主题
let currentTheme = 'light';

/**
 * 初始化主题
 */
function initTheme() {
    // 从本地存储中获取主题设置
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        currentTheme = savedTheme;
    } else {
        // 如果没有保存的主题设置，尝试检测系统主题
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            currentTheme = 'dark';
        } else {
            currentTheme = 'light';
        }
        localStorage.setItem('theme', currentTheme);
    }

    // 应用主题
    applyTheme(currentTheme);

    // 添加主题切换按钮
    addThemeToggle();
}

/**
 * 应用主题
 * @param {string} theme - 主题名称 ('light' 或 'dark')
 */
function applyTheme(theme) {
    if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.removeAttribute('data-theme');
    }
    currentTheme = theme;
}

/**
 * 切换主题
 */
function toggleTheme() {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeToggleIcon(newTheme);
}

/**
 * 更新主题切换按钮图标
 * @param {string} theme - 当前主题
 */
function updateThemeToggleIcon(theme) {
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        const icon = themeToggle.querySelector('i');
        if (icon) {
            if (theme === 'dark') {
                icon.className = 'fas fa-sun';
            } else {
                icon.className = 'fas fa-moon';
            }
        }
    }
}

/**
 * 添加主题切换按钮
 */
function addThemeToggle() {
    // 获取翻译函数（如果可用）
    const t = window.i18n ? window.i18n.t : (key) => key;

    // 检查是否已存在顶部控制栏
    let topControls = document.querySelector('.top-controls');

    // 如果不存在，创建顶部控制栏
    if (!topControls) {
        topControls = document.createElement('div');
        topControls.className = 'top-controls';
        document.body.appendChild(topControls);
    }

    // 检查是否已存在主题切换按钮
    if (!document.querySelector('.theme-toggle')) {
        // 创建主题切换按钮
        const themeToggle = document.createElement('div');
        themeToggle.className = 'theme-toggle';
        themeToggle.title = t('toggleThemeTip');
        themeToggle.setAttribute('data-i18n-title', 'toggleThemeTip');

        // 添加图标
        const icon = document.createElement('i');
        icon.className = currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        themeToggle.appendChild(icon);

        // 添加点击事件
        themeToggle.addEventListener('click', toggleTheme);

        // 将按钮添加到顶部控制栏
        topControls.appendChild(themeToggle);
    }
}

// 导出函数
window.theme = {
    init: initTheme,
    toggle: toggleTheme,
    apply: applyTheme
};
