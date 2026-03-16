// main.js — финальная версия с прозрачными слоями, модальным окном переименования, защитой Background, пагинацией, кастомным фоном и красным оверлеем
(function() {
    // === Звуки ===
    const clickSoundUrl = 'sounds/click.mp3';
    const chimesSoundUrl = 'sounds/chimes.mp3';
    const chordSoundUrl = 'sounds/chord.mp3';

    let clickSound = null;
    let chimesSound = null;
    let chordSound = null;
    let soundsEnabled = true;

    function playClickSound() {
        if (!soundsEnabled) return;
        if (!clickSound) {
            clickSound = new Audio(clickSoundUrl);
            clickSound.load();
        }
        clickSound.currentTime = 0;
        clickSound.play().catch(e => console.log('Click play error:', e));
    }

    function playChimesSound() {
        if (!soundsEnabled) return;
        if (!chimesSound) {
            chimesSound = new Audio(chimesSoundUrl);
            chimesSound.load();
        }
        chimesSound.currentTime = 0;
        chimesSound.play().catch(e => console.log('Chimes play error:', e));
    }

    function playChordSound() {
        if (!soundsEnabled) return;
        if (!chordSound) {
            chordSound = new Audio(chordSoundUrl);
            chordSound.load();
        }
        chordSound.currentTime = 0;
        chordSound.play().catch(e => console.log('Chord play error:', e));
    }

    document.addEventListener('click', playClickSound);

    // === Настройки ===
    const soundsCheckbox = document.getElementById('soundsCheckbox');
    const autosaveCheckbox = document.getElementById('autosaveCheckbox');
    const themeDark = document.getElementById('themeDark');
    const themeLight = document.getElementById('themeLight');
    const wallDark = document.getElementById('wallDark');
    const wallBlue = document.getElementById('wallBlue');
    const wallGreen = document.getElementById('wallGreen');
    const wallGray = document.getElementById('wallGray');
    const wallCustom = document.getElementById('wallCustom');
    const body = document.body;
    const win95Window = document.querySelector('.win95-window');

    let originalBackground = body.style.background;
    let customWallpaperLoaded = false;

    function setWallpaper(type) {
        if (window.CustomWallpaper && typeof window.CustomWallpaper.stop === 'function') {
            window.CustomWallpaper.stop();
        }

        let gradient;
        switch(type) {
            case 'dark': gradient = 'linear-gradient(145deg, #1e1e1e 0%, #2d2d2d 100%)'; break;
            case 'blue': gradient = 'linear-gradient(145deg, #003399 0%, #3366cc 100%)'; break;
            case 'green': gradient = 'linear-gradient(145deg, #004d40 0%, #008b74 100%)'; break;
            case 'gray': gradient = 'linear-gradient(145deg, #505050 0%, #808080 100%)'; break;
            case 'custom':
                body.style.background = 'none';
                originalBackground = 'none';
                if (window.CustomWallpaper) {
                    window.CustomWallpaper.start();
                } else {
                    loadCustomWallpaperScript();
                }
                return;
            default: gradient = 'linear-gradient(145deg, #1e1e1e 0%, #2d2d2d 100%)';
        }
        body.style.background = gradient;
        originalBackground = gradient;
    }

    function loadCustomWallpaperScript() {
        if (customWallpaperLoaded) return;
        const script = document.createElement('script');
        script.src = 'custom_wallpaper.js';
        script.onload = function() {
            customWallpaperLoaded = true;
            if (window.CustomWallpaper) window.CustomWallpaper.start();
        };
        script.onerror = function() {
            console.error('Failed to load custom wallpaper');
            body.style.background = 'linear-gradient(145deg, #1e1e1e 0%, #2d2d2d 100%)';
        };
        document.head.appendChild(script);
    }

    function loadSettings() {
        const savedSounds = localStorage.getItem('soundsEnabled');
        const savedTheme = localStorage.getItem('theme');
        const savedAutosave = localStorage.getItem('autosaveEnabled');
        const savedWallpaper = localStorage.getItem('wallpaper');
        if (savedSounds !== null) {
            soundsEnabled = savedSounds === 'true';
            soundsCheckbox.checked = soundsEnabled;
        }
        if (savedTheme !== null) {
            if (savedTheme === 'dark') themeDark.checked = true;
            else themeLight.checked = true;
        }
        if (savedAutosave !== null) autosaveCheckbox.checked = savedAutosave === 'true';
        if (savedWallpaper !== null) {
            switch(savedWallpaper) {
                case 'dark': wallDark.checked = true; setWallpaper('dark'); break;
                case 'blue': wallBlue.checked = true; setWallpaper('blue'); break;
                case 'green': wallGreen.checked = true; setWallpaper('green'); break;
                case 'gray': wallGray.checked = true; setWallpaper('gray'); break;
                case 'custom': wallCustom.checked = true; setWallpaper('custom'); break;
                default: wallDark.checked = true; setWallpaper('dark');
            }
        } else {
            wallDark.checked = true;
            setWallpaper('dark');
        }
    }

    function saveSettings() {
        if (!autosaveCheckbox.checked) return;
        localStorage.setItem('soundsEnabled', soundsEnabled);
        localStorage.setItem('theme', themeDark.checked ? 'dark' : 'light');
        localStorage.setItem('autosaveEnabled', autosaveCheckbox.checked);
        let wallpaper = 'dark';
        if (wallBlue.checked) wallpaper = 'blue';
        else if (wallGreen.checked) wallpaper = 'green';
        else if (wallGray.checked) wallpaper = 'gray';
        else if (wallCustom.checked) wallpaper = 'custom';
        localStorage.setItem('wallpaper', wallpaper);
    }

    soundsCheckbox.addEventListener('change', function(e) {
        soundsEnabled = e.target.checked;
        if (autosaveCheckbox.checked) saveSettings();
    });
    themeDark.addEventListener('change', () => autosaveCheckbox.checked && saveSettings());
    themeLight.addEventListener('change', () => autosaveCheckbox.checked && saveSettings());
    wallDark.addEventListener('change', function() { setWallpaper('dark'); autosaveCheckbox.checked && saveSettings(); });
    wallBlue.addEventListener('change', function() { setWallpaper('blue'); autosaveCheckbox.checked && saveSettings(); });
    wallGreen.addEventListener('change', function() { setWallpaper('green'); autosaveCheckbox.checked && saveSettings(); });
    wallGray.addEventListener('change', function() { setWallpaper('gray'); autosaveCheckbox.checked && saveSettings(); });
    wallCustom.addEventListener('change', function() { setWallpaper('custom'); autosaveCheckbox.checked && saveSettings(); });
    autosaveCheckbox.addEventListener('change', function(e) { if (e.target.checked) saveSettings(); });
    loadSettings();

    // === Supabase клиент ===
    const SUPABASE_URL = 'https://zirkmegtqfkfvyatgbgf.supabase.co';
    const SUPABASE_ANON_KEY = 'sb_publishable_PB_s3zWbWYA-0-BtqH1M7g_7De-juWW';
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // === Гостевая книга ===
    const gbName = document.getElementById('gbName');
    const gbMessage = document.getElementById('gbMessage');
    const gbSend = document.getElementById('gbSend');
    const gbMessages = document.getElementById('gbMessages');
    
    // Пагинация гостевой книги
    let guestbookCurrentPage = 0;
    const guestbookPageSize = 5;
    let guestbookTotalMessages = 0;
    let guestbookTotalPages = 0;
    const guestbookPrevBtn = document.getElementById('guestbookPrevPageBtn');
    const guestbookNextBtn = document.getElementById('guestbookNextPageBtn');
    const guestbookPageIndicator = document.getElementById('guestbookPageIndicator');

    async function loadGuestbook(page = guestbookCurrentPage) {
        const offset = page * guestbookPageSize;
        const { data, count, error } = await supabaseClient
            .from('guestbook')
            .select('*', { count: 'exact' })
            .order('date', { ascending: false })
            .range(offset, offset + guestbookPageSize - 1);

        if (error) {
            console.error('Error loading messages:', error);
            gbMessages.innerHTML = '<p style="color: red;">Failed to load messages.</p>';
            return;
        }

        guestbookTotalMessages = count || 0;
        guestbookTotalPages = Math.ceil(guestbookTotalMessages / guestbookPageSize);
        guestbookCurrentPage = page;

        updateGuestbookPagination();
        renderMessages(data || []);
    }

    function updateGuestbookPagination() {
        if (guestbookPrevBtn && guestbookNextBtn && guestbookPageIndicator) {
            guestbookPrevBtn.disabled = guestbookCurrentPage === 0;
            guestbookNextBtn.disabled = guestbookCurrentPage >= guestbookTotalPages - 1;
            guestbookPageIndicator.textContent = `Page ${guestbookCurrentPage + 1} of ${guestbookTotalPages || 1}`;
        }
    }

    function renderMessages(messages) {
        gbMessages.innerHTML = '';
        if (!messages || messages.length === 0) {
            gbMessages.innerHTML = '<p style="color: #808080;">No messages yet. Be the first!</p>';
            return;
        }
        messages.forEach(msg => {
            const msgDiv = document.createElement('div');
            msgDiv.style.border = '2px solid #808080';
            msgDiv.style.borderRightColor = '#ffffff';
            msgDiv.style.borderBottomColor = '#ffffff';
            msgDiv.style.padding = '8px';
            msgDiv.style.marginBottom = '10px';
            msgDiv.style.backgroundColor = '#d4d0c8';
            
            const date = msg.date ? new Date(msg.date).toLocaleString() : 'Unknown date';
            msgDiv.innerHTML = `
                <div style="font-weight: bold;">${escapeHtml(msg.name)}</div>
                <div style="font-size: 11px; color: #404040;">${date}</div>
                <div style="margin-top: 5px; white-space: pre-wrap;">${escapeHtml(msg.message)}</div>
            `;
            gbMessages.appendChild(msgDiv);
        });
    }

    function escapeHtml(unsafe) {
        return unsafe.replace(/[&<>"']/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            if (m === '"') return '&quot;';
            if (m === "'") return '&#039;';
            return m;
        });
    }

    // === Капча ===
    const captchaOverlay = document.getElementById('captchaOverlay');
    const captchaModal = document.getElementById('captchaModal');
    const captchaQuestion = document.getElementById('captchaQuestion');
    const captchaAnswer = document.getElementById('captchaAnswer');
    const captchaOk = document.getElementById('captchaOk');
    const captchaCancel = document.getElementById('captchaCancel');

    let captchaNum1 = 2;
    let captchaNum2 = 3;
    let captchaResult = 5;
    let pendingAction = null;
    let pendingData = null;

    function generateCaptcha() {
        captchaNum1 = Math.floor(Math.random() * 9) + 1;
        captchaNum2 = Math.floor(Math.random() * 9) + 1;
        captchaResult = captchaNum1 + captchaNum2;
        captchaQuestion.textContent = `${captchaNum1} + ${captchaNum2} = ?`;
        captchaAnswer.value = '';
        captchaAnswer.classList.remove('error');
    }

    function openCaptcha(action, data) {
        if (captchaOverlay.style.display === 'flex') return;
        pendingAction = action;
        pendingData = data;
        generateCaptcha();
        captchaOverlay.style.display = 'flex';
        captchaAnswer.focus();
        disableBodyScroll();
    }

    function closeCaptcha() {
        captchaOverlay.style.display = 'none';
        pendingAction = null;
        pendingData = null;
        captchaAnswer.classList.remove('error');
        enableBodyScroll();
    }

    function shakeModal() {
        captchaModal.classList.add('shake-modal');
        setTimeout(() => {
            captchaModal.classList.remove('shake-modal');
        }, 300);
    }

    function triggerErrorEffect() {
        playChordSound();
        win95Window.classList.add('error-effect');
        
        // Красный оверлей под окном, над фоном
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(255, 0, 0, 0.3)';
        overlay.style.zIndex = '1500';
        overlay.style.pointerEvents = 'none';
        document.body.appendChild(overlay);
        
        setTimeout(() => {
            win95Window.classList.remove('error-effect');
            overlay.remove();
        }, 300);
    }

    captchaOk.addEventListener('click', () => {
        const answer = parseInt(captchaAnswer.value.trim(), 10);
        if (isNaN(answer) || answer !== captchaResult) {
            triggerErrorEffect();
            shakeModal();
            captchaAnswer.classList.add('error');
            generateCaptcha();
            return;
        }
        playChimesSound();
        if (pendingAction) {
            pendingAction(pendingData);
        }
        closeCaptcha();
    });

    captchaCancel.addEventListener('click', closeCaptcha);
    captchaOverlay.addEventListener('click', (e) => {
        if (e.target === captchaOverlay) closeCaptcha();
    });

    // === Отправка сообщения (гостевая книга) ===
    async function performSendGuestbook(data) {
        const { name, message } = data;
        const { error } = await supabaseClient.from('guestbook').insert([{ name, message }]);
        if (error) {
            console.error('Error sending message:', error);
            triggerErrorEffect();
        } else {
            gbName.value = '';
            gbMessage.value = '';
            guestbookCurrentPage = 0;
            await loadGuestbook(0);
        }
    }

    gbSend.addEventListener('click', (e) => {
        e.preventDefault();
        const name = gbName.value.trim();
        const message = gbMessage.value.trim();
        if (!name || !message) {
            triggerErrorEffect();
            return;
        }
        openCaptcha(performSendGuestbook, { name, message });
    });

    // === Друзья ===
    async function loadFriends() {
        const container = document.getElementById('friends-container');
        const fallbackFriends = [];
        let friends = [];
        try {
            const response = await fetch('friends.json');
            if (response.ok) {
                friends = await response.json();
            } else {
                friends = fallbackFriends;
            }
        } catch (e) {
            friends = fallbackFriends;
        }

        if (friends.length === 0) {
            container.innerHTML = '<p style="color: red; text-align: center;">No friends available.</p>';
        } else {
            container.innerHTML = '<ul style="list-style: none; padding: 0;">' + 
                friends.map(f => `<li style="margin-bottom: 8px;">👤 <strong>${escapeHtml(f.name)}</strong> — ICQ: ${escapeHtml(f.icq)}</li>`).join('') +
                '</ul>';
        }
    }

    // === Галерея (замена Projects) ===
    let galleryData = null;           // весь загруженный JSON
    let currentGalleryPath = '';      // текущий путь (пустая строка — корень)
    const galleryContainer = document.getElementById('gallery-container');
    const galleryBreadcrumbs = document.getElementById('gallery-breadcrumbs');

    async function loadGallery(path = '') {
        if (!galleryData) {
            try {
                const response = await fetch('gallery.php'); // <-- вместо gallery-structure.json
                if (!response.ok) throw new Error('Failed to load gallery data');
                galleryData = await response.json();
            } catch (e) {
                console.error('Error loading gallery:', e);
                galleryContainer.innerHTML = '<p style="color: red;">Failed to load gallery.</p>';
                return;
            }
        }

        // Навигация по пути: разбиваем строку (например, "папка1/папка2")
        const parts = path ? path.split('/').filter(p => p) : [];
        let currentLevel = galleryData;
        for (const part of parts) {
            if (currentLevel[part]) {
                currentLevel = currentLevel[part];
            } else {
                // если путь неверный, показываем корень
                currentLevel = galleryData;
                currentGalleryPath = '';
                break;
            }
        }

        currentGalleryPath = path;

        // Строим хлебные крошки
        renderBreadcrumbs(parts);

        // Если в текущем уровне есть папки и/или файлы
        const folders = [];
        const files = [];
        for (const key in currentLevel) {
            if (typeof currentLevel[key] === 'object' && !Array.isArray(currentLevel[key])) {
                // это папка (объект с вложенными полями)
                folders.push({ name: key, data: currentLevel[key] });
            } else if (Array.isArray(currentLevel[key])) {
                // это массив файлов (например, "images": [ ... ]) — можно обработать как файлы
                // но в нашей структуре будем хранить файлы отдельно?
                // Предположим структуру: { "папка1": { "images": [...], "подпапка2": {...} } }
                // Если ключ === "images", то это массив картинок
                if (key === 'images') {
                    files.push(...currentLevel[key]);
                } else {
                    // иначе считаем, что это массив картинок прямо на этом уровне
                    files.push(...currentLevel[key]);
                }
            } else if (typeof currentLevel[key] === 'string') {
                // возможно, это прямо ссылка на картинку (если структура плоская)
                files.push({ name: key, src: currentLevel[key] });
            }
        }

        renderGallery(folders, files);
    }

    function renderBreadcrumbs(parts) {
        if (!galleryBreadcrumbs) return;
        let html = '<span class="breadcrumb" data-path="">📁 Root</span>';
        let accumulatedPath = '';
        parts.forEach((part, index) => {
            accumulatedPath += (index === 0 ? '' : '/') + part;
            html += ` > <span class="breadcrumb" data-path="${accumulatedPath}">${part}</span>`;
        });
        galleryBreadcrumbs.innerHTML = html;

        // Добавляем обработчики на хлебные крошки
        document.querySelectorAll('.breadcrumb').forEach(el => {
            el.addEventListener('click', (e) => {
                e.preventDefault();
                const path = el.dataset.path;
                loadGallery(path);
            });
            el.style.cursor = 'pointer';
            el.style.textDecoration = 'underline';
            el.style.color = '#000080';
        });
    }

    function renderGallery(folders, files) {
        if (!galleryContainer) return;
        galleryContainer.innerHTML = '';

        if (folders.length === 0 && files.length === 0) {
            galleryContainer.innerHTML = '<p style="color: #808080;">Empty folder.</p>';
            return;
        }

        // Сетка (аналогично проектам)
        folders.forEach(folder => {
            const div = document.createElement('div');
            div.className = 'project-item'; // переиспользуем стиль
            div.innerHTML = `
                <div class="project-cover" style="background: #808080; display: flex; align-items: center; justify-content: center; font-size: 24px;">📁</div>
                <div class="project-title">${escapeHtml(folder.name)}</div>
                <div class="project-desc">Folder</div>
                <button class="project-button open-folder" data-path="${currentGalleryPath ? currentGalleryPath + '/' + folder.name : folder.name}">Open</button>
            `;
            galleryContainer.appendChild(div);
        });

        files.forEach(file => {
            // file может быть строкой (путь к картинке) или объектом с name, src
            const src = typeof file === 'string' ? file : file.src;
            const name = typeof file === 'string' ? src.split('/').pop() : (file.name || 'Image');
            const div = document.createElement('div');
            div.className = 'project-item';
            div.innerHTML = `
                <div class="project-cover"><img src="${escapeHtml(src)}" alt="${escapeHtml(name)}" style="width: 100%; height: 100%; object-fit: cover;"></div>
                <div class="project-title">${escapeHtml(name)}</div>
                <div class="project-desc">Image</div>
                <button class="project-button view-image" data-src="${escapeHtml(src)}">View</button>
            `;
            galleryContainer.appendChild(div);
        });

        // Обработчики для кнопок открытия папок
        document.querySelectorAll('.open-folder').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const path = btn.dataset.path;
                loadGallery(path);
            });
        });

        // Обработчики для просмотра изображений (можно открывать в той же модалке, что и рисунки Paint)
        document.querySelectorAll('.view-image').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const src = btn.dataset.src;
                // Здесь можно использовать существующую модалку, но нужно адаптировать
                // Пока просто откроем в новом окне для теста:
                window.open(src, '_blank');
                // В будущем можно интегрировать с imageModal, но там ожидаются данные из paintings
            });
        });
    }

    // Загружаем галерею при старте (вместо loadProjects)
    loadGallery();
    loadFriends();

    // === Paint (слои) ===
    const mainCanvas = document.getElementById('mainCanvas');
    const overlayCanvas = document.getElementById('overlayCanvas');
    const ctx = mainCanvas.getContext('2d');
    const overlayCtx = overlayCanvas.getContext('2d');

    const clearBtn = document.getElementById('clearCanvas');
    const saveBtn = document.getElementById('saveCanvas');
    const toolBrush = document.getElementById('toolBrush');
    const toolEraser = document.getElementById('toolEraser');
    const brushSizeSlider = document.getElementById('brushSizeSlider');
    const brushSizeValue = document.getElementById('brushSizeValue');
    const colorPalette = document.getElementById('colorPalette');
    const gallery = document.getElementById('paintGallery');
    const pickColorBtn = document.getElementById('pickColorBtn');
    const colorPicker = document.getElementById('colorPicker');
    const currentColorIndicator = document.getElementById('currentColorIndicator');
    const undoBtn = document.getElementById('undoBtn');

    const redSlider = document.getElementById('redSlider');
    const greenSlider = document.getElementById('greenSlider');
    const blueSlider = document.getElementById('blueSlider');
    const redValue = document.getElementById('redValue');
    const greenValue = document.getElementById('greenValue');
    const blueValue = document.getElementById('blueValue');
    const hexInput = document.getElementById('hexInput');
    const applyHex = document.getElementById('applyHex');

    let currentTool = 'brush';
    let currentColor = '#000000';
    let brushSize = 2;

    // Слои
    let layers = [];
    let currentLayerIndex = 0;

    function initLayers() {
        const baseCanvas = document.createElement('canvas');
        baseCanvas.width = mainCanvas.width;
        baseCanvas.height = mainCanvas.height;
        const baseCtx = baseCanvas.getContext('2d');
        baseCtx.fillStyle = 'white';
        baseCtx.fillRect(0, 0, baseCanvas.width, baseCanvas.height);
        
        layers = [{
            canvas: baseCanvas,
            ctx: baseCtx,
            visible: true,
            opacity: 1,
            name: 'Background',
            id: Date.now()
        }];
        currentLayerIndex = 0;
        renderLayersUI();
        compositeLayers();
        pushHistoryLayers();
    }

    function compositeLayers() {
        // Заливаем фон белым
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, mainCanvas.width, mainCanvas.height);
        
        layers.forEach(layer => {
            if (layer.visible) {
                ctx.globalAlpha = layer.opacity;
                ctx.drawImage(layer.canvas, 0, 0);
            }
        });
        ctx.globalAlpha = 1.0;
    }

    let history = [];
    const MAX_HISTORY = 20;

    function pushHistoryLayers() {
        const snapshot = layers.map(layer => {
            return layer.ctx.getImageData(0, 0, mainCanvas.width, mainCanvas.height);
        });
        history.push(snapshot);
        if (history.length > MAX_HISTORY) history.shift();
    }

    function restoreLayersFromHistory(snapshot) {
        snapshot.forEach((imageData, index) => {
            if (layers[index]) {
                layers[index].ctx.putImageData(imageData, 0, 0);
            }
        });
        compositeLayers();
        renderLayersUI();
    }

    undoBtn.addEventListener('click', () => {
        if (history.length <= 1) return;
        history.pop();
        const prev = history[history.length - 1];
        restoreLayersFromHistory(prev);
    });

    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.code === 'KeyZ') {
            const active = document.activeElement;
            if (!(active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement)) {
                e.preventDefault();
                undoBtn.click();
            }
        }
    });

    // Палитра
    const colors = [
        { name: 'black', hex: '#000000' },
        { name: 'dark red', hex: '#800000' },
        { name: 'dark green', hex: '#008000' },
        { name: 'olive', hex: '#808000' },
        { name: 'dark blue', hex: '#000080' },
        { name: 'purple', hex: '#800080' },
        { name: 'teal', hex: '#008080' },
        { name: 'light gray', hex: '#c0c0c0' },
        { name: 'dark gray', hex: '#808080' },
        { name: 'red', hex: '#ff0000' },
        { name: 'lime', hex: '#00ff00' },
        { name: 'yellow', hex: '#ffff00' },
        { name: 'blue', hex: '#0000ff' },
        { name: 'magenta', hex: '#ff00ff' },
        { name: 'cyan', hex: '#00ffff' },
        { name: 'white', hex: '#ffffff' }
    ];

    function createPalette() {
        colorPalette.innerHTML = '';
        colors.forEach((c, index) => {
            const swatch = document.createElement('div');
            swatch.className = 'color-swatch';
            swatch.style.backgroundColor = c.hex;
            swatch.dataset.color = c.hex;
            swatch.dataset.name = c.name;
            if (index === 0) swatch.classList.add('active');
            colorPalette.appendChild(swatch);
        });

        document.querySelectorAll('.color-swatch').forEach(swatch => {
            swatch.addEventListener('click', () => {
                currentColor = swatch.dataset.color;
                currentTool = 'brush';
                updateToolUI();
                updateColorUI(currentColor);
                currentColorIndicator.style.backgroundColor = currentColor;
                updateSlidersFromColor(currentColor);
            });
        });
    }

    function updateToolUI() {
        if (currentTool === 'brush') {
            toolBrush.classList.add('active');
            toolEraser.classList.remove('active');
        } else {
            toolBrush.classList.remove('active');
            toolEraser.classList.add('active');
        }
    }

    function updateColorUI(colorHex) {
        document.querySelectorAll('.color-swatch').forEach(swatch => {
            if (swatch.dataset.color === colorHex) {
                swatch.classList.add('active');
            } else {
                swatch.classList.remove('active');
            }
        });
    }

    toolBrush.addEventListener('click', () => {
        currentTool = 'brush';
        updateToolUI();
    });
    toolEraser.addEventListener('click', () => {
        currentTool = 'eraser';
        updateToolUI();
    });

    brushSizeSlider.addEventListener('input', (e) => {
        brushSize = parseInt(e.target.value);
        brushSizeValue.textContent = brushSize;
        if (mouseOverCanvas && !drawing) {
            drawPreview(lastKnownX, lastKnownY);
        }
    });

    createPalette();

    pickColorBtn.addEventListener('click', () => {
        colorPicker.click();
    });
    colorPicker.addEventListener('input', (e) => {
        currentColor = e.target.value;
        currentTool = 'brush';
        updateToolUI();
        currentColorIndicator.style.backgroundColor = currentColor;
        document.querySelectorAll('.color-swatch').forEach(sw => sw.classList.remove('active'));
        updateSlidersFromColor(currentColor);
    });

    function updateColorFromRGB() {
        const r = parseInt(redSlider.value);
        const g = parseInt(greenSlider.value);
        const b = parseInt(blueSlider.value);
        const hex = '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        currentColor = hex;
        currentTool = 'brush';
        updateToolUI();
        currentColorIndicator.style.backgroundColor = hex;
        hexInput.value = hex.toUpperCase();
        document.querySelectorAll('.color-swatch').forEach(sw => sw.classList.remove('active'));
    }

    function updateValues() {
        redValue.textContent = redSlider.value;
        greenValue.textContent = greenSlider.value;
        blueValue.textContent = blueSlider.value;
        updateColorFromRGB();
    }

    function updateSlidersFromColor(hex) {
        const r = parseInt(hex.slice(1,3), 16);
        const g = parseInt(hex.slice(3,5), 16);
        const b = parseInt(hex.slice(5,7), 16);
        redSlider.value = r;
        greenSlider.value = g;
        blueSlider.value = b;
        redValue.textContent = r;
        greenValue.textContent = g;
        blueValue.textContent = b;
        hexInput.value = hex.toUpperCase();
    }

    redSlider.addEventListener('input', updateValues);
    greenSlider.addEventListener('input', updateValues);
    blueSlider.addEventListener('input', updateValues);

    applyHex.addEventListener('click', () => {
        let hex = hexInput.value.trim();
        if (!hex.startsWith('#')) hex = '#' + hex;
        if (/^#[0-9A-F]{6}$/i.test(hex)) {
            updateSlidersFromColor(hex);
            updateValues();
        } else {
            triggerErrorEffect();
        }
    });

    currentColorIndicator.style.backgroundColor = currentColor;
    updateSlidersFromColor(currentColor);

    // Предпросмотр
    let mouseOverCanvas = false;
    let lastKnownX = 0, lastKnownY = 0;
    let drawing = false;
    let lastX = 0, lastY = 0;

    function getMousePos(e, canvas) {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        return {
            x: Math.max(0, Math.min(canvas.width, x)),
            y: Math.max(0, Math.min(canvas.height, y))
        };
    }

    function drawPreview(x, y) {
        overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
        if (!mouseOverCanvas || drawing) return;
        overlayCtx.save();
        overlayCtx.strokeStyle = 'black';
        overlayCtx.lineWidth = 1;
        overlayCtx.beginPath();
        overlayCtx.arc(x, y, brushSize / 2, 0, 2 * Math.PI);
        overlayCtx.stroke();
        overlayCtx.restore();
    }

    function startDrawing(e) {
        e.preventDefault();
        if (!layers.length || !layers[currentLayerIndex]) {
            console.error('No layer selected');
            return;
        }
        drawing = true;
        const pos = getMousePos(e, mainCanvas);
        lastX = pos.x;
        lastY = pos.y;
        const layer = layers[currentLayerIndex];
        
        if (currentTool === 'brush') {
            layer.ctx.globalCompositeOperation = 'source-over';
            layer.ctx.strokeStyle = currentColor;
        } else {
            layer.ctx.globalCompositeOperation = 'destination-out';
            layer.ctx.strokeStyle = 'rgba(0,0,0,1)';
        }
        
        layer.ctx.beginPath();
        layer.ctx.moveTo(lastX, lastY);
        overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    }

    function draw(e) {
        e.preventDefault();
        const pos = getMousePos(e, mainCanvas);
        lastKnownX = pos.x;
        lastKnownY = pos.y;
        if (drawing) {
            if (!layers.length || !layers[currentLayerIndex]) {
                console.error('No layer selected');
                return;
            }
            const layer = layers[currentLayerIndex];
            layer.ctx.lineWidth = brushSize;
            layer.ctx.lineTo(pos.x, pos.y);
            layer.ctx.stroke();
            lastX = pos.x;
            lastY = pos.y;
            compositeLayers();
        } else {
            drawPreview(pos.x, pos.y);
        }
    }

    function stopDrawing(e) {
        e.preventDefault();
        if (drawing) {
            if (!layers.length || !layers[currentLayerIndex]) {
                console.error('No layer selected');
                return;
            }
            drawing = false;
            const layer = layers[currentLayerIndex];
            layer.ctx.globalCompositeOperation = 'source-over';
            pushHistoryLayers();
        }
        if (mouseOverCanvas) {
            drawPreview(lastKnownX, lastKnownY);
        }
    }

    function handleMouseEnter() {
        mouseOverCanvas = true;
        drawPreview(lastKnownX, lastKnownY);
    }

    function handleMouseLeave() {
        mouseOverCanvas = false;
        overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    }

    mainCanvas.addEventListener('mousedown', startDrawing);
    mainCanvas.addEventListener('mousemove', draw);
    mainCanvas.addEventListener('mouseup', stopDrawing);
    mainCanvas.addEventListener('mouseleave', handleMouseLeave);
    mainCanvas.addEventListener('mouseenter', handleMouseEnter);
    
    mainCanvas.addEventListener('touchstart', startDrawing, { passive: false });
    mainCanvas.addEventListener('touchmove', draw, { passive: false });
    mainCanvas.addEventListener('touchend', stopDrawing);
    mainCanvas.addEventListener('touchcancel', stopDrawing);

    clearBtn.addEventListener('click', () => {
        if (!layers.length || !layers[currentLayerIndex]) {
            console.error('No layer selected');
            return;
        }
        const layer = layers[currentLayerIndex];
        if (currentLayerIndex === 0) {
            layer.ctx.fillStyle = 'white';
            layer.ctx.fillRect(0, 0, mainCanvas.width, mainCanvas.height);
        } else {
            layer.ctx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
        }
        compositeLayers();
        pushHistoryLayers();
    });

    function isCanvasBlank() {
        const imageData = ctx.getImageData(0, 0, mainCanvas.width, mainCanvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            if (data[i] !== 255 || data[i+1] !== 255 || data[i+2] !== 255 || data[i+3] !== 255) {
                return false;
            }
        }
        return true;
    }

    async function performSavePainting(imageData) {
        const { error } = await supabaseClient
            .from('paintings')
            .insert([{ image_data: imageData }]);
        if (error) {
            console.error('Error saving painting:', error);
            triggerErrorEffect();
        } else {
            playChimesSound();
            loadPaintings();
        }
    }

    saveBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (isCanvasBlank()) {
            triggerErrorEffect();
            return;
        }
        const imageData = mainCanvas.toDataURL();
        openCaptcha(performSavePainting, imageData);
    });

    // === UI слоёв ===
    const renameModal = document.getElementById('renameLayerModal');
    const renameInput = document.getElementById('renameLayerInput');
    const renameOk = document.getElementById('renameLayerOk');
    const renameCancel = document.getElementById('renameLayerCancel');
    const renameModalCloseBtn = document.getElementById('closeRenameModal');
    let layerToRenameIndex = -1;

    function openRenameModal(index) {
        if (index === 0) {
            triggerErrorEffect();
            return;
        }
        layerToRenameIndex = index;
        renameInput.value = layers[index].name;
        renameModal.style.display = 'flex';
        renameInput.focus();
        disableBodyScroll();
    }

    function closeRenameModal() {
        renameModal.style.display = 'none';
        layerToRenameIndex = -1;
        enableBodyScroll();
    }

    renameOk.addEventListener('click', () => {
        const newName = renameInput.value.trim();
        if (newName && layerToRenameIndex !== -1) {
            layers[layerToRenameIndex].name = newName;
            renderLayersUI();
        }
        closeRenameModal();
    });

    renameCancel.addEventListener('click', closeRenameModal);
    renameModalCloseBtn.addEventListener('click', closeRenameModal);
    renameModal.addEventListener('click', (e) => {
        if (e.target === renameModal) closeRenameModal();
    });

    function renderLayersUI() {
        const container = document.getElementById('layersList');
        if (!container) return;
        container.innerHTML = '';
        
        layers.forEach((layer, index) => {
            const div = document.createElement('div');
            div.className = 'layer-item' + (index === currentLayerIndex ? ' active' : '');
            div.dataset.index = index;
            
            const vis = document.createElement('div');
            vis.className = 'layer-visibility ' + (layer.visible ? 'visible' : 'hidden');
            vis.addEventListener('click', (e) => {
                e.stopPropagation();
                layer.visible = !layer.visible;
                compositeLayers();
                renderLayersUI();
            });
            div.appendChild(vis);
            
            const nameSpan = document.createElement('span');
            nameSpan.className = 'layer-name';
            nameSpan.textContent = layer.name;
            nameSpan.addEventListener('dblclick', () => {
                if (index === 0) {
                    triggerErrorEffect();
                    return;
                }
                openRenameModal(index);
            });
            div.appendChild(nameSpan);
            
            const opacityInput = document.createElement('input');
            opacityInput.type = 'range';
            opacityInput.min = 0;
            opacityInput.max = 1;
            opacityInput.step = 0.05;
            opacityInput.value = layer.opacity;
            opacityInput.className = 'layer-opacity';
            opacityInput.addEventListener('input', (e) => {
                layer.opacity = parseFloat(e.target.value);
                compositeLayers();
                renderLayersUI();
            });
            div.appendChild(opacityInput);
            
            const moveDiv = document.createElement('div');
            moveDiv.className = 'layer-move';
            
            if (index > 1) {
                const upBtn = document.createElement('button');
                upBtn.textContent = '↑';
                upBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    [layers[index-1], layers[index]] = [layers[index], layers[index-1]];
                    if (currentLayerIndex === index) currentLayerIndex = index-1;
                    else if (currentLayerIndex === index-1) currentLayerIndex = index;
                    renderLayersUI();
                    compositeLayers();
                    pushHistoryLayers();
                });
                moveDiv.appendChild(upBtn);
            }
            
            if (index < layers.length - 1 && index > 0) { // запрещаем движение вниз для Background
                const downBtn = document.createElement('button');
                downBtn.textContent = '↓';
                downBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    [layers[index], layers[index+1]] = [layers[index+1], layers[index]];
                    if (currentLayerIndex === index) currentLayerIndex = index+1;
                    else if (currentLayerIndex === index+1) currentLayerIndex = index;
                    renderLayersUI();
                    compositeLayers();
                    pushHistoryLayers();
                });
                moveDiv.appendChild(downBtn);
            }
            
            div.appendChild(moveDiv);
            
            div.addEventListener('click', () => {
                currentLayerIndex = index;
                renderLayersUI();
            });
            
            container.appendChild(div);
        });
    }

    document.getElementById('addLayerBtn')?.addEventListener('click', () => {
        if (layers.length >= 10) {
            triggerErrorEffect();
            return;
        }
        const newCanvas = document.createElement('canvas');
        newCanvas.width = mainCanvas.width;
        newCanvas.height = mainCanvas.height;
        const newCtx = newCanvas.getContext('2d');
        // Новый слой полностью прозрачный
        
        layers.push({
            canvas: newCanvas,
            ctx: newCtx,
            visible: true,
            opacity: 1,
            name: `Layer ${layers.length + 1}`,
            id: Date.now()
        });
        currentLayerIndex = layers.length - 1;
        renderLayersUI();
        compositeLayers();
        pushHistoryLayers();
    });

    document.getElementById('deleteLayerBtn')?.addEventListener('click', () => {
        if (layers.length <= 1) {
            triggerErrorEffect();
            return;
        }
        if (currentLayerIndex === 0) {
            triggerErrorEffect();
            return;
        }
        layers.splice(currentLayerIndex, 1);
        if (currentLayerIndex >= layers.length) currentLayerIndex = layers.length - 1;
        renderLayersUI();
        compositeLayers();
        pushHistoryLayers();
    });

    document.getElementById('mergeDownBtn')?.addEventListener('click', () => {
        if (currentLayerIndex === 0) {
            triggerErrorEffect();
            return;
        }
        const bottomLayer = layers[currentLayerIndex - 1];
        const topLayer = layers[currentLayerIndex];
        
        bottomLayer.ctx.save();
        bottomLayer.ctx.globalAlpha = topLayer.opacity;
        bottomLayer.ctx.drawImage(topLayer.canvas, 0, 0);
        bottomLayer.ctx.restore();
        
        layers.splice(currentLayerIndex, 1);
        currentLayerIndex--;
        renderLayersUI();
        compositeLayers();
        pushHistoryLayers();
    });

    initLayers();

    // === Модальное окно для просмотра рисунков ===
    const imageModal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const closeImageModal = document.getElementById('closeImageModal');
    const modalLikes = document.getElementById('modalLikes');
    const modalLikeBtn = document.getElementById('modalLikeBtn');
    const modalDate = document.getElementById('modalDate');
    const modalPrevBtn = document.getElementById('modalPrevBtn');
    const modalNextBtn = document.getElementById('modalNextBtn');
    const modalRandomBtn = document.getElementById('modalRandomBtn');
    const loadingDiv = document.getElementById('modalLoading');

    let currentModalId = null;
    let allPaintings = [];
    let allPaintingsLoaded = false;

    async function loadAllPaintingsForNav() {
        if (allPaintingsLoaded) return;
        const { data, error } = await supabaseClient
            .from('paintings')
            .select('id')
            .order('created_at', { ascending: false });
        if (!error && data) {
            allPaintings = data.map(p => p.id);
            allPaintingsLoaded = true;
        }
    }

    window.openImageModal = async function(id) {
        await loadAllPaintingsForNav();
        currentModalId = id;
        
        loadingDiv.style.display = 'block';
        modalImage.style.display = 'none';
        if (modalLikes && modalLikes.parentElement) {
            modalLikes.parentElement.style.display = 'none';
        }

        const { data, error } = await supabaseClient
            .from('paintings')
            .select('image_data, created_at, likes')
            .eq('id', id)
            .single();

        if (error || !data) {
            loadingDiv.style.display = 'none';
            modalImage.style.display = 'block';
            modalImage.alt = 'Error loading image';
            return;
        }

        modalImage.src = data.image_data;
        modalImage.onload = () => {
            loadingDiv.style.display = 'none';
            modalImage.style.display = 'block';
            if (modalLikes && modalLikes.parentElement) {
                modalLikes.parentElement.style.display = 'block';
            }

            modalLikes.textContent = data.likes || 0;
            modalDate.textContent = new Date(data.created_at).toLocaleString();

            (async () => {
                const { data: likesData } = await supabaseClient
                    .from('painting_likes')
                    .select('id')
                    .eq('painting_id', id)
                    .eq('visitor_id', visitorId);
                const liked = likesData && likesData.length > 0;

                modalLikeBtn.classList.remove('liked', 'unliked');
                modalLikeBtn.classList.add(liked ? 'liked' : 'unliked');
                modalLikeBtn.disabled = liked;

                modalLikeBtn.onclick = null;
                if (!liked) {
                    modalLikeBtn.onclick = async () => {
                        modalLikeBtn.disabled = true;
                        const oldLikes = parseInt(modalLikes.textContent) || 0;
                        modalLikes.textContent = oldLikes + 1;
                        modalLikeBtn.classList.remove('unliked');
                        modalLikeBtn.classList.add('liked');

                        const { error: insertError } = await supabaseClient
                            .from('painting_likes')
                            .insert({ painting_id: id, visitor_id: visitorId });

                        if (insertError && insertError.code !== '23505') {
                            console.error(insertError);
                            modalLikes.textContent = oldLikes;
                            modalLikeBtn.classList.remove('liked');
                            modalLikeBtn.classList.add('unliked');
                            modalLikeBtn.disabled = false;
                            return;
                        }

                        const { error: updateError } = await supabaseClient
                            .rpc('increment_likes', { painting_id: id });
                        if (updateError) console.error(updateError);

                        myLikes.add(id);
                        loadPaintings();
                    };
                }
            })();
        };

        modalImage.onerror = () => {
            loadingDiv.style.display = 'none';
            modalImage.style.display = 'block';
            modalImage.alt = 'Failed to load image';
        };

        imageModal.style.display = 'flex';
        disableBodyScroll();
    };

    function closeImageModalFunc() {
        imageModal.style.display = 'none';
        modalImage.src = '';
        currentModalId = null;
        enableBodyScroll();
    }

    closeImageModal.addEventListener('click', closeImageModalFunc);
    imageModal.addEventListener('click', (e) => {
        if (e.target === imageModal) closeImageModalFunc();
    });

    if (modalPrevBtn && modalNextBtn && modalRandomBtn) {
        modalPrevBtn.addEventListener('click', () => {
            if (!currentModalId || allPaintings.length === 0) return;
            const idx = allPaintings.indexOf(currentModalId);
            if (idx > 0) openImageModal(allPaintings[idx - 1]);
        });

        modalNextBtn.addEventListener('click', () => {
            if (!currentModalId || allPaintings.length === 0) return;
            const idx = allPaintings.indexOf(currentModalId);
            if (idx < allPaintings.length - 1) openImageModal(allPaintings[idx + 1]);
        });

        modalRandomBtn.addEventListener('click', () => {
            if (allPaintings.length === 0) return;
            const randomIdx = Math.floor(Math.random() * allPaintings.length);
            openImageModal(allPaintings[randomIdx]);
        });
    }

    // === Лайки ===
    const VISITOR_KEY = 'visitor_id';
    function generateVisitorId() {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return crypto.randomUUID();
        }
        return 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    function getVisitorId() {
        let id = localStorage.getItem(VISITOR_KEY);
        if (!id) {
            id = generateVisitorId();
            localStorage.setItem(VISITOR_KEY, id);
        }
        return id;
    }
    const visitorId = getVisitorId();

    let currentPage = 0;
    const pageSize = 6;
    let totalPaintings = 0;
    let totalPages = 0;
    let myLikes = new Set();
    let sparkleInterval = null;

    async function loadMyLikes() {
        try {
            const { data, error } = await supabaseClient
                .from('painting_likes')
                .select('painting_id')
                .eq('visitor_id', visitorId);
            if (error) {
                console.error('Error loading my likes:', error);
            } else {
                myLikes = new Set(data.map(row => row.painting_id));
            }
        } catch (err) {
            console.error('Unexpected error loading likes:', err);
        }
    }

    async function likePainting(paintingId, buttonElement, likeCountElement) {
        buttonElement.disabled = true;
        buttonElement.classList.remove('unliked');
        buttonElement.classList.add('liked');
        const currentLikes = parseInt(likeCountElement.textContent) || 0;
        likeCountElement.textContent = currentLikes + 1;

        try {
            const { error: insertError } = await supabaseClient
                .from('painting_likes')
                .insert({ painting_id: paintingId, visitor_id: visitorId });

            if (insertError) {
                if (insertError.code === '23505') {
                    buttonElement.disabled = false;
                    buttonElement.classList.remove('liked');
                    buttonElement.classList.add('unliked');
                    likeCountElement.textContent = currentLikes;
                    triggerErrorEffect();
                    return;
                } else {
                    throw insertError;
                }
            }

            const { error: updateError } = await supabaseClient
                .rpc('increment_likes', { painting_id: paintingId });

            if (updateError) throw updateError;

            myLikes.add(paintingId);
            playChimesSound();
            loadPaintings();

        } catch (err) {
            console.error('Error liking painting:', err);
            buttonElement.disabled = false;
            buttonElement.classList.remove('liked');
            buttonElement.classList.add('unliked');
            likeCountElement.textContent = currentLikes;
            triggerErrorEffect();
        }
    }

    function addSparkles(container) {
        const sparkleCount = 8;
        const sparkles = [];

        if (sparkleInterval) {
            clearInterval(sparkleInterval);
            sparkleInterval = null;
        }

        for (let i = 0; i < sparkleCount; i++) {
            const sparkle = document.createElement('span');
            sparkle.className = 'sparkle';
            const size = Math.floor(Math.random() * 5) + 4;
            const duration = (Math.random() * 1.5 + 1).toFixed(2);
            const delay = (Math.random() * 2).toFixed(2);
            const top = Math.random() * 100;
            const left = Math.random() * 100;

            sparkle.style.cssText = `
                top: ${top}%;
                left: ${left}%;
                width: ${size}px;
                height: ${size}px;
                animation: sparkleTwinkle ${duration}s infinite ease-in-out;
                animation-delay: ${delay}s;
                opacity: ${Math.random() * 0.5 + 0.5};
            `;

            container.appendChild(sparkle);
            sparkles.push(sparkle);
        }

        function updateSparklesPositions() {
            sparkles.forEach(sparkle => {
                const newTop = Math.random() * 100;
                const newLeft = Math.random() * 100;
                sparkle.style.top = `${newTop}%`;
                sparkle.style.left = `${newLeft}%`;
            });
        }

        sparkleInterval = setInterval(updateSparklesPositions, 2000);
    }

    async function loadPaintings() {
        const offset = currentPage * pageSize;
        const { data, error } = await supabaseClient
            .from('paintings')
            .select('id, image_data, created_at, likes')
            .order('created_at', { ascending: false })
            .range(offset, offset + pageSize - 1);

        if (error) {
            console.error('Error loading paintings:', error);
            return;
        }

        if (totalPaintings === 0) {
            await loadTotalCount();
        }

        document.getElementById('prevPageBtn').disabled = currentPage === 0;
        document.getElementById('nextPageBtn').disabled = currentPage >= totalPages - 1;
        document.getElementById('pageIndicator').textContent = `Page ${currentPage + 1}`;

        let maxLikes = 0;
        data.forEach(p => {
            if (p.likes > maxLikes) maxLikes = p.likes;
        });

        gallery.innerHTML = '';
        data.forEach(p => {
            const paintingId = p.id;
            const liked = myLikes.has(paintingId);
            const isTop = (p.likes === maxLikes && maxLikes > 0);

            const imgDiv = document.createElement('div');
            imgDiv.style.border = '2px solid #808080';
            imgDiv.style.borderRightColor = '#ffffff';
            imgDiv.style.borderBottomColor = '#ffffff';
            imgDiv.style.padding = '4px';
            imgDiv.style.backgroundColor = '#d4d0c8';
            imgDiv.style.textAlign = 'center';
            imgDiv.style.marginBottom = '10px';
            imgDiv.style.position = 'relative';

            if (isTop) {
                imgDiv.classList.add('top-painting');
                addSparkles(imgDiv);
            }

            const img = document.createElement('img');
            img.src = p.image_data;
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
            img.style.border = '1px solid black';
            img.style.cursor = 'pointer';
            img.addEventListener('click', () => openImageModal(paintingId));
            imgDiv.appendChild(img);

            const dateDiv = document.createElement('div');
            dateDiv.style.fontSize = '10px';
            dateDiv.style.marginTop = '4px';
            dateDiv.textContent = new Date(p.created_at).toLocaleString();
            imgDiv.appendChild(dateDiv);

            const likeRow = document.createElement('div');
            likeRow.style.display = 'flex';
            likeRow.style.alignItems = 'center';
            likeRow.style.justifyContent = 'center';
            likeRow.style.marginTop = '5px';
            likeRow.style.gap = '5px';

            const likeCount = document.createElement('span');
            likeCount.textContent = p.likes || 0;
            likeCount.style.fontSize = '12px';
            likeCount.style.fontWeight = 'bold';

            const likeBtn = document.createElement('button');
            likeBtn.className = 'like-button';
            likeBtn.classList.add(liked ? 'liked' : 'unliked');
            likeBtn.style.cursor = liked ? 'default' : 'pointer';
            if (liked) {
                likeBtn.disabled = true;
            }

            if (!liked) {
                likeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    likePainting(paintingId, likeBtn, likeCount);
                });
            }

            likeRow.appendChild(likeBtn);
            likeRow.appendChild(likeCount);
            imgDiv.appendChild(likeRow);

            gallery.appendChild(imgDiv);
        });
    }

    async function loadTotalCount() {
        const { count, error } = await supabaseClient
            .from('paintings')
            .select('*', { count: 'exact', head: true });
        if (!error) {
            totalPaintings = count;
            totalPages = Math.ceil(totalPaintings / pageSize);
        }
    }

    // === Навигация по меню ===
    const menuItems = document.querySelectorAll('#menu li');
    const sections = {
        about: document.getElementById('about'),
        projects: document.getElementById('projects'),
        friends: document.getElementById('friends'),
        guestbook: document.getElementById('guestbook'),
        paint: document.getElementById('paint'),
        settings: document.getElementById('settings')
    };

    function scrollToSection(sectionId) {
        sections[sectionId]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function removeSelectedClass() {
        menuItems.forEach(item => item.classList.remove('selected'));
    }

    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.dataset.target;
            scrollToSection(targetId);
            removeSelectedClass();
            this.classList.add('selected');
        });
    });

    document.querySelectorAll('#menu a').forEach(link => {
        link.addEventListener('click', e => e.preventDefault());
    });

    // === Управление прокруткой ===
    function disableBodyScroll() {
        document.body.classList.add('modal-open');
    }
    function enableBodyScroll() {
        document.body.classList.remove('modal-open');
    }

    // === Загрузка данных ===
    loadGuestbook(0);
    (async () => {
        await loadMyLikes();
        await loadTotalCount();
        loadPaintings();
    })();

    // Realtime подписка
    supabaseClient
        .channel('guestbook_changes')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'guestbook' }, () => {
            guestbookCurrentPage = 0;
            loadGuestbook(0);
        })
        .subscribe();

    // === Пагинация гостевой книги (обработчики) ===
    if (guestbookPrevBtn) {
        guestbookPrevBtn.addEventListener('click', () => {
            if (guestbookCurrentPage > 0) {
                loadGuestbook(guestbookCurrentPage - 1);
            }
        });
    }
    if (guestbookNextBtn) {
        guestbookNextBtn.addEventListener('click', () => {
            if (guestbookCurrentPage < guestbookTotalPages - 1) {
                loadGuestbook(guestbookCurrentPage + 1);
            }
        });
    }

    // === Пагинация галереи ===
    const prevPageBtn = document.getElementById('prevPageBtn');
    const nextPageBtn = document.getElementById('nextPageBtn');
    if (prevPageBtn && nextPageBtn) {
        prevPageBtn.addEventListener('click', async () => {
            if (currentPage > 0) {
                currentPage--;
                await loadPaintings();
            }
        });
        nextPageBtn.addEventListener('click', async () => {
            if (currentPage < totalPages - 1) {
                currentPage++;
                await loadPaintings();
            }
        });
    }
})();