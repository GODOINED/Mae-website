// custom_wallpaper.js — волнистое искажение как в Windows 98 (оптимизировано, края не обрезаются)
(function() {
    let canvas = null;
    let ctx = null;
    let animationId = null;
    let resizeHandler = null;
    let bgImage = null;
    let imageLoaded = false;
    let extendedCanvas = null; // расширенное изображение (с запасом по бокам)
    let time = 0;

    // Параметры волны — можешь менять по вкусу
    const wave = {
        amplitude: 30,   // сила искажения (пиксели)
        frequency: 0.02, // частота волн
        speed: 2         // скорость движения
    };

    function loadImage() {
        return new Promise((resolve, reject) => {
            const img = new Image();
            // Путь к твоему изображению в папке materialsl
            img.src = 'materialsl/wallpaper.jpg';
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                bgImage = img;
                imageLoaded = true;
                createExtendedCanvas();
                resolve();
            };
            img.onerror = () => {
                console.warn('Не удалось загрузить фон, используется градиент');
                imageLoaded = false;
                reject();
            };
        });
    }

    // Создаёт расширенный offscreen‑холст, который шире основного на 2 * amplitude
    // Это позволяет сдвигать изображение без появления пустых краёв
    function createExtendedCanvas() {
        if (!bgImage || !canvas) return;

        const width = canvas.width;
        const height = canvas.height;
        const amp = wave.amplitude;

        // Расширенная ширина: холст + запас слева и справа
        const extWidth = width + 2 * amp;
        // Масштабируем изображение так, чтобы оно заполнило эту ширину, сохраняя пропорции
        const scale = extWidth / bgImage.width;
        const scaledHeight = bgImage.height * scale;

        extendedCanvas = document.createElement('canvas');
        extendedCanvas.width = extWidth;
        extendedCanvas.height = height; // обрезаем по высоте, лишнее сверху/снизу центрируем

        const extCtx = extendedCanvas.getContext('2d');
        const yOffset = (height - scaledHeight) / 2;
        extCtx.drawImage(bgImage, 0, 0, bgImage.width, bgImage.height,
                         0, yOffset, extWidth, scaledHeight);
    }

    function draw() {
        if (!ctx || !canvas) return;

        const width = canvas.width;
        const height = canvas.height;
        const amp = wave.amplitude;

        ctx.clearRect(0, 0, width, height);

        if (imageLoaded && extendedCanvas) {
            // Разбиваем на горизонтальные полосы — так быстрее, чем попиксельно
            const steps = 50; // регулируй для баланса плавность/производительность
            const stepHeight = height / steps;

            for (let i = 0; i < steps; i++) {
                const y = i * stepHeight;
                // Смещение зависит от Y и времени
                const offset = amp * Math.sin(y * wave.frequency + time);

                // Берём полосу из расширенного изображения со сдвигом
                // srcX = amp - offset : при offset>0 смещаемся влево (изображение едет вправо)
                const srcX = amp - offset;

                ctx.drawImage(
                    extendedCanvas,
                    srcX, y, width, stepHeight,   // исходный прямоугольник
                    0, y, width, stepHeight        // целевой (на весь холст)
                );
            }
        } else {
            // Запасной градиент на случай, если картинка не загрузилась
            const gradient = ctx.createLinearGradient(0, 0, width, height);
            gradient.addColorStop(0, '#4b0082');
            gradient.addColorStop(1, '#8a2be2');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);
        }

        time += 0.02 * wave.speed;
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
            if (bgImage) {
                createExtendedCanvas(); // пересоздаём расширенное изображение под новый размер
            }
        };
        window.addEventListener('resize', resizeHandler);
        resizeHandler(); // устанавливаем начальный размер

        loadImage().finally(() => {
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
        extendedCanvas = null;
        imageLoaded = false;
    }

    window.CustomWallpaper = {
        start: start,
        stop: stop
    };
})();
