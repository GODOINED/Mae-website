// custom_wallpaper.js — WebGL эффект волны (GPU, без лагов)
(function() {
    let canvas = null;
    let gl = null;
    let program = null;
    let texture = null;
    let animationId = null;
    let resizeHandler = null;
    let startTime = null;

    // Вершинный шейдер (просто передаёт координаты)
    const vertexShaderSource = `
        attribute vec2 aPosition;
        varying vec2 vUv;
        void main() {
            vUv = aPosition * 0.5 + 0.5; // преобразуем из [-1,1] в [0,1]
            gl_Position = vec4(aPosition, 0.0, 1.0);
        }
    `;

    // Фрагментный шейдер — здесь происходит волшебство
    const fragmentShaderSource = `
        precision highp float;
        varying vec2 vUv;
        uniform sampler2D uTexture;
        uniform float uTime;

        void main() {
            float amp = 0.03;          // сила волны (чем больше, тем сильнее сдвиг)
            float freq = 10.0;          // частота волн
            float offset = amp * sin(vUv.y * freq + uTime * 3.0); // сдвиг по X
            vec2 distortedUv = vec2(vUv.x + offset, vUv.y);
            // Если изображение выходит за пределы, зацикливаем (можно заменить на обрезание)
            distortedUv.x = fract(distortedUv.x); // зацикливание
            vec4 color = texture2D(uTexture, distortedUv);
            gl_FragColor = color;
        }
    `;

    function createShader(gl, source, type) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('Shader compile error:', gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    function initWebGL() {
        gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) {
            console.error('WebGL not supported, falling back to canvas 2D');
            return false;
        }

        // Вершинный шейдер
        const vs = createShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
        // Фрагментный шейдер
        const fs = createShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
        if (!vs || !fs) return false;

        program = gl.createProgram();
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('Program link error:', gl.getProgramInfoLog(program));
            return false;
        }
        gl.useProgram(program);

        // Вершинные данные: два треугольника, покрывающие весь экран
        const vertices = new Float32Array([
            -1, -1,  1, -1, -1,  1,
            -1,  1,  1, -1,  1,  1
        ]);
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        const positionLoc = gl.getAttribLocation(program, 'aPosition');
        gl.enableVertexAttribArray(positionLoc);
        gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

        // Устанавливаем параметры текстуры
        gl.activeTexture(gl.TEXTURE0);
        gl.uniform1i(gl.getUniformLocation(program, 'uTexture'), 0);

        return true;
    }

    function loadTexture(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.src = url;
            img.onload = () => {
                if (!gl) return reject('WebGL not ready');
                texture = gl.createTexture();
                gl.bindTexture(gl.TEXTURE_2D, texture);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
                resolve();
            };
            img.onerror = () => reject('Failed to load image');
        });
    }

    function draw(time) {
        if (!gl || !program) return;

        const seconds = time * 0.001; // в секунды
        gl.uniform1f(gl.getUniformLocation(program, 'uTime'), seconds);

        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 6);

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

        // Устанавливаем размер в пикселях
        const resize = () => {
            if (!canvas) return;
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            if (gl) gl.viewport(0, 0, canvas.width, canvas.height);
        };
        window.addEventListener('resize', resize);
        resizeHandler = resize;
        resize();

        // Пытаемся инициализировать WebGL
        if (!initWebGL()) {
            // Fallback: если WebGL не работает, используем старый 2D-метод
            console.warn('WebGL not available, using 2D fallback');
            fallback2D();
            return;
        }

        // Загружаем текстуру
        loadTexture('materialsl/wallpaper.jpg')
            .then(() => {
                startTime = performance.now();
                animationId = requestAnimationFrame(draw);
            })
            .catch(err => {
                console.error('Texture load error:', err);
                // Падаем на 2D с градиентом
                fallback2D();
            });
    }

    function fallback2D() {
        // Простой 2D-градиент (как запасной вариант)
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        function drawGradient() {
            if (!ctx || !canvas) return;
            const width = canvas.width;
            const height = canvas.height;
            const gradient = ctx.createLinearGradient(0, 0, width, height);
            gradient.addColorStop(0, '#4b0082');
            gradient.addColorStop(1, '#8a2be2');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);
            animationId = requestAnimationFrame(drawGradient);
        }
        drawGradient();
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
        }
        gl = null;
        program = null;
        texture = null;
    }

    window.CustomWallpaper = {
        start: start,
        stop: stop
    };
})();
