/**
 * Circular Gallery — local adaptation of React Bits CircularGallery (ogl).
 * Customisations vs stock:
 * - Landscape 4:3 planes (stock is portrait 700×900).
 * - uFocus uniforms for cover-crop focal points (CSS object-fit cannot).
 * - Idle vertex ripple removed; planes stay composed illustrations.
 * - Pointer/keyboard scoped to the gallery; no window wheel hijack.
 * - Horizontal drag only; vertical page scroll preserved.
 * - Click-to-center with a movement threshold.
 * - onSettled(chapterIndex) after snap; goTo(chapterIndex) imperative API.
 * - Pause RAF when offscreen or the tab is hidden.
 * - Duplicate strip for visual loop; chapter IDs normalise to 0..n-1.
 */
import { Camera, Mesh, Plane, Program, Renderer, Texture, Transform } from './vendor/ogl.js';

function debounce(fn, wait) {
  let t;
  return function (...args) {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function autoBind(instance) {
  const proto = Object.getPrototypeOf(instance);
  Object.getOwnPropertyNames(proto).forEach((key) => {
    if (key !== 'constructor' && typeof instance[key] === 'function') {
      instance[key] = instance[key].bind(instance);
    }
  });
}

function getFontSize(font) {
  const match = font.match(/(\d+)px/);
  return match ? parseInt(match[1], 10) : 18;
}

function createTextTexture(gl, text, font, color) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  context.font = font;
  const metrics = context.measureText(text);
  const textWidth = Math.ceil(metrics.width);
  const textHeight = Math.ceil(getFontSize(font) * 1.2);
  canvas.width = textWidth + 24;
  canvas.height = textHeight + 16;
  context.font = font;
  context.fillStyle = color;
  context.textBaseline = 'middle';
  context.textAlign = 'center';
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillText(text, canvas.width / 2, canvas.height / 2);
  const texture = new Texture(gl, { generateMipmaps: false });
  texture.image = canvas;
  return { texture, width: canvas.width, height: canvas.height };
}

class Title {
  constructor({ gl, plane, text, textColor, font }) {
    autoBind(this);
    this.gl = gl;
    this.plane = plane;
    this.text = text;
    this.textColor = textColor;
    this.font = font;
    this.createMesh();
  }
  createMesh() {
    const { texture, width, height } = createTextTexture(this.gl, this.text, this.font, this.textColor);
    const geometry = new Plane(this.gl);
    const program = new Program(this.gl, {
      vertex: `attribute vec3 position; attribute vec2 uv; uniform mat4 modelViewMatrix; uniform mat4 projectionMatrix; varying vec2 vUv;
        void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragment: `precision highp float; uniform sampler2D tMap; varying vec2 vUv;
        void main(){ vec4 color = texture2D(tMap, vUv); if (color.a < 0.1) discard; gl_FragColor = color; }`,
      uniforms: { tMap: { value: texture } },
      transparent: true,
    });
    this.mesh = new Mesh(this.gl, { geometry, program });
    const aspect = width / height;
    const textHeight = this.plane.scale.y * 0.1;
    const textWidth = textHeight * aspect;
    this.mesh.scale.set(textWidth, textHeight, 1);
    this.mesh.position.y = -this.plane.scale.y * 0.5 - textHeight * 0.55 - 0.04;
    this.mesh.setParent(this.plane);
  }
}

class Media {
  constructor(opts) {
    Object.assign(this, opts);
    this.extra = 0;
    this.chapterIndex = opts.chapterIndex;
    this.focus = opts.focus || [0.5, 0.5];
    this.createShader();
    this.createMesh();
    this.createTitle();
    this.onResize();
  }
  createShader() {
    const texture = new Texture(this.gl, { generateMipmaps: true });
    this.program = new Program(this.gl, {
      depthTest: false,
      depthWrite: false,
      vertex: `precision highp float;
        attribute vec3 position; attribute vec2 uv;
        uniform mat4 modelViewMatrix; uniform mat4 projectionMatrix;
        varying vec2 vUv;
        void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragment: `precision highp float;
        uniform vec2 uImageSizes; uniform vec2 uPlaneSizes; uniform vec2 uFocus;
        uniform sampler2D tMap; uniform float uBorderRadius;
        varying vec2 vUv;
        float roundedBoxSDF(vec2 p, vec2 b, float r) {
          vec2 d = abs(p) - b;
          return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - r;
        }
        void main() {
          vec2 ratio = vec2(
            min((uPlaneSizes.x / uPlaneSizes.y) / (uImageSizes.x / uImageSizes.y), 1.0),
            min((uPlaneSizes.y / uPlaneSizes.x) / (uImageSizes.y / uImageSizes.x), 1.0)
          );
          vec2 focus = clamp(uFocus, 0.0, 1.0);
          vec2 uv = vec2(
            vUv.x * ratio.x + (1.0 - ratio.x) * focus.x,
            vUv.y * ratio.y + (1.0 - ratio.y) * focus.y
          );
          vec4 color = texture2D(tMap, uv);
          float d = roundedBoxSDF(vUv - 0.5, vec2(0.5 - uBorderRadius), uBorderRadius);
          float alpha = 1.0 - smoothstep(-0.002, 0.002, d);
          gl_FragColor = vec4(color.rgb, alpha);
        }`,
      uniforms: {
        tMap: { value: texture },
        uPlaneSizes: { value: [0, 0] },
        uImageSizes: { value: [1800, 1200] },
        uFocus: { value: this.focus },
        uBorderRadius: { value: this.borderRadius },
      },
      transparent: true,
    });
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      texture.image = img;
      this.program.uniforms.uImageSizes.value = [img.naturalWidth, img.naturalHeight];
    };
    img.onerror = () => {};
    img.src = this.image;
  }
  createMesh() {
    this.plane = new Mesh(this.gl, { geometry: this.geometry, program: this.program });
    this.plane.setParent(this.scene);
  }
  createTitle() {
    this.title = new Title({
      gl: this.gl,
      plane: this.plane,
      text: this.text,
      textColor: this.textColor,
      font: this.font,
    });
  }
  update(scroll, direction) {
    this.plane.position.x = this.x - scroll.current - this.extra;
    const x = this.plane.position.x;
    const H = this.viewport.width / 2;
    if (this.bend === 0) {
      this.plane.position.y = 0.28;
      this.plane.rotation.z = 0;
    } else {
      const B_abs = Math.abs(this.bend);
      const R = (H * H + B_abs * B_abs) / (2 * B_abs);
      const effectiveX = Math.min(Math.abs(x), H * 0.92);
      const arc = R - Math.sqrt(Math.max(R * R - effectiveX * effectiveX, 0));
      const rot = Math.asin(Math.min(effectiveX / R, 1)) * 0.45;
      if (this.bend > 0) {
        this.plane.position.y = -arc + 0.28;
        this.plane.rotation.z = -Math.sign(x) * rot;
      } else {
        this.plane.position.y = arc + 0.28;
        this.plane.rotation.z = Math.sign(x) * rot;
      }
    }
    const planeOffset = this.plane.scale.x / 2;
    const viewportOffset = this.viewport.width / 2;
    this.isBefore = this.plane.position.x + planeOffset < -viewportOffset;
    this.isAfter = this.plane.position.x - planeOffset > viewportOffset;
    if (direction === 'right' && this.isBefore) {
      this.extra -= this.widthTotal;
      this.isBefore = this.isAfter = false;
    }
    if (direction === 'left' && this.isAfter) {
      this.extra += this.widthTotal;
      this.isBefore = this.isAfter = false;
    }
  }
  onResize({ screen, viewport } = {}) {
    if (screen) this.screen = screen;
    if (viewport) this.viewport = viewport;
    const targetW = this.viewport.width * 0.32;
    this.plane.scale.x = targetW;
    this.plane.scale.y = targetW * 0.75;
    this.program.uniforms.uPlaneSizes.value = [this.plane.scale.x, this.plane.scale.y];
    if (this.title && this.title.mesh) {
      const aspect = this.title.mesh.scale.x / Math.max(this.title.mesh.scale.y, 0.001);
      const textHeight = this.plane.scale.y * 0.1;
      this.title.mesh.scale.set(textHeight * aspect, textHeight, 1);
      this.title.mesh.position.y = -this.plane.scale.y * 0.5 - textHeight * 0.55 - 0.04;
    }
    this.padding = this.viewport.width * 0.04;
    this.width = this.plane.scale.x + this.padding;
    this.widthTotal = this.width * this.length;
    this.x = this.width * this.index;
  }
}

class App {
  constructor(container, options) {
    this.container = container;
    this.items = options.items;
    this.chapterCount = options.items.length;
    this.scrollSpeed = options.scrollSpeed ?? 1;
    this.scroll = { ease: options.scrollEase ?? 0.06, current: 0, target: 0, last: 0 };
    this.bend = options.bend ?? 1.5;
    this.textColor = options.textColor ?? '#24483D';
    this.borderRadius = options.borderRadius ?? 0.025;
    this.font = options.font ?? '600 18px "Instrument Sans", sans-serif';
    this.onSettled = options.onSettled || function () {};
    this.suppressHash = false;
    this.programmatic = false;
    this.lastChapter = -1;
    this.wasSettled = false;
    this.isDown = false;
    this.dragging = false;
    this.visible = true;
    this.paused = false;
    this.destroyed = false;
    this.pointerId = null;
    this.startX = 0;
    this.startY = 0;
    this.onCheckDebounce = debounce(this.onCheck.bind(this), 160);
    this.createRenderer();
    this.createCamera();
    this.createScene();
    this.onResize();
    this.createGeometry();
    this.createMedias();
    this.addEventListeners();
    this.update();
  }
  createRenderer() {
    this.renderer = new Renderer({ alpha: true, antialias: true, dpr: Math.min(window.devicePixelRatio || 1, 2) });
    this.gl = this.renderer.gl;
    this.gl.clearColor(0, 0, 0, 0);
    this.container.appendChild(this.gl.canvas);
    this.gl.canvas.style.width = '100%';
    this.gl.canvas.style.height = '100%';
    this.gl.canvas.style.display = 'block';
    this.gl.canvas.style.touchAction = 'pan-y';
  }
  createCamera() {
    this.camera = new Camera(this.gl);
    this.camera.fov = 45;
    this.camera.position.z = 20;
  }
  createScene() {
    this.scene = new Transform();
  }
  createGeometry() {
    this.planeGeometry = new Plane(this.gl, { heightSegments: 1, widthSegments: 1 });
  }
  createMedias() {
    const galleryItems = this.items.concat(this.items);
    this.medias = galleryItems.map((data, index) =>
      new Media({
        geometry: this.planeGeometry,
        gl: this.gl,
        image: data.image,
        index,
        length: galleryItems.length,
        scene: this.scene,
        screen: this.screen,
        text: data.text,
        viewport: this.viewport,
        bend: this.bend,
        textColor: this.textColor,
        borderRadius: this.borderRadius,
        font: this.font,
        chapterIndex: data.chapterIndex,
        focus: data.focus,
      })
    );
  }
  centeredChapter() {
    if (!this.medias || !this.medias.length) return 0;
    let best = this.medias[0];
    let bestAbs = Infinity;
    this.medias.forEach((m) => {
      const ax = Math.abs(m.plane.position.x);
      if (ax < bestAbs) {
        bestAbs = ax;
        best = m;
      }
    });
    return best.chapterIndex;
  }
  goTo(chapterIndex, immediate) {
    if (!this.medias || !this.medias.length) return;
    const n = this.chapterCount;
    const i = ((chapterIndex % n) + n) % n;
    this.programmatic = true;
    let best = null;
    let bestAbs = Infinity;
    this.medias.forEach((m) => {
      if (m.chapterIndex !== i) return;
      const ax = Math.abs(m.plane.position.x);
      if (ax < bestAbs) {
        bestAbs = ax;
        best = m;
      }
    });
    if (!best) return;
    const dest = best.x - best.extra;
    this.scroll.target = dest;
    if (immediate) {
      this.scroll.current = dest;
      this.scroll.last = dest;
      this.medias.forEach((m) => m.update(this.scroll, "right"));
      this.emitSettled(i, true);
    }
  }
  emitSettled(chapter, fromProgrammatic) {
    if (chapter === this.lastChapter) {
      this.programmatic = false;
      return;
    }
    this.lastChapter = chapter;
    this.onSettled(chapter, { programmatic: fromProgrammatic || this.programmatic });
    this.programmatic = false;
  }
  onPointerDown(e) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    this.isDown = true;
    this.dragging = false;
    this.pointerId = e.pointerId;
    this.scroll.position = this.scroll.current;
    this.startX = e.clientX;
    this.startY = e.clientY;
    try {
      this.container.setPointerCapture(e.pointerId);
    } catch (err) {
      /* ignore */
    }
  }
  onPointerMove(e) {
    if (!this.isDown) return;
    const dx = e.clientX - this.startX;
    const dy = e.clientY - this.startY;
    if (!this.dragging && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) {
      this.dragging = true;
    }
    if (!this.dragging) return;
    if (e.cancelable) e.preventDefault();
    const distance = (this.startX - e.clientX) * (this.scrollSpeed * 0.025);
    this.scroll.target = this.scroll.position + distance;
  }
  onPointerUp(e) {
    if (!this.isDown) return;
    this.isDown = false;
    const dx = e.clientX - this.startX;
    const dy = e.clientY - this.startY;
    const wasDrag = this.dragging || Math.hypot(dx, dy) > 10;
    this.dragging = false;
    try {
      this.container.releasePointerCapture(this.pointerId);
    } catch (err) {
      /* ignore */
    }
    if (!wasDrag) this.onTap(e.clientX);
    else this.onCheck();
  }
  onTap(clientX) {
    const rect = this.container.getBoundingClientRect();
    const nx = ((clientX - rect.left) / Math.max(rect.width, 1) - 0.5) * this.viewport.width;
    let best = null;
    let bestAbs = Infinity;
    this.medias.forEach((m) => {
      const ax = Math.abs(m.plane.position.x - nx);
      if (ax < bestAbs) {
        bestAbs = ax;
        best = m;
      }
    });
    if (best) this.goTo(best.chapterIndex);
  }
  onKeyDown(e) {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      this.goTo(Math.min(this.lastChapter + 1, this.chapterCount - 1));
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      this.goTo(Math.max(this.lastChapter - 1, 0));
    }
  }
  onCheck() {
    if (!this.medias || !this.medias[0]) return;
    const width = this.medias[0].width;
    const itemIndex = Math.round(this.scroll.target / width);
    this.scroll.target = itemIndex * width;
  }
  onResize() {
    this.screen = { width: this.container.clientWidth, height: this.container.clientHeight };
    this.renderer.setSize(this.screen.width, this.screen.height);
    this.camera.perspective({ aspect: this.screen.width / this.screen.height });
    const fov = (this.camera.fov * Math.PI) / 180;
    const height = 2 * Math.tan(fov / 2) * this.camera.position.z;
    const width = height * this.camera.aspect;
    this.viewport = { width, height };
    if (this.medias) this.medias.forEach((media) => media.onResize({ screen: this.screen, viewport: this.viewport }));
  }
  update() {
    if (this.destroyed) return;
    this.raf = window.requestAnimationFrame(this.update.bind(this));
    if (this.paused || document.hidden || !this.visible) return;
    this.scroll.current = lerp(this.scroll.current, this.scroll.target, this.scroll.ease);
    const direction = this.scroll.current > this.scroll.last ? 'right' : 'left';
    if (this.medias) this.medias.forEach((media) => media.update(this.scroll, direction));
    this.renderer.render({ scene: this.scene, camera: this.camera });
    const settled =
      Math.abs(this.scroll.target - this.scroll.current) < 0.04 &&
      Math.abs(this.scroll.current - this.scroll.last) < 0.04;
    if (settled && !this.wasSettled) this.emitSettled(this.centeredChapter(), this.programmatic);
    this.wasSettled = settled;
    this.scroll.last = this.scroll.current;
  }
  addEventListeners() {
    this.boundResize = this.onResize.bind(this);
    this.boundDown = this.onPointerDown.bind(this);
    this.boundMove = this.onPointerMove.bind(this);
    this.boundUp = this.onPointerUp.bind(this);
    this.boundKey = this.onKeyDown.bind(this);
    window.addEventListener('resize', this.boundResize);
    this.container.addEventListener('pointerdown', this.boundDown);
    this.container.addEventListener('pointermove', this.boundMove);
    this.container.addEventListener('pointerup', this.boundUp);
    this.container.addEventListener('pointercancel', this.boundUp);
    this.container.addEventListener('keydown', this.boundKey);
    this.io = new IntersectionObserver(
      ([entry]) => {
        this.visible = Boolean(entry && entry.isIntersecting);
      },
      { threshold: 0.05 }
    );
    this.io.observe(this.container);
  }
  destroy() {
    this.destroyed = true;
    window.cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this.boundResize);
    this.container.removeEventListener('pointerdown', this.boundDown);
    this.container.removeEventListener('pointermove', this.boundMove);
    this.container.removeEventListener('pointerup', this.boundUp);
    this.container.removeEventListener('pointercancel', this.boundUp);
    this.container.removeEventListener('keydown', this.boundKey);
    if (this.io) this.io.disconnect();
    if (this.renderer && this.renderer.gl && this.renderer.gl.canvas.parentNode) {
      this.renderer.gl.canvas.parentNode.removeChild(this.renderer.gl.canvas);
    }
  }
}

export function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return Boolean(c.getContext('webgl2') || c.getContext('webgl') || c.getContext('experimental-webgl'));
  } catch (err) {
    return false;
  }
}

export function mount(container, options) {
  const app = new App(container, options);
  return {
    goTo: (i, immediate) => app.goTo(i, immediate),
    destroy: () => app.destroy(),
    getChapter: () => app.lastChapter,
  };
}

window.CKMCircularGallery = { mount, hasWebGL };
