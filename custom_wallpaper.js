// custom_wallpaper.js — упрощённый для отладки
(function() {
    let canvas, gl, program, animationId, resizeHandler;

    const vertexShaderSource = `
        attribute vec2 aPosition;
        varying vec2 vUv;
        void main() {
            vUv = aPosition * 0.5 + 0.5;
            gl_Position = vec4(aPosition, 0.0, 1.0);
        }
    `;

    const fragmentShaderSource = `
        precision highp float;
        varying vec2 vUv;
        uniform float uTime;
        void main() {
            float amp = 0.1;
            float freq = 10.0;
            float offset = amp * sin(vUv.y * freq + uTime * 3.0);
            vec2 uv = vec2(vUv.x + offset, vUv.y);
            // Просто рисуем красный, яркость меняется в зависимости от uv
            float r = sin(uv.x * 10.0) * 0.5 + 0.5;
            gl_FragColor = vec4(r, 0.0, 0.0, 1.0);
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

    function init() {
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

        gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) {
            console.error('WebGL not supported');
            return;
        }

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            gl.viewport(0, 0, canvas.width, canvas.height);
        };
        window.addEventListener('resize', resize);
        resizeHandler = resize;
        resize();

        const vs = createShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
        const fs = createShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
        if (!vs || !fs) return;

        program = gl.createProgram();
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('Program link error:', gl.getProgramInfoLog(program));
            return;
        }
        gl.useProgram(program);

        const vertices = new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]);
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        const positionLoc = gl.getAttribLocation(program, 'aPosition');
        gl.enableVertexAttribArray(positionLoc);
        gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

        draw();
    }

    function draw(time) {
        if (!gl) return;
        const seconds = (time || 0) * 0.001;
        gl.uniform1f(gl.getUniformLocation(program, 'uTime'), seconds);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        animationId = requestAnimationFrame(draw);
    }

    function start() {
        if (!canvas) init();
    }

    function stop() {
        if (animationId) cancelAnimationFrame(animationId);
        if (resizeHandler) window.removeEventListener('resize', resizeHandler);
        if (canvas) canvas.remove();
        canvas = gl = program = null;
    }

    window.CustomWallpaper = { start, stop };
})();
