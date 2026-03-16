// custom_wallpaper.js — просто фон (картинка или градиент)
(function() {
    let canvas = null;
    let ctx = null;
    let animationId = null;
    let resizeHandler = null;
    let bgImage = null;
    let imageLoaded = false;

    function loadImage() {
        const img = new Image();
        img.src = 'materialsl/wallpaper.jpg'; // путь к твоей картинке
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            bgImage = img;
            imageLoaded = true;
            // если canvas уже есть, перерисуем
            if (ctx) draw();
        };
        img.onerror = () => {
            console.warn('Не удалось загрузить изображение, используется градиент');
            imageLoaded = false;
        };
    }

    function draw() {
        if (!ctx || !canvas) return;

        const width = canvas.width;
        const height = canvas.height;

        if (imageLoaded && bgImage) {
            // Масштабируем картинку, чтобы она покрыла весь экран без искажений
            const scale = Math.max(width / bgImage.width, height / bgImage.height);
            const imgW = bgImage.width * scale;
            const imgH = bgImage.height * scale;
            const x = (width - imgW) / 2;
            const y = (height - imgH) / 2;
            ctx.drawImage(bgImage, x, y, imgW, imgH);
        } else {
            // Градиент
            const gradient = ctx.createLinearGradient(0, 0, width, height);
            gradient.addColorStop(0, '#4b0082');
            gradient.addColorStop(1, '#8a2be2');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);
        }

        // просто статичный кадр – анимация не нужна, поэтому не вызываем requestAnimationFrame повторно
        // но чтобы canvas не стирался при ресайзе, оставим возможность перерисовки
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
            draw(); // перерисовываем при изменении размера
        };
        window.addEventListener('resize', resizeHandler);
        resizeHandler();

        loadImage();
    }

    function stop() {
        if (resizeHandler) window.removeEventListener('resize', resizeHandler);
        if (canvas) canvas.remove();
        canvas = ctx = null;
        bgImage = null;
        imageLoaded = false;
    }

    window.CustomWallpaper = { start, stop };
})();