// custom_wallpaper.js — плавный фиолетовый градиент
(function() {
    let canvas = null;
    let ctx = null;
    let animationId = null;
    let resizeHandler = null;
    let noisePattern = null;

    const colorLight = { r: 200, g: 160, b: 255 };
    const colorDark  = { r: 75,  g: 0,   b: 130 };
    const STOPS = 4;

    function createNoisePattern() {
        const patternCanvas = document.createElement('canvas');
        patternCanvas.width = 64;
        patternCanvas.height = 64;
        const pCtx = patternCanvas.getContext('2d');
        const imageData = pCtx.createImageData(64, 64);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const val = Math.floor(Math.random() * 256);
            data[i] = val;
            data[i+1] = val;
            data[i+2] = val;
            data[i+3] = 255;
        }
        pCtx.putImageData(imageData, 0, 0);
        return pCtx.createPattern(patternCanvas, 'repeat');
    }

    function draw() {
        if (!ctx || !canvas) return;

        const width = canvas.width;
        const height = canvas.height;
        const time = performance.now() / 1000;

        const angle = time * 0.2;
        const cx = width / 2;
        const cy = height / 2;
        const radius = Math.max(width, height) * 0.8;
        const x1 = cx + Math.cos(angle) * radius;
        const y1 = cy + Math.sin(angle) * radius;
        const x2 = cx - Math.cos(angle) * radius;
        const y2 = cy - Math.sin(angle) * radius;

        const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
        const factor = (Math.sin(time * 0.8) + 1) / 2;

        for (let i = 0; i <= STOPS; i++) {
            const t = i / STOPS;
            const mix = Math.sin(t * Math.PI) * 0.3 + 0.5;
            const r = Math.round(colorLight.r * (1 - factor) * mix + colorDark.r * factor * (1 - mix));
            const g = Math.round(colorLight.g * (1 - factor) * mix + colorDark.g * factor * (1 - mix));
            const b = Math.round(colorLight.b * (1 - factor) * mix + colorDark.b * factor * (1 - mix));
            gradient.addColorStop(t, `rgb(${r}, ${g}, ${b})`);
        }

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        if (noisePattern) {
            ctx.save();
            ctx.globalAlpha = 0.1;
            ctx.fillStyle = noisePattern;
            ctx.fillRect(0, 0, width, height);
            ctx.restore();
        }

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
        noisePattern = createNoisePattern();

        resizeHandler = function() {
            if (!canvas) return;
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', resizeHandler);
        resizeHandler();

        draw();
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
        noisePattern = null;
    }

    window.CustomWallpaper = {
        start: start,
        stop: stop
    };
})();