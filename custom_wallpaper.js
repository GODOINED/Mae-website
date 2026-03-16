// custom_wallpaper.js — лёгкое волнистое искажение в стиле Windows 98
(function() {
    let canvas = null;
    let ctx = null;
    let animationId = null;
    let resizeHandler = null;
    let bgImage = null;
    let imageLoaded = false;
    let time = 0;

    // ===== НАСТРОЙКИ ЭФФЕКТА =====
    const config = {
        amplitude: 10,          // сила искажения (пиксели) – чем меньше, тем незаметнее
        frequency: 0.02,        // частота волн (чем больше, тем чаще)
        speed: 2,               // скорость движения
        steps: 50               // количество полос (больше = плавнее, но чуть тяжелее)
    };

    function loadImage() {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = 'materialsl/wallpaper.jpg'; // путь к твоему изображению
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                bgImage = img;
                imageLoaded = true;
                resolve();
            };
            img.onerror = () => {
                console.warn('Не удалось загрузить изображение, используется градиент');
                imageLoaded = false;
                resolve();
            };
        });
    }

    function draw() {
        if (!ctx || !canvas) return;

        const width = canvas.width;
        const height = canvas.height;
        const amp = config.amplitude;
        const freq = config.frequency;
        const speed = config.speed;
        const steps = config.steps;

        ctx.clearRect(0, 0, width, height);

        if (imageLoaded && bgImage) {
            // Масштабируем изображение на весь холст (с сохранением пропорций)
            const scale = Math.max(width / bgImage.width, height / bgImage.height);
            const imgWidth = bgImage.width * scale;
            const imgHeight = bgImage.height * scale;
            const offsetX = (width - imgWidth) / 2;
            const offsetY = (height - imgHeight) / 2;

            // Рисуем искажённое изображение по полосам
            const stepHeight = height / steps;
            for (let i = 0; i < steps; i++) {
                const y = i * stepHeight;
                // Сдвиг по горизонтали зависит от y и времени
                const shift = amp * Math.sin(y * freq + time * speed);

                // Вырезаем полосу из исходного изображения и рисуем её со сдвигом
                ctx.drawImage(
                    bgImage,
                    0, (y - offsetY) / scale, bgImage.width, stepHeight / scale, // исходная область
                    shift, y, width, stepHeight                                   // целевая область
                );
            }
        } else {
            // Запасной градиент
            const gradient = ctx.createLinearGradient(0, 0, width, height);
            gradient.addColorStop(0, '#4b0082');
            gradient.addColorStop(1, '#8a2be2');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);
        }

        time += 0.02; // увеличиваем фазу
        animationId = requestAnimationFrame(draw);
    }

    function start() {
        if (canvas) return;

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
