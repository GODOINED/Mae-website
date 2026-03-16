// custom_wallpaper.js — упрощённый эффект волны (WebGL)
(function() {
    let canvas, gl, program, texture, animationId, resizeHandler;
    let startTime;

    // Настройки волны (меняй значения)
    const amplitude = 0.05;   // сила искажения (0.05 = 5% от ширины экрана)
    const frequency = 15.0;    // частота волн
    const speed = 2.0;         // скорость движения

    // Вершинный шейдер (стандартный)
    const vertexShaderSource = `
        attribute vec2 aPosition;
        varying vec2 vUv;
        void main() {
            vUv = aPosition * 0.5 + 0.5;
            gl_Position = vec4(aPosition, 0.0, 1.0);
        }
    `;

    // Фрагментный шейдер с волной
    const fragmentShaderSource = `
        precision highp float;
        varying vec2 vUv;
        uniform sampler2D uTexture;
        uniform float uTime;
        uniform float uAmp;
        uniform float uFreq;
        uniform float uSpeed;

        void main() {
            float time = uTime * uSpeed;
            // Сдвиг по горизонтали зависит от вертикальной координаты
            float offset = uAmp * sin(vUv.y * uFreq + time);
            vec2 distortedUv = vec2(vUv.x + offset, vUv.y);
            // Зацикливаем, чтобы не было пустых краёв
            distortedUv.x = fract(distortedUv.x);
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
            return null;
        }
        return shader;
    }

    function initWebGL() {
        gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) {
            console.error('WebGL not supported');
            return false;
        }

        const vs = createShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
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

        // Вершинный буфер (квадрат из двух треугольников)
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

        // Получаем местоположения uniform-переменных
        const uTimeLoc = gl.getUniformLocation(program, 'uTime');
        const uAmpLoc = gl.getUniformLocation(program, 'uAmp');
        const uFreqLoc = gl.getUniformLocation(program, 'uFreq');
        const uSpeedLoc = gl.getUniformLocation(program, 'uSpeed');

        // Устанавливаем значения (один раз)
        gl.uniform1f(uAmpLoc, amplitude);
        gl.uniform1f(uFreqLoc, frequency);
        gl.uniform1f(uSpeedLoc, speed);

        // Сохраняем location времени для обновления в цикле
        program.uTimeLoc = uTimeLoc;

        // Текстура
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
        const seconds = (time - startTime) * 0.001;
        gl.uniform1f(program.uTimeLoc, seconds);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
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

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            if (gl) gl.viewport(0, 0, canvas.width, canvas.height);
        };
        window.addEventListener('resize', resize);
        resizeHandler = resize;
        resize();

        if (!initWebGL()) {
            fallback2D();
            return;
        }

        loadTexture('materialsl/wallpaper.jpg')
            .then(() => {
                startTime = performance.now();
                draw(startTime);
            })
            .catch(err => {
                console.error('Texture error:', err);
                fallback2D();
            });
    }

    function fallback2D() {
        console.log('Using 2D fallback gradient');
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
        if (animationId) cancelAnimationFrame(animationId);
        if (resizeHandler) window.removeEventListener('resize', resizeHandler);
        if (canvas) canvas.remove();
        canvas = gl = program = texture = null;
    }

    window.CustomWallpaper = { start, stop };
})();
