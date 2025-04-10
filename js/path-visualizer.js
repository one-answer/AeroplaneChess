/**
 * 飞行棋路径可视化工具
 * 这个脚本用于增强飞行棋游戏中的路径可见性
 */

// 路径可视化器对象
const PathVisualizer = {
    // 配置
    config: {
        enabled: true,
        showMarkers: true,
        showLines: true,
        showCurrentPlayerOnly: false
    },

    // 路径坐标缓存
    pathCoordinates: {},

    // 初始化
    init: function() {
        console.log('初始化路径可视化器...');
        this.createControls();
        this.setupEventListeners();

        // 在游戏开始时生成路径标记
        if (this.config.enabled) {
            this.generatePathMarkers();
        }
    },

    // 创建控制面板
    createControls: function() {
        // 获取翻译函数（如果可用）
        const t = window.i18n ? window.i18n.t : (key) => key;

        const controls = document.createElement('div');
        controls.className = 'path-controls';
        controls.innerHTML = `
            <div class="path-toggle">
                <input type="checkbox" id="path-toggle-main" ${this.config.enabled ? 'checked' : ''}>
                <label for="path-toggle-main" data-i18n="showPath">${t('showPath')}</label>
            </div>
            <div class="path-toggle">
                <input type="checkbox" id="path-toggle-markers" ${this.config.showMarkers ? 'checked' : ''}>
                <label for="path-toggle-markers" data-i18n="showPathMarkers">${t('showPathMarkers')}</label>
            </div>
            <div class="path-toggle">
                <input type="checkbox" id="path-toggle-lines" ${this.config.showLines ? 'checked' : ''}>
                <label for="path-toggle-lines" data-i18n="showPathLines">${t('showPathLines')}</label>
            </div>
            <div class="path-toggle">
                <input type="checkbox" id="path-toggle-current" ${this.config.showCurrentPlayerOnly ? 'checked' : ''}>
                <label for="path-toggle-current" data-i18n="showCurrentPlayerOnly">${t('showCurrentPlayerOnly')}</label>
            </div>
        `;

        document.querySelector('.main').appendChild(controls);
    },

    // 设置事件监听器
    setupEventListeners: function() {
        // 主开关
        document.getElementById('path-toggle-main').addEventListener('change', (e) => {
            this.config.enabled = e.target.checked;
            this.updateVisibility();
        });

        // 路径点开关
        document.getElementById('path-toggle-markers').addEventListener('change', (e) => {
            this.config.showMarkers = e.target.checked;
            this.updateVisibility();
        });

        // 连接线开关
        document.getElementById('path-toggle-lines').addEventListener('change', (e) => {
            this.config.showLines = e.target.checked;
            this.updateVisibility();
        });

        // 仅显示当前玩家开关
        document.getElementById('path-toggle-current').addEventListener('change', (e) => {
            this.config.showCurrentPlayerOnly = e.target.checked;
            this.updateVisibility();
        });
    },

    // 更新可见性
    updateVisibility: function() {
        // 路径点可见性
        const markers = document.querySelectorAll('.path-marker');
        markers.forEach(marker => {
            const isCurrentPlayer = marker.classList.contains(planeOption.currentUser);
            const shouldShow = this.config.enabled && this.config.showMarkers &&
                              (!this.config.showCurrentPlayerOnly || isCurrentPlayer);
            marker.style.display = shouldShow ? 'block' : 'none';
        });

        // 连接线可见性
        const lines = document.querySelectorAll('.path-line');
        lines.forEach(line => {
            const isCurrentPlayer = line.classList.contains(planeOption.currentUser);
            const shouldShow = this.config.enabled && this.config.showLines &&
                              (!this.config.showCurrentPlayerOnly || isCurrentPlayer);
            line.style.display = shouldShow ? 'block' : 'none';
        });
    },

    // 生成路径标记
    generatePathMarkers: function() {
        console.log('生成路径标记...');
        const main = document.querySelector('.main');

        // 清除现有标记
        document.querySelectorAll('.path-marker, .path-line').forEach(el => el.remove());

        // 获取所有坐标点
        const allCoords = [];
        for (let i = 0; i < 100; i++) {
            const coord = selectCoordValue(i);
            if (coord) {
                allCoords.push({id: i, ...coord});
            }
        }

        // 缓存坐标
        this.pathCoordinates = allCoords.reduce((acc, coord) => {
            acc[coord.id] = coord;
            return acc;
        }, {});

        // 创建路径标记
        const colors = ['red', 'blue', 'yellow', 'green'];
        colors.forEach(color => {
            // 获取该颜色的路径
            const path = this.getPathForColor(color);

            // 创建路径点
            path.forEach(coordId => {
                const coord = this.pathCoordinates[coordId];
                if (coord) {
                    // 创建标记
                    const marker = document.createElement('div');
                    marker.className = `path-marker ${color}`;
                    marker.style.top = `${coord.top + 15}px`; // 加上15px使其对准坐标中心
                    marker.style.left = `${coord.left + 15}px`; // 加上15px使其对准坐标中心
                    marker.setAttribute('data-coord-id', coordId);
                    main.appendChild(marker);
                }
            });

            // 创建连接线
            for (let i = 0; i < path.length - 1; i++) {
                const start = this.pathCoordinates[path[i]];
                const end = this.pathCoordinates[path[i + 1]];

                if (start && end) {
                    this.createLine(start, end, color);
                }
            }
        });

        // 初始更新可见性
        this.updateVisibility();
    },

    // 创建连接线
    createLine: function(start, end, color) {
        const main = document.querySelector('.main');

        // 计算线的长度和角度
        const dx = end.left - start.left;
        const dy = end.top - start.top;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;

        // 创建线元素
        const line = document.createElement('div');
        line.className = `path-line ${color}`;
        line.style.width = `${length}px`;
        line.style.left = `${start.left + 15}px`; // 加15是为了从标记中心开始
        line.style.top = `${start.top + 15}px`; // 加15是为了从标记中心开始
        line.style.transform = `rotate(${angle}deg)`;

        main.appendChild(line);
    },

    // 获取特定颜色的路径
    getPathForColor: function(color) {
        // 这里定义每种颜色的路径
        // 注意：这些路径需要根据实际游戏的坐标系统进行调整
        const paths = {
            red: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52],
            blue: [14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
            yellow: [27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26],
            green: [40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39]
        };

        return paths[color] || [];
    },

    // 高亮当前玩家路径
    highlightCurrentPlayerPath: function() {
        // 移除所有当前高亮
        document.querySelectorAll('.path-marker.current').forEach(el => {
            el.classList.remove('current');
        });

        // 高亮当前玩家路径
        const currentPlayer = planeOption.currentUser;
        document.querySelectorAll(`.path-marker.${currentPlayer}`).forEach(el => {
            el.classList.add('current');
        });

        // 更新可见性
        this.updateVisibility();
    },

    // 高亮可移动位置
    highlightPossibleMoves: function(planeElement, steps) {
        // 获取当前飞机的坐标ID
        const currentCoordId = parseInt(planeElement.getAttribute('coordId'));
        const planeColor = planeElement.getAttribute('type');

        // 获取该颜色的路径
        const path = this.getPathForColor(planeColor);

        // 找到当前坐标在路径中的索引
        const currentIndex = path.indexOf(currentCoordId);
        if (currentIndex === -1) return;

        // 计算目标位置
        const targetIndex = (currentIndex + steps) % path.length;
        const targetCoordId = path[targetIndex];

        // 高亮目标位置
        const targetMarker = document.querySelector(`.path-marker[data-coord-id="${targetCoordId}"]`);
        if (targetMarker) {
            // 根据飞机颜色设置高亮样式
            let highlightColor;
            switch(planeColor) {
                case 'red': highlightColor = 'rgba(255, 77, 109, 0.3)'; break;
                case 'blue': highlightColor = 'rgba(76, 201, 240, 0.3)'; break;
                case 'yellow': highlightColor = 'rgba(255, 209, 102, 0.3)'; break;
                case 'green': highlightColor = 'rgba(6, 214, 160, 0.3)'; break;
                default: highlightColor = 'rgba(255, 255, 255, 0.3)';
            }

            // 设置高亮样式，使用更加微妙的效果
            targetMarker.style.backgroundColor = highlightColor;
            targetMarker.style.transform = 'translate(-50%, -50%) scale(1.2)';
            targetMarker.style.boxShadow = `0 0 8px ${highlightColor}`;
            targetMarker.style.borderStyle = 'solid';
            targetMarker.style.borderWidth = '2px';

            // 3秒后恢复，减少时间以避免干扰
            setTimeout(() => {
                targetMarker.style.backgroundColor = '';
                targetMarker.style.transform = 'translate(-50%, -50%)';
                targetMarker.style.boxShadow = '';
                targetMarker.style.borderStyle = '';
                targetMarker.style.borderWidth = '';
            }, 3000);
        }
    }
};

// 在文档加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 等待游戏初始化完成
    const initInterval = setInterval(() => {
        if (typeof planeOption !== 'undefined' && document.querySelector('.main')) {
            clearInterval(initInterval);
            PathVisualizer.init();

            // 监听当前玩家变化
            const originalNextUser = nextUser;
            window.nextUser = function() {
                originalNextUser.apply(this, arguments);
                PathVisualizer.highlightCurrentPlayerPath();
            };

            // 监听骰子点数变化
            const originalOnComplete = onComplete;
            window.onComplete = function($el, active) {
                originalOnComplete.apply(this, arguments);

                // 如果是当前玩家的回合，高亮可能的移动位置
                if (isMyTurn) {
                    const planes = document.querySelectorAll(`.plane[type="${planeOption.currentUser}"]`);
                    planes.forEach(plane => {
                        PathVisualizer.highlightPossibleMoves(plane, diceNum);
                    });
                }
            };
        }
    }, 500);
});
