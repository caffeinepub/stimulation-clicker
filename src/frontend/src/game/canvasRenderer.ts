export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number; // 0-1
  size: number;
  color: string;
  type: "spark" | "confetti" | "star" | "cat" | "emoji";
  emoji?: string;
  rotation?: number;
  rotSpeed?: number;
  width?: number; // for confetti
  height?: number;
}

export interface FloatingText {
  x: number;
  y: number;
  text: string;
  life: number;
  color: string;
  size: number;
  vy: number;
}

export interface ChaosEntity {
  type:
    | "disco"
    | "ufo"
    | "laser"
    | "firework"
    | "meteor"
    | "spiral"
    | "void"
    | "glitch"
    | "strobe";
  x: number;
  y: number;
  vx?: number;
  vy?: number;
  progress: number; // 0-1
  life: number; // 0-1
  params?: Record<string, number | string | boolean>;
}

export interface RendererState {
  particles: Particle[];
  floatingTexts: FloatingText[];
  chaosEntities: ChaosEntity[];
  upgrades: Record<string, number>;
  stimulationLevel: number;
  rainbowHue: number;
  screenShakeX: number;
  screenShakeY: number;
  manicModeActive: boolean;
  timeWarpActive: boolean;
  timeWarpFactor: number;
}

const NEON_COLORS = [
  "#ff2d78",
  "#00f5ff",
  "#39ff14",
  "#ff6b00",
  "#bf00ff",
  "#ffff00",
  "#ff007f",
  "#00ffcc",
];

function randomNeon(): string {
  return NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)];
}

export function spawnClickParticles(
  particles: Particle[],
  x: number,
  y: number,
  count: number,
  stimulation: number,
): void {
  const extraCount = Math.floor(stimulation / 40); // was /20, halved to reduce particle flood
  const total = Math.min(count + extraCount, 20); // hard cap per click
  for (let i = 0; i < total; i++) {
    const angle = (Math.PI * 2 * i) / total + Math.random() * 0.5;
    const speed = 2 + Math.random() * 5 * (1 + stimulation / 50);
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2,
      life: 1,
      size: 3 + Math.random() * 5,
      color: randomNeon(),
      type: "spark",
    });
  }
}

export function spawnFloatingText(
  floatingTexts: FloatingText[],
  x: number,
  y: number,
  text: string,
  color = "#ff2d78",
  size = 22,
): void {
  floatingTexts.push({
    x: x + (Math.random() - 0.5) * 20,
    y,
    text,
    life: 1,
    color,
    size,
    vy: -1.5 - Math.random() * 1,
  });
}

export function spawnConfetti(
  particles: Particle[],
  count: number,
  width: number,
  height: number,
): void {
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height * 0.5,
      vx: (Math.random() - 0.5) * 3,
      vy: 1 + Math.random() * 3,
      life: 1,
      size: 6,
      color: randomNeon(),
      type: "confetti",
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.2,
      width: 6 + Math.random() * 6,
      height: 4 + Math.random() * 4,
    });
  }
}

export function spawnFallingCat(particles: Particle[], width: number): void {
  particles.push({
    x: Math.random() * width,
    y: -30,
    vx: (Math.random() - 0.5) * 2,
    vy: 2 + Math.random() * 3,
    life: 1,
    size: 24,
    color: "#fff",
    type: "cat",
    emoji: ["🐱", "😺", "🐈", "🐾"][Math.floor(Math.random() * 4)],
  });
}

export function spawnEmojiTsunami(
  particles: Particle[],
  _width: number,
  height: number,
  count: number,
): void {
  const emojis = [
    "🌊",
    "🎉",
    "💥",
    "🌈",
    "⚡",
    "🔥",
    "💫",
    "🎊",
    "🤯",
    "👾",
    "🎮",
    "🚀",
    "💀",
    "🌀",
  ];
  for (let i = 0; i < count; i++) {
    particles.push({
      x: -50 - i * 60,
      y: Math.random() * height,
      vx: 8 + Math.random() * 5,
      vy: (Math.random() - 0.5) * 2,
      life: 1,
      size: 28,
      color: "#fff",
      type: "emoji",
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
    });
  }
}

export function spawnFirework(
  entities: ChaosEntity[],
  width: number,
  height: number,
): void {
  entities.push({
    type: "firework",
    x: 100 + Math.random() * (width - 200),
    y: 80 + Math.random() * (height * 0.5),
    progress: 0,
    life: 1,
    params: { color: randomNeon(), size: 4 + Math.random() * 8 },
  });
}

export function spawnMeteor(
  entities: ChaosEntity[],
  width: number,
  _height: number,
): void {
  entities.push({
    type: "meteor",
    x: Math.random() * width,
    y: -20,
    vx: 4 + Math.random() * 6,
    vy: 3 + Math.random() * 5,
    progress: 0,
    life: 1,
    params: { color: randomNeon() },
  });
}

export function spawnUFO(
  entities: ChaosEntity[],
  width: number,
  height: number,
): void {
  entities.push({
    type: "ufo",
    x: -150,
    y: 60 + Math.random() * (height * 0.3),
    vx: 3 + Math.random() * 3,
    progress: 0,
    life: 1,
    params: { width, speed: 3 + Math.random() * 2 },
  });
}

export function renderFrame(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  state: RendererState,
  _dt: number,
  time: number,
): void {
  const { width, height } = canvas;
  const stim = state.stimulationLevel;

  // Apply screen shake
  ctx.save();
  ctx.translate(state.screenShakeX, state.screenShakeY);

  // Background
  if (state.upgrades.rainbow_mode > 0) {
    const hue = state.rainbowHue % 360;
    ctx.fillStyle = `hsl(${hue}, 60%, 4%)`;
  } else {
    ctx.fillStyle = "#050510";
  }
  ctx.fillRect(0, 0, width, height);

  // Background atmosphere overlay (cheap single fill instead of many rects)
  if (stim > 20) {
    ctx.fillStyle = `rgba(255,255,255,${(stim - 20) * 0.0003})`;
    ctx.fillRect(0, 0, width, height);
  }

  // Hypno spiral (optimized: single stroke path per arm)
  if (state.upgrades.hypno_spiral > 0) {
    const spiralCount = state.upgrades.hypno_spiral;
    const cx = width / 2;
    const cy = height / 2;
    const baseHue = (time * 0.1) % 360;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(time * 0.001);
    ctx.globalAlpha = 0.25 + spiralCount * 0.05;
    for (let arm = 0; arm < 4; arm++) {
      ctx.beginPath();
      let first = true;
      for (let r = 0; r < 300; r += 6) {
        const angle = r * 0.08 + arm * (Math.PI / 2);
        const x = r * Math.cos(angle);
        const y = r * Math.sin(angle);
        if (first) {
          ctx.moveTo(x, y);
          first = false;
        } else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `hsl(${(baseHue + arm * 90) % 360}, 100%, 65%)`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  // Void rift
  if (state.upgrades.void_rift > 0) {
    const cx = width * 0.5;
    const cy = height * 0.5;
    const pulseSize = 80 + Math.sin(time * 0.003) * 40;
    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, pulseSize * 2);
    gradient.addColorStop(0, "rgba(0,0,0,0.9)");
    gradient.addColorStop(0.5, "rgba(50,0,80,0.4)");
    gradient.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cx, cy, pulseSize * 2, 0, Math.PI * 2);
    ctx.fill();
    // Ring
    ctx.beginPath();
    ctx.arc(cx, cy, pulseSize, 0, Math.PI * 2);
    ctx.strokeStyle = "#9900ff";
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.6 + Math.sin(time * 0.005) * 0.4;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // Laser grid
  if (state.upgrades.laser_grid > 0) {
    const lCount = state.upgrades.laser_grid;
    for (let i = 0; i < lCount; i++) {
      const offset = ((time * 0.3 + i * 80) % (width + 200)) - 100;
      ctx.beginPath();
      ctx.moveTo(offset, 0);
      ctx.lineTo(offset + 60, height);
      ctx.strokeStyle = `hsl(${(i * 60 + time * 0.2) % 360}, 100%, 60%)`;
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.4;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    // Horizontal laser
    const yOffset = ((time * 0.2) % (height + 200)) - 100;
    ctx.beginPath();
    ctx.moveTo(0, yOffset);
    ctx.lineTo(width, yOffset + 30);
    ctx.strokeStyle = "#ff2d78";
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.5;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // Neon pulse overlay
  if (state.upgrades.neon_pulse > 0) {
    const pulseAlpha =
      (Math.sin(time * 0.005) * 0.5 + 0.5) *
      0.15 *
      (state.upgrades.neon_pulse / 10);
    ctx.strokeStyle = "#ff2d78";
    ctx.lineWidth = 4;
    ctx.globalAlpha = pulseAlpha;
    ctx.strokeRect(2, 2, width - 4, height - 4);
    ctx.strokeStyle = "#00f5ff";
    ctx.lineWidth = 2;
    ctx.globalAlpha = pulseAlpha * 0.7;
    ctx.strokeRect(10, 10, width - 20, height - 20);
    ctx.globalAlpha = 1;
  }

  // Particle storm (constant falling from top)
  if (state.upgrades.particle_storm > 0) {
    // Spawning is handled externally; we just render existing particles
  }

  // Brain overload flash
  if (
    state.upgrades.brain_overload > 0 &&
    Math.random() < 0.01 * state.upgrades.brain_overload
  ) {
    const hue = Math.random() * 360;
    ctx.fillStyle = `hsla(${hue}, 100%, 50%, 0.12)`;
    ctx.fillRect(0, 0, width, height);
  }

  // Reality glitch
  if (state.upgrades.reality_glitch > 0) {
    if (Math.random() < 0.05 * state.upgrades.reality_glitch) {
      const glitchCount = Math.floor(state.upgrades.reality_glitch * 3);
      for (let i = 0; i < glitchCount; i++) {
        const gx = Math.random() * width;
        const gy = Math.random() * height;
        const gw = 20 + Math.random() * 150;
        const gh = 2 + Math.random() * 20;
        ctx.fillStyle = `hsla(${Math.random() * 360}, 100%, 60%, 0.3)`;
        ctx.fillRect(gx, gy, gw, gh);
        // Offset duplicate
        ctx.fillStyle = `hsla(${Math.random() * 360}, 100%, 60%, 0.15)`;
        ctx.fillRect(gx + 5, gy, gw, gh);
      }
    }
  }

  // Manic mode overlay
  if (state.manicModeActive) {
    ctx.fillStyle = "rgba(255, 200, 0, 0.05)";
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = "#ffff00";
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.5 + Math.sin(time * 0.02) * 0.3;
    ctx.strokeRect(3, 3, width - 6, height - 6);
    ctx.globalAlpha = 1;
  }

  // Strobe flash
  if (state.upgrades.strobe_flash > 0) {
    const strobeFreq = state.upgrades.strobe_flash * 0.006;
    if (Math.sin(time * strobeFreq) > 0.9) {
      ctx.fillStyle = `rgba(255,255,255,${0.1 * state.upgrades.strobe_flash})`;
      ctx.fillRect(0, 0, width, height);
    }
  }

  // Screen shake effect (visual indicator)
  if (state.upgrades.screen_shake > 0) {
    // Shake is applied via transform above
  }

  // ── Render chaos entities ──────────────────────────────────
  for (const entity of state.chaosEntities) {
    ctx.save();
    switch (entity.type) {
      case "firework": {
        const fRadius =
          entity.progress * (80 + ((entity.params?.size as number) || 4) * 5);
        const color = (entity.params?.color as string) || "#ff2d78";
        // Trail particles
        for (let i = 0; i < 12; i++) {
          const angle = (Math.PI * 2 * i) / 12;
          const px = entity.x + Math.cos(angle) * fRadius;
          const py = entity.y + Math.sin(angle) * fRadius;
          ctx.beginPath();
          ctx.arc(px, py, 3, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.globalAlpha = entity.life * 0.8;
          ctx.fill();
          // Inner sparks
          const fRadius2 = fRadius * 0.6;
          const px2 = entity.x + Math.cos(angle + 0.3) * fRadius2;
          const py2 = entity.y + Math.sin(angle + 0.3) * fRadius2;
          ctx.beginPath();
          ctx.arc(px2, py2, 2, 0, Math.PI * 2);
          ctx.fillStyle = "#ffffff";
          ctx.globalAlpha = entity.life * 0.5;
          ctx.fill();
        }
        // Expanding ring
        ctx.beginPath();
        ctx.arc(entity.x, entity.y, fRadius, 0, Math.PI * 2);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.globalAlpha = entity.life * 0.4;
        ctx.stroke();
        break;
      }

      case "meteor": {
        const mx = entity.x + (entity.vx || 0) * entity.progress * 20;
        const my = entity.y + (entity.vy || 0) * entity.progress * 20;
        const color = (entity.params?.color as string) || "#ff6b00";
        // Trail
        for (let t = 0; t < 10; t++) {
          const tx = mx - (entity.vx || 0) * t * 4;
          const ty = my - (entity.vy || 0) * t * 4;
          ctx.beginPath();
          ctx.arc(tx, ty, 4 - t * 0.3, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.globalAlpha = entity.life * (1 - t / 10) * 0.7;
          ctx.fill();
        }
        // Head
        ctx.beginPath();
        ctx.arc(mx, my, 5, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.globalAlpha = entity.life;
        ctx.fill();
        break;
      }

      case "ufo": {
        const ux = entity.x;
        const uy = entity.y;
        // UFO body
        ctx.beginPath();
        ctx.ellipse(ux, uy, 60, 20, 0, 0, Math.PI * 2);
        ctx.fillStyle = "#c0c0c0";
        ctx.globalAlpha = entity.life * 0.9;
        ctx.fill();
        // UFO dome
        ctx.beginPath();
        ctx.ellipse(ux, uy - 10, 30, 20, 0, Math.PI, 0);
        ctx.fillStyle = "#00f5ff";
        ctx.globalAlpha = entity.life * 0.7;
        ctx.fill();
        // Lights
        const lightColors = ["#ff2d78", "#ffff00", "#39ff14", "#00f5ff"];
        for (let i = 0; i < 4; i++) {
          ctx.beginPath();
          ctx.arc(ux - 40 + i * 25, uy + 15, 5, 0, Math.PI * 2);
          ctx.fillStyle = lightColors[i];
          ctx.globalAlpha =
            entity.life * (0.5 + Math.sin(time * 0.01 + i) * 0.5);
          ctx.fill();
        }
        // Abduction beam
        ctx.beginPath();
        ctx.moveTo(ux - 25, uy + 18);
        ctx.lineTo(ux + 25, uy + 18);
        ctx.lineTo(ux + 60, uy + 160);
        ctx.lineTo(ux - 60, uy + 160);
        ctx.closePath();
        const beamGrad = ctx.createLinearGradient(ux, uy + 18, ux, uy + 160);
        beamGrad.addColorStop(0, "rgba(0,245,255,0.5)");
        beamGrad.addColorStop(1, "rgba(0,245,255,0)");
        ctx.fillStyle = beamGrad;
        ctx.globalAlpha = entity.life * 0.6;
        ctx.fill();
        break;
      }

      case "disco": {
        ctx.translate(entity.x, entity.y);
        const ballSize = 40;
        // Disco ball circle
        ctx.beginPath();
        ctx.arc(0, 0, ballSize, 0, Math.PI * 2);
        const ballGrad = ctx.createRadialGradient(-10, -10, 2, 0, 0, ballSize);
        ballGrad.addColorStop(0, "#ffffff");
        ballGrad.addColorStop(0.3, "#c0c0c0");
        ballGrad.addColorStop(1, "#606060");
        ctx.fillStyle = ballGrad;
        ctx.globalAlpha = 0.9;
        ctx.fill();
        // Mirror tiles
        for (let row = 0; row < 8; row++) {
          for (let col = 0; col < 8; col++) {
            const tx = -ballSize + col * 11;
            const ty = -ballSize + row * 11;
            const dist = Math.sqrt(tx * tx + ty * ty);
            if (dist < ballSize) {
              ctx.fillStyle = `hsl(${(row * 40 + col * 30 + time * 0.5) % 360}, 100%, 70%)`;
              ctx.globalAlpha = 0.7;
              ctx.fillRect(tx, ty, 9, 9);
            }
          }
        }
        // Reflection beams
        for (let i = 0; i < 8; i++) {
          const angle = (Math.PI * 2 * i) / 8 + time * 0.002;
          const bx = Math.cos(angle) * 200;
          const by = Math.sin(angle) * 200;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(bx, by);
          ctx.strokeStyle = `hsl(${(i * 45 + time * 0.5) % 360}, 100%, 70%)`;
          ctx.lineWidth = 2;
          ctx.globalAlpha = 0.3;
          ctx.stroke();
        }
        break;
      }

      case "glitch": {
        const gx = Math.random() * width;
        const gy = Math.random() * height;
        const gw = 20 + Math.random() * 200;
        const gh = 2 + Math.random() * 15;
        ctx.fillStyle = `hsla(${Math.random() * 360}, 100%, 60%, ${entity.life * 0.4})`;
        ctx.fillRect(gx, gy, gw, gh);
        break;
      }
    }
    ctx.restore();
  }

  // ── Render particles ──────────────────────────────────────
  for (const p of state.particles) {
    ctx.save();
    ctx.globalAlpha = p.life;
    switch (p.type) {
      case "spark": {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        break;
      }
      case "star": {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        break;
      }
      case "confetti": {
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation || 0);
        ctx.fillStyle = p.color;
        ctx.fillRect(
          -(p.width || 6) / 2,
          -(p.height || 4) / 2,
          p.width || 6,
          p.height || 4,
        );
        break;
      }
      case "cat":
      case "emoji": {
        ctx.font = `${p.size}px serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(p.emoji || "🐱", p.x, p.y);
        break;
      }
    }
    ctx.restore();
  }

  // ── Render floating texts ─────────────────────────────────
  if (state.floatingTexts.length > 0) {
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (const ft of state.floatingTexts) {
      ctx.save();
      ctx.globalAlpha = ft.life;
      ctx.font = `bold ${ft.size}px "Bricolage Grotesque", sans-serif`;
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }
  }

  ctx.restore(); // end screen shake
}

export function updateParticles(
  particles: Particle[],
  dt: number,
  height: number,
): void {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx * dt * 60;
    p.y += p.vy * dt * 60;
    if (p.type !== "confetti") {
      p.vy += 0.05 * dt * 60; // gravity for sparks
    } else {
      p.rotation = (p.rotation || 0) + (p.rotSpeed || 0) * dt * 60;
    }
    p.life -= 0.015 * dt * 60;
    if (p.type === "emoji" || p.type === "cat") {
      p.life -= 0.008 * dt * 60;
    }
    if (p.life <= 0 || p.y > height + 50) {
      particles.splice(i, 1);
    }
  }
}

export function updateFloatingTexts(
  floatingTexts: FloatingText[],
  dt: number,
): void {
  for (let i = floatingTexts.length - 1; i >= 0; i--) {
    const ft = floatingTexts[i];
    ft.y += ft.vy * dt * 60;
    ft.life -= 0.02 * dt * 60;
    if (ft.life <= 0) {
      floatingTexts.splice(i, 1);
    }
  }
}

export function updateChaosEntities(
  entities: ChaosEntity[],
  dt: number,
  width: number,
  height: number,
): void {
  for (let i = entities.length - 1; i >= 0; i--) {
    const e = entities[i];
    switch (e.type) {
      case "firework":
        e.progress += dt * 1.2;
        e.life = 1 - e.progress / 1.5;
        break;
      case "meteor":
        e.x += (e.vx || 0) * dt * 60;
        e.y += (e.vy || 0) * dt * 60;
        e.progress += dt;
        e.life = 1 - Math.max(0, e.y / (height + 50));
        break;
      case "ufo":
        e.x += (e.vx || 0) * dt * 60;
        e.progress = e.x / (width + 300);
        e.life = 1 - Math.max(0, e.progress - 0.8) * 5;
        break;
      case "disco":
        e.x += (e.vx || 0) * dt * 60;
        e.y += (e.vy || 0) * dt * 60;
        if (e.x < 60 || e.x > width - 60) e.vx = -(e.vx || 0);
        if (e.y < 60 || e.y > height - 60) e.vy = -(e.vy || 0);
        break;
    }
    if (
      e.life <= 0 ||
      e.x > width + 300 ||
      e.y > height + 100 ||
      e.progress > 1.5
    ) {
      entities.splice(i, 1);
    }
  }
}
