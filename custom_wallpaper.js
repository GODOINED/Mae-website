// custom_wallpaper.js — эффект Windows 98: плавающие волны поверх картинки
(function() {
    let canvas = null;
    let ctx = null;
    let animationId = null;
    let resizeHandler = null;
    let bgImage = null;
    let imageLoaded = false;

    // ===== НАСТРОЙКИ ВОЛН =====
    const waves = [
        { y: 0.2, amp: 20, freq: 0.015, speed: 0.8, color: 'rgba(100, 200, 255, 0.2)' },
        { y: 0.5, amp: 30, freq: 0.02,  speed: 1.2, color: 'rgba(200, 100, 255, 0.15)' },
        { y: 0.8, amp: 25, freq: 0.018, speed: 1.0, color: 'rgba(255, 150, 100, 0.1)' }
    ];
    let offset = 0;

    // ===== ЗАГРУЗКА ИЗОБРАЖЕНИЯ =====
    function loadImage() {
        return new Promise((resolve, reject) => {
            const img = new Image();
            // ПУТЬ К ТВОЕЙ КАРТИНКЕ (замени, если нужно)
            img.src = 'materialsl/wallpaper.jpg';
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                bgImage = img;
                imageLoaded = true;
                resolve();
            };
            img.onerror = () => {
                console.warn('Не удалось загрузить wallpaper.jpg, использую градиент');
                imageLoaded = false;
                resolve(); // всё равно запускаем анимацию, но без картинки
            };
        });
    }

    // ===== ОТРИСОВКА КАДРА =====
    function draw() {
        if (!ctx || !canvas) return;

        const width = canvas.width;
        const height = canvas.height;

        // Очищаем
        ctx.clearRect(0, 0, width, height);

        // Рисуем фон (картинку или градиент)
        if (imageLoaded && bgImage) {
            // Масштабируем картинку на весь холст без искажений
            const scale = Math.max(width / bgImage.width, height / bgImage.height);
            const x = (width - bgImage.width * scale) / 2;
            const y = (height - bgImage.height * scale) / 2;
            ctx.drawImage(bgImage, x, y, bgImage.width * scale, bgImage.height * scale);
        } else {
            // Запасной градиент
            const gradient = ctx.createLinearGradient(0, 0, width, height);
            gradient.addColorStop(0, '#4b0082');
            gradient.addColorStop(1, '#8a2be2');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);
        }

        // Рисуем волны поверх
        offset += 0.02; // скорость движения волн (можно менять)
        waves.forEach(wave => {
            const yBase = height * wave.y;
            ctx.beginPath();
            ctx.strokeStyle = wave.color;
            ctx.lineWidth = 3;

            // Основная линия
            for (let x = 0; x < width; x += 8) {
                const y = yBase + wave.amp * Math.sin(x * wave.freq + offset * wave.speed);
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();

            // Дополнительная линия (для объёма)
            ctx.beginPath();
            for (let x = 0; x < width; x += 8) {
                const y = yBase + wave.amp * Math.sin(x * wave.freq + offset * wave.speed + 1) + 5;
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.strokeStyle = wave.color.replace('0.2', '0.1'); // чуть прозрачнее
            ctx.stroke();
        });

        animationId = requestAnimationFrame(draw);
    }

    // ===== СТАРТ =====
    function start() {
        if (canvas) return; // уже запущен

        canvas = document.createElement('canvas');
        canvas.id = 'custom-wallpaper-canvas';
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.zIndex = '-1';
        canvas.style.pointerEvents = 'none';
        document.body.prepend(canvas);

        ctx = canvas.getContext('2d');

        resizeHandler = function() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resizeHandler);
        resizeHandler();

        loadImage().then(() => {
            draw();
        });
    }

    // ===== СТОП =====
    function stop() {
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
        if (resizeHandler) {
            window.removeEventListener('resize', resizeHandler);
            resizeHandler = null;
        }
        if (canvas) {
            canvas.remove();
            canvas = null;
            ctx = null;
        }
        bgImage = null;
        imageLoaded = false;
    }

    window.CustomWallpaper = {
        start: start,
        stop: stop
    };
})();