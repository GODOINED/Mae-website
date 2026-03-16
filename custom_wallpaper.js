// custom_wallpaper.js — загружает изображение из materialsl и добавляет эффект волны (wave)
(function() {
    let canvas = null;
    let ctx = null;
    let animationId = null;
    let resizeHandler = null;
    let bgImage = null;           // загруженное изображение
    let imageLoaded = false;
    let offsetX = 0;              // смещение для анимации волн

    // Параметры волн
    const waves = [
        { y: 0.2, amp: 30, freq: 0.01, speed: 0.5, color: 'rgba(100, 150, 255, 0.15)' },
        { y: 0.5, amp: 40, freq: 0.015, speed: 0.8, color: 'rgba(150, 100, 255, 0.1)' },
        { y: 0.8, amp: 25, freq: 0.02, speed: 0.3, color: 'rgba(255, 100, 150, 0.12)' }
    ];

    function loadImage() {
        return new Promise((resolve, reject) => {
            const img = new Image();
            // Укажи здесь путь к своему изображению в папке materialsl
            img.src = 'materialsl/wallpaper.jpg'; // можно заменить на другое имя
            img.crossOrigin = 'anonymous'; // если нужно
            img.onload = () => {
                bgImage = img;
                imageLoaded = true;
                resolve();
            };
            img.onerror = () => {
                console.error('Failed to load background image');
                // Если не загрузилось, создаём запасной градиент (на всякий случай)
                imageLoaded = false;
                reject();
            };
        });
    }

    function draw() {
        if (!ctx || !canvas) return;

        const width = canvas.width;
        const height = canvas.height;

        ctx.clearRect(0, 0, width, height);

        // Если изображение загружено – рисуем его, растягивая на весь экран
        if (imageLoaded && bgImage) {
            ctx.drawImage(bgImage, 0, 0, width, height);
        } else {
            // Запасной вариант – красивый градиент (на случай ошибки загрузки)
            const gradient = ctx.createLinearGradient(0, 0, width, height);
            gradient.addColorStop(0, '#4b0082');
            gradient.addColorStop(1, '#8a2be2');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);
        }

        // Рисуем волны (полупрозрачные синусоидальные полосы)
        offsetX += 0.02; // скорость смещения волн (можно регулировать)

        waves.forEach(wave => {
            const yPos = height * wave.y; // базовая вертикальная позиция
            ctx.beginPath();
            ctx.strokeStyle = wave.color;
            ctx.lineWidth = 3;

            for (let x = 0; x < width; x += 5) {
                const waveOffset = Math.sin(x * wave.freq + offsetX * wave.speed) * wave.amp;
                const y = yPos + waveOffset;
                if (x === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.stroke();

            // Добавим вторую линию чуть ниже для эффекта "толстой волны"
            ctx.beginPath();
            for (let x = 0; x < width; x += 5) {
                const waveOffset = Math.sin(x * wave.freq + offsetX * wave.speed + 1) * wave.amp;
                const y = yPos + waveOffset + 10;
                if (x === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.strokeStyle = wave.color.replace('0.15', '0.1'); // чуть прозрачнее
            ctx.stroke();
        });

        animationId = requestAnimationFrame(draw);
    }

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
            if (!canvas) return;
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            // при изменении размера canvas изображение перерисуется в следующем кадре
        };

        window.addEventListener('resize', resizeHandler);
        resizeHandler();

        // Загружаем изображение и после запускаем анимацию
        loadImage()
            .catch(() => {
                // если не загрузилось, всё равно запускаем (будет градиент)
            })
            .finally(() => {
                // запускаем анимацию
                draw();
            });
    }

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
