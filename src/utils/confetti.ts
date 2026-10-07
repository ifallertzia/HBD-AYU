// Safe, self-contained celebratory confetti engine
// Guarantees 100% compatibility across all mobile webviews, iframes, and sandboxes without canvas-confetti errors

interface ConfettiOptions {
  particleCount?: number;
  spread?: number;
  origin?: { x?: number; y?: number };
  colors?: string[];
  angle?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  vRot: number;
  opacity: number;
  shape: 'circle' | 'rect' | 'star';
  wobble: number;
  wobbleSpeed: number;
}

class ConfettiManager {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private particles: Particle[] = [];
  private animId: number | null = null;

  private initCanvas(): boolean {
    if (typeof window === 'undefined' || typeof document === 'undefined') return false;

    if (!this.canvas) {
      const existing = document.getElementById('cupcakeee-confetti-canvas') as HTMLCanvasElement;
      if (existing) {
        this.canvas = existing;
      } else {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'cupcakeee-confetti-canvas';
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100vw';
        this.canvas.style.height = '100vh';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '99999';
        document.body.appendChild(this.canvas);
      }
    }

    // Update dimensions
    const dpr = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;

    if (this.canvas.width !== width * dpr || this.canvas.height !== height * dpr) {
      this.canvas.width = width * dpr;
      this.canvas.height = height * dpr;
    }

    if (!this.ctx) {
      this.ctx = this.canvas.getContext('2d');
    }

    return !!this.ctx;
  }

  public fire(opts: ConfettiOptions = {}) {
    if (!this.initCanvas() || !this.ctx || !this.canvas) return;

    const count = opts.particleCount ?? 60;
    const colors = opts.colors ?? ['#f472b6', '#fb7185', '#fbbf24', '#c084fc', '#fde047', '#a7f3d0'];
    const originX = (opts.origin?.x ?? 0.5) * window.innerWidth;
    const originY = (opts.origin?.y ?? 0.6) * window.innerHeight;
    const baseAngle = opts.angle !== undefined ? (opts.angle * Math.PI) / 180 : -Math.PI / 2;
    const spreadRad = ((opts.spread ?? 70) * Math.PI) / 180;

    const shapes: ('circle' | 'rect' | 'star')[] = ['rect', 'circle', 'star'];

    for (let i = 0; i < count; i++) {
      const angle = baseAngle + (Math.random() - 0.5) * spreadRad;
      const speed = 7 + Math.random() * 12;

      this.particles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 5 + Math.random() * 6,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.25,
        opacity: 1,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.05 + Math.random() * 0.08,
      });
    }

    if (!this.animId) {
      this.animate();
    }
  }

  private animate = () => {
    if (!this.ctx || !this.canvas) {
      this.animId = null;
      return;
    }

    const dpr = window.devicePixelRatio || 1;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      // Physics update
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35; // gravity
      p.vx *= 0.985; // drag
      p.wobble += p.wobbleSpeed;
      p.rotation += p.vRot;
      p.opacity -= 0.009;

      if (p.opacity <= 0 || p.y > window.innerHeight + 50) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, p.opacity);
      this.ctx.fillStyle = p.color;

      const renderX = (p.x + Math.sin(p.wobble) * 4) * dpr;
      const renderY = p.y * dpr;
      const renderSize = p.size * dpr;

      this.ctx.translate(renderX, renderY);
      this.ctx.rotate(p.rotation);

      if (p.shape === 'circle') {
        this.ctx.beginPath();
        this.ctx.arc(0, 0, renderSize * 0.5, 0, Math.PI * 2);
        this.ctx.fill();
      } else if (p.shape === 'star') {
        // Draw 5-pointed star
        this.ctx.beginPath();
        for (let s = 0; s < 5; s++) {
          const a1 = (s * Math.PI * 2) / 5 - Math.PI / 2;
          const a2 = a1 + Math.PI / 5;
          const r1 = renderSize * 0.6;
          const r2 = renderSize * 0.25;
          if (s === 0) {
            this.ctx.moveTo(Math.cos(a1) * r1, Math.sin(a1) * r1);
          } else {
            this.ctx.lineTo(Math.cos(a1) * r1, Math.sin(a1) * r1);
          }
          this.ctx.lineTo(Math.cos(a2) * r2, Math.sin(a2) * r2);
        }
        this.ctx.closePath();
        this.ctx.fill();
      } else {
        // Rectangle ribbon
        this.ctx.fillRect(-renderSize * 0.6, -renderSize * 0.3, renderSize * 1.2, renderSize * 0.6);
      }

      this.ctx.restore();
    }

    if (this.particles.length > 0) {
      this.animId = requestAnimationFrame(this.animate);
    } else {
      this.animId = null;
      if (this.ctx && this.canvas) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      }
    }
  };
}

const manager = new ConfettiManager();

// Export a default function matching the canvas-confetti signature
export default function confetti(opts?: ConfettiOptions) {
  try {
    manager.fire(opts);
  } catch {
    // Graceful silent fallback
  }
}
