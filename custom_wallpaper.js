// custom_wallpaper.js — эффект волнистого искажения (Windows 98 wave)
(function() {
    let canvas = null;
    let ctx = null;
    let animationId = null;
    let resizeHandler = null;
    let bgImage = null;           // загруженное изображение
    let imageLoaded = false;
    let time = 0;                 // для анимации

    // Параметры волны
    const waveParams = {
        amplitude: 30,             // сила искажения (пиксели)
        frequency: 0.02,           // частота (чем больше, тем чаще волны)
        speed: 2.5,                // скорость движения
        time: 0
    };

    function loadImage() {
        return new Promise((resolve, reject) => {
            const img = new Image();
            // Путь к твоему изображению (можно заменить на любое другое)
            img.src = 'materialsl/wallpaper.jpg';
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                bgImage = img;
                imageLoaded = true;
                resolve();
            };
            img.onerror = () => {
                console.warn('Failed to load wallpaper image, using gradient fallback');
                imageLoaded = false;
                reject();
            };
        });
    }

    // Рисует искажённое изображение или градиент
    function drawDistorted() {
        if (!ctx || !canvas) return;

        const width = canvas.width;
        const height = canvas.height;

        // Очищаем
        ctx.clearRect(0, 0, width, height);

        // Если изображение загружено – используем его, иначе рисуем градиент
        if (imageLoaded && bgImage) {
            // Создаём временный canvas, чтобы рисовать искажённое изображение
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = width;
            tempCanvas.height = height;
            const tempCtx = tempCanvas.getContext('2d');

            // Рисуем изображение на временном canvas (масштабируем под размер)
            tempCtx.drawImage(bgImage, 0, 0, width, height);

            // Получаем данные пикселей временного canvas
            const imageData = tempCtx.getImageData(0, 0, width, height);
            const data = imageData.data;

            // Создаём новый ImageData для искажённого изображения
            const distortedData = ctx.createImageData(width, height);
            const distorted = distortedData.data;

            // Проходим по каждой строке
            for (let y = 0; y < height; y++) {
                // Сдвиг по X зависит от y и времени
                // Можно также сделать зависимость от x для более сложного эффекта, но классика – горизонтальное смещение, зависящее от y.
                const offset = Math.floor(
                    waveParams.amplitude * Math.sin(y * waveParams.frequency + waveParams.time)
                );

                for (let x = 0; x < width; x++) {
                    const srcX = x + offset;
                    // Если srcX выходит за пределы – оставляем чёрный (или можно зациклить)
                    if (srcX < 0 || srcX >= width) continue;

                    const srcIndex = (y * width + srcX) * 4;
                    const dstIndex = (y * width + x) * 4;

                    distorted[dstIndex] = data[srcIndex];
                    distorted[dstIndex + 1] = data[srcIndex + 1];
                    distorted[dstIndex + 2] = data[srcIndex + 2];
                    distorted[dstIndex + 3] = data[srcIndex + 3];
                }
            }

            // Рисуем искажённое изображение на основном canvas
            ctx.putImageData(distortedData, 0, 0);
        } else {
            // Запасной вариант – градиент (тоже можно искажать, но для простоты оставим без искажения)
            const gradient = ctx.createLinearGradient(0, 0, width, height);
            gradient.addColorStop(0, '#4b0082');
            gradient.addColorStop(1, '#8a2be2');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);
        }
    }

    function animate() {
        waveParams.time += 0.02 * waveParams.speed; // увеличиваем фазу
        drawDistorted();
        animationId = requestAnimationFrame(animate);
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
            // Перерисовываем с новым размером
            drawDistorted();
        };

        window.addEventListener('resize', resizeHandler);
        resizeHandler(); // устанавливаем размер

        // Загружаем изображение и после запускаем анимацию
        loadImage()
            .catch(() => {
                // даже если нет изображения, запускаем анимацию (будет градиент)
            })
            .finally(() => {
                animate();
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
