/** Direct translation of the approved code.html neural-canvas algorithm.
 *
 * Reference: code.html lines 96-263. Preserved: particle distribution, speed,
 * pulse, pointer repulsion, scroll drift, proximity links and theme colors.
 * Bounded: 45-110 particles, DPR <=2, one rAF loop, squared-distance rejection.
 */

export const backdropPalette = {
  light: {
    particle: "rgba(238, 119, 88, 0.88)",
    particleGlow: "rgba(238, 119, 88, 0.5)",
    connection: "#ee7758",
    pointer: "#ee7758",
  },
  dark: {
    particle: "rgba(243, 131, 97, 0.9)",
    particleGlow: "rgba(243, 131, 97, 0.65)",
    connection: "#f38361",
    pointer: "#feddc7",
  },
} as const;

export const backdropConfig = {
  minParticles: 45,
  maxParticles: 110,
  areaPerParticle: 14_000,
  maxDpr: 2,
  minRadius: 1.2,
  radiusRange: 1.8,
  velocityRange: 0.75,
  pulseStep: 0.035,
  pulseRadius: 0.5,
  depthBase: 0.3,
  depthRange: 0.8,
  pointerRadius: 150,
  pointerForce: 2.2,
  connectionDistance: 125,
  connectionAlpha: 0.42,
  pointerAlpha: 0.6,
  scrollFactor: 0.12,
  maxScrollDrift: 15,
  scrollDamping: 0.92,
  shadowBlur: 8,
  wrapMargin: 10,
} as const;

type Theme = keyof typeof backdropPalette;

export function particleCountForViewport(width: number, height: number): number {
  const areaCount = Math.floor((Math.max(1, width) * Math.max(1, height)) / backdropConfig.areaPerParticle);
  return Math.min(Math.max(backdropConfig.minParticles, areaCount), backdropConfig.maxParticles);
}

function isDarkTheme(root: HTMLElement): boolean {
  const theme = root.dataset.theme;
  return theme ? theme === "dark" : root.classList.contains("dark");
}

interface Pointer {
  x: number | null;
  y: number | null;
}

class Particle {
  x: number;
  y: number;
  baseRadius: number;
  radius: number;
  vx: number;
  vy: number;
  pulse: number;
  depthFactor: number;

  constructor(width: number, height: number, random: () => number) {
    this.x = random() * width;
    this.y = random() * height;
    this.baseRadius = random() * backdropConfig.radiusRange + backdropConfig.minRadius;
    this.radius = this.baseRadius;
    this.vx = (random() - 0.5) * backdropConfig.velocityRange;
    this.vy = (random() - 0.5) * backdropConfig.velocityRange;
    this.pulse = random() * Math.PI * 2;
    this.depthFactor = random() * backdropConfig.depthRange + backdropConfig.depthBase;
  }

  update(width: number, height: number, pointer: Pointer, scrollDrift: number): void {
    this.pulse += backdropConfig.pulseStep;
    this.radius = this.baseRadius + Math.sin(this.pulse) * backdropConfig.pulseRadius;
    this.x += this.vx;
    this.y += this.vy - scrollDrift * this.depthFactor;

    const margin = backdropConfig.wrapMargin;
    if (this.x < -margin) this.x = width + margin;
    else if (this.x > width + margin) this.x = -margin;
    if (this.y < -margin) this.y = height + margin;
    else if (this.y > height + margin) this.y = -margin;

    if (pointer.x === null || pointer.y === null) return;
    const dx = pointer.x - this.x;
    const dy = pointer.y - this.y;
    const distanceSquared = dx * dx + dy * dy;
    const radiusSquared = backdropConfig.pointerRadius ** 2;
    if (distanceSquared <= 0 || distanceSquared >= radiusSquared) return;
    const distance = Math.sqrt(distanceSquared);
    const force = (backdropConfig.pointerRadius - distance) / backdropConfig.pointerRadius;
    this.x -= (dx / distance) * force * backdropConfig.pointerForce;
    this.y -= (dy / distance) * force * backdropConfig.pointerForce;
  }

  /** The canvas fill/shadow style is set once per frame, matching the reference colors. */
  draw(context: CanvasRenderingContext2D): void {
    context.beginPath();
    context.arc(this.x, this.y, Math.max(0.5, this.radius), 0, Math.PI * 2);
    context.fill();
  }
}

export interface NeuralBackdropOptions {
  canvas: HTMLCanvasElement;
  window: Window;
  requestFrame?: (callback: FrameRequestCallback) => number;
  cancelFrame?: (handle: number) => void;
  random?: () => number;
}

export interface NeuralBackdropController {
  start(): void;
  destroy(): void;
}

export function createNeuralBackdrop({
  canvas,
  window: view,
  requestFrame,
  cancelFrame,
  random = Math.random,
}: NeuralBackdropOptions): NeuralBackdropController | null {
  const renderContext = canvas.getContext("2d");
  if (!renderContext) return null;
  const context: CanvasRenderingContext2D = renderContext;

  const document = view.document;
  const root = document.documentElement;
  const request = requestFrame ?? ((callback: FrameRequestCallback) => view.requestAnimationFrame(callback));
  const cancel = cancelFrame ?? ((handle: number) => view.cancelAnimationFrame(handle));

  const pointer: Pointer = { x: null, y: null };
  let width = 1;
  let height = 1;
  let dpr = 1;
  let particles: Particle[] = [];
  let lastScrollY = view.scrollY || 0;
  let scrollVelocity = 0;
  let frame: number | null = null;
  let started = false;
  let destroyed = false;
  let resizePending = true;
  let dprMedia: MediaQueryList | null = null;

  function makeParticle(): Particle {
    return new Particle(width, height, random);
  }

  function syncParticleCount(): void {
    const target = particleCountForViewport(width, height);
    while (particles.length < target) particles.push(makeParticle());
    if (particles.length > target) particles.length = target;
    for (const particle of particles) {
      if (particle.x < 0) particle.x += width;
      else if (particle.x > width) particle.x %= width;
      if (particle.y < 0) particle.y += height;
      else if (particle.y > height) particle.y %= height;
    }
  }

  function syncSize(reinitialize = false): void {
    const nextWidth = Math.max(1, view.innerWidth);
    const nextHeight = Math.max(1, view.innerHeight);
    const nextDpr = Math.min(view.devicePixelRatio || 1, backdropConfig.maxDpr);
    if (!reinitialize && nextWidth === width && nextHeight === height && nextDpr === dpr) {
      resizePending = false;
      return;
    }

    const dprChanged = nextDpr !== dpr;
    width = nextWidth;
    height = nextHeight;
    dpr = nextDpr;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.scale(dpr, dpr);

    if (reinitialize || particles.length === 0) particles = Array.from({ length: particleCountForViewport(width, height) }, makeParticle);
    else syncParticleCount();
    if (dprChanged && dprMedia) watchDpr();
    resizePending = false;
  }

  function connectParticles(theme: Theme): void {
    const maxDistance = backdropConfig.connectionDistance;
    const maxDistanceSquared = maxDistance ** 2;
    const pointerRadiusSquared = backdropConfig.pointerRadius ** 2;
    const palette = backdropPalette[theme];

    for (let a = 0; a < particles.length; a++) {
      const first = particles[a];
      context.lineWidth = 1;
      context.strokeStyle = palette.connection;

      for (let b = a + 1; b < particles.length; b++) {
        const second = particles[b];
        const dx = first.x - second.x;
        const dy = first.y - second.y;
        const distanceSquared = dx * dx + dy * dy;
        if (distanceSquared >= maxDistanceSquared) continue;

        const alpha = (1 - Math.sqrt(distanceSquared) / maxDistance) * backdropConfig.connectionAlpha;
        context.globalAlpha = alpha;
        context.beginPath();
        context.moveTo(first.x, first.y);
        context.lineTo(second.x, second.y);
        context.stroke();
      }

      if (pointer.x === null || pointer.y === null) continue;
      const dx = first.x - pointer.x;
      const dy = first.y - pointer.y;
      const distanceSquared = dx * dx + dy * dy;
      if (distanceSquared >= pointerRadiusSquared) continue;

      const alpha = (1 - Math.sqrt(distanceSquared) / backdropConfig.pointerRadius) * backdropConfig.pointerAlpha;
      context.lineWidth = 1.3;
      context.strokeStyle = palette.pointer;
      context.globalAlpha = alpha;
      context.beginPath();
      context.moveTo(first.x, first.y);
      context.lineTo(pointer.x, pointer.y);
      context.stroke();
    }

    context.globalAlpha = 1;
  }

  function draw(): void {
    const theme: Theme = isDarkTheme(root) ? "dark" : "light";
    const palette = backdropPalette[theme];
    context.clearRect(0, 0, width, height);
    scrollVelocity *= backdropConfig.scrollDamping;

    for (const particle of particles) particle.update(width, height, pointer, scrollVelocity);

    context.fillStyle = palette.particle;
    context.shadowColor = palette.particleGlow;
    context.shadowBlur = backdropConfig.shadowBlur;
    for (const particle of particles) particle.draw(context);
    context.shadowBlur = 0;

    connectParticles(theme);
  }

  function schedule(): void {
    if (!started || destroyed || document.hidden || frame !== null) return;
    frame = request(render);
  }

  function render(): void {
    frame = null;
    if (!started || destroyed || document.hidden) return;
    if (resizePending) syncSize();
    draw();
    schedule();
  }

  function onVisibilityChange(): void {
    if (document.hidden) {
      if (frame !== null) {
        cancel(frame);
        frame = null;
      }
      return;
    }
    if (!started || destroyed) return;
    lastScrollY = view.scrollY || 0;
    scrollVelocity = 0;
    resizePending = true;
    schedule();
  }

  function onResize(): void {
    resizePending = true;
    schedule();
  }

  function onDprChange(): void {
    resizePending = true;
    watchDpr();
    schedule();
  }

  function watchDpr(): void {
    if (typeof view.matchMedia !== "function") return;
    if (dprMedia) dprMedia.removeEventListener("change", onDprChange);
    dprMedia = view.matchMedia(`(resolution: ${view.devicePixelRatio || 1}dppx)`);
    dprMedia.addEventListener("change", onDprChange);
  }

  function onScroll(): void {
    const currentScrollY = view.scrollY || 0;
    const delta = currentScrollY - lastScrollY;
    lastScrollY = currentScrollY;
    scrollVelocity += Math.max(
      Math.min(delta * backdropConfig.scrollFactor, backdropConfig.maxScrollDrift),
      -backdropConfig.maxScrollDrift,
    );
  }

  function onPointerMove(event: MouseEvent): void {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
  }

  function onPointerLeave(): void {
    pointer.x = null;
    pointer.y = null;
  }

  return {
    start() {
      if (started || destroyed) return;
      started = true;
      lastScrollY = view.scrollY || 0;
      scrollVelocity = 0;
      syncSize(true);
      view.addEventListener("resize", onResize, { passive: true });
      view.addEventListener("scroll", onScroll, { passive: true });
      view.addEventListener("mousemove", onPointerMove, { passive: true });
      view.addEventListener("mouseleave", onPointerLeave, { passive: true });
      document.addEventListener("visibilitychange", onVisibilityChange);
      watchDpr();
      schedule();
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      started = false;
      if (frame !== null) {
        cancel(frame);
        frame = null;
      }
      view.removeEventListener("resize", onResize);
      view.removeEventListener("scroll", onScroll);
      view.removeEventListener("mousemove", onPointerMove);
      view.removeEventListener("mouseleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      dprMedia?.removeEventListener("change", onDprChange);
      dprMedia = null;
      context.clearRect(0, 0, width, height);
      context.globalAlpha = 1;
    },
  };
}
