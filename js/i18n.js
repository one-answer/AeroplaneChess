/**
 * 国际化支持模块
 * 支持中文和英文
 */

// 默认语言
let currentLanguage = 'zh';

// 语言包
const translations = {
  zh: {
    // 通用
    appTitle: '飞行棋 Online',
    loading: '加载中...',
    confirm: '确认',
    cancel: '取消',
    yes: '是',
    no: '否',
    ok: '确定',

    // 大厅
    lobby: '游戏大厅',
    playerInfo: '玩家信息',
    yourName: '你的名字:',
    selectColor: '选择颜色:',
    gameRooms: '游戏房间',
    roomName: '房间名称',
    createRoom: '创建房间',
    refresh: '刷新',
    noRooms: '暂无房间，创建一个吧！',
    players: '玩家',

    // 等待室
    waitingRoom: '等待室',
    room: '房间',
    ready: '准备',
    notReady: '未准备',
    leaveRoom: '离开房间',

    // 游戏
    rollDice: '请投骰',
    waiting: '等待',
    yourTurn: '你的回合!',
    currentTurn: '当前回合: {color} 玩家',
    rolledSix: '你投出了6点，可以再次投骰！',
    otherRolledSix: '{color} 玩家投出了6点，可以再次投骰',
    victory: '{color} 玩家胜利!',

    // 颜色
    red: '红色',
    blue: '蓝色',
    yellow: '黄色',
    green: '绿色',

    // 错误信息
    error: '错误',
    roomNotExist: '房间不存在',
    roomFull: '房间已满',
    colorTaken: '颜色已被选择',
    nameRequired: '请输入你的名字',
    colorRequired: '请选择一个颜色',
    roomNameRequired: '请输入房间名称',
    notYourTurn: '不是你的回合',

    // 提示
    refreshTip: '刷新房间列表',
    createRoomTip: '创建一个新房间',
    leaveRoomTip: '离开当前房间',
    readyTip: '准备开始游戏',
    diceRollTip: '点击骰子投掷',
    toggleThemeTip: '切换主题',
    lightTheme: '明亮主题',
    darkTheme: '暗黑主题',

    // 确认框
    confirmLeave: '确定要离开房间吗？',
    confirmRefresh: '确定要刷新页面吗？刷新后页面数据将被清除！',
    confirmClose: '确定关闭吗？'
  },
  en: {
    // Common
    appTitle: 'Aeroplane Chess Online',
    loading: 'Loading...',
    confirm: 'Confirm',
    cancel: 'Cancel',
    yes: 'Yes',
    no: 'No',
    ok: 'OK',

    // Lobby
    lobby: 'Game Lobby',
    playerInfo: 'Player Information',
    yourName: 'Your Name:',
    selectColor: 'Select Color:',
    gameRooms: 'Game Rooms',
    roomName: 'Room Name',
    createRoom: 'Create Room',
    refresh: 'Refresh',
    noRooms: 'No rooms available. Create one!',
    players: 'Players',

    // Waiting Room
    waitingRoom: 'Waiting Room',
    room: 'Room',
    ready: 'Ready',
    notReady: 'Not Ready',
    leaveRoom: 'Leave Room',

    // Game
    rollDice: 'Roll Dice',
    waiting: 'Waiting',
    yourTurn: 'Your Turn!',
    currentTurn: '{color} Player\'s Turn',
    rolledSix: 'You rolled a 6, roll again!',
    otherRolledSix: '{color} player rolled a 6, can roll again',
    victory: '{color} player wins!',

    // Colors
    red: 'Red',
    blue: 'Blue',
    yellow: 'Yellow',
    green: 'Green',

    // Error Messages
    error: 'Error',
    roomNotExist: 'Room does not exist',
    roomFull: 'Room is full',
    colorTaken: 'Color already taken',
    nameRequired: 'Please enter your name',
    colorRequired: 'Please select a color',
    roomNameRequired: 'Please enter a room name',
    notYourTurn: 'Not your turn',

    // Tips
    refreshTip: 'Refresh room list',
    createRoomTip: 'Create a new room',
    leaveRoomTip: 'Leave current room',
    readyTip: 'Ready to start the game',
    diceRollTip: 'Click dice to roll',
    toggleThemeTip: 'Toggle theme',
    lightTheme: 'Light theme',
    darkTheme: 'Dark theme',

    // Confirmation
    confirmLeave: 'Are you sure you want to leave the room?',
    confirmRefresh: 'Are you sure you want to refresh the page? All data will be lost!',
    confirmClose: 'Are you sure you want to close?'
  }
};

/**
 * 获取翻译文本
 * @param {string} key - 翻译键
 * @param {Object} params - 替换参数
 * @returns {string} 翻译后的文本
 */
function t(key, params = {}) {
  // 获取当前语言的翻译
  const translation = translations[currentLanguage][key] || translations.zh[key] || key;

  // 替换参数
  if (params && Object.keys(params).length > 0) {
    return Object.keys(params).reduce((text, param) => {
      return text.replace(new RegExp(`{${param}}`, 'g'), params[param]);
    }, translation);
  }

  return translation;
}

/**
 * 切换语言
 * @param {string} lang - 语言代码 ('zh' 或 'en')
 */
function setLanguage(lang) {
  if (translations[lang]) {
    currentLanguage = lang;
    // 保存语言设置到本地存储
    localStorage.setItem('language', lang);
    // 更新页面上的所有文本
    updatePageTexts();
    return true;
  }
  return false;
}

/**
 * 获取当前语言
 * @returns {string} 当前语言代码
 */
function getLanguage() {
  return currentLanguage;
}

/**
 * 初始化语言设置
 */
function initLanguage() {
  // 从本地存储中获取语言设置
  const savedLang = localStorage.getItem('language');
  if (savedLang && translations[savedLang]) {
    currentLanguage = savedLang;
  } else {
    // 如果没有保存的语言设置，尝试检测浏览器语言
    const browserLang = navigator.language || navigator.userLanguage;
    if (browserLang && browserLang.startsWith('en')) {
      currentLanguage = 'en';
    } else {
      currentLanguage = 'zh'; // 默认中文
    }
    localStorage.setItem('language', currentLanguage);
  }
}

/**
 * 更新页面上的所有文本
 */
function updatePageTexts() {
  // 更新页面标题
  document.title = t('appTitle');

  // 更新所有带有 data-i18n 属性的元素
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    if (key) {
      element.textContent = t(key);
    }
  });

  // 更新所有带有 data-i18n-placeholder 属性的输入元素
  document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
    const key = element.getAttribute('data-i18n-placeholder');
    if (key) {
      element.placeholder = t(key);
    }
  });

  // 更新所有带有 data-i18n-title 属性的元素
  document.querySelectorAll('[data-i18n-title]').forEach(element => {
    const key = element.getAttribute('data-i18n-title');
    if (key) {
      element.title = t(key);
    }
  });
}

/**
 * 添加语言选择器到页面
 */
function addLanguageSelector() {
  // 如果已经存在语言选择器，则不重复添加
  if (document.querySelector('.language-selector')) {
    return;
  }

  // 检查是否已存在顶部控制栏
  let topControls = document.querySelector('.top-controls');

  // 如果不存在，创建顶部控制栏
  if (!topControls) {
    topControls = document.createElement('div');
    topControls.className = 'top-controls';
    document.body.appendChild(topControls);
  }

  // 创建语言选择器容器
  const selector = document.createElement('div');
  selector.className = 'language-selector';

  // 添加中文按钮
  const zhBtn = document.createElement('button');
  zhBtn.className = 'language-btn' + (currentLanguage === 'zh' ? ' active' : '');
  zhBtn.textContent = '中文';
  zhBtn.onclick = () => {
    setLanguage('zh');
    document.querySelectorAll('.language-btn').forEach(btn => btn.classList.remove('active'));
    zhBtn.classList.add('active');
  };

  // 添加英文按钮
  const enBtn = document.createElement('button');
  enBtn.className = 'language-btn' + (currentLanguage === 'en' ? ' active' : '');
  enBtn.textContent = 'English';
  enBtn.onclick = () => {
    setLanguage('en');
    document.querySelectorAll('.language-btn').forEach(btn => btn.classList.remove('active'));
    enBtn.classList.add('active');
  };

  // 将按钮添加到选择器
  selector.appendChild(zhBtn);
  selector.appendChild(enBtn);

  // 将选择器添加到顶部控制栏
  topControls.appendChild(selector);
}

// 导出函数
window.i18n = {
  t,
  setLanguage,
  getLanguage,
  initLanguage,
  updatePageTexts,
  addLanguageSelector
};
