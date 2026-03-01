import { useCallback, useEffect, useRef, useState } from "react";
import { audio } from "./audioEngine";
import {
  type ChaosEntity,
  type FloatingText,
  type Particle,
  type RendererState,
  renderFrame,
  spawnClickParticles,
  spawnConfetti,
  spawnEmojiTsunami,
  spawnFallingCat,
  spawnFirework,
  spawnFloatingText,
  spawnMeteor,
  spawnUFO,
  updateChaosEntities,
  updateFloatingTexts,
  updateParticles,
} from "./canvasRenderer";
import {
  ACHIEVEMENTS,
  type AchievementCheckState,
  UPGRADES,
  UPGRADE_MAP,
  calcUpgradeCost,
  formatNumber,
} from "./gameData";

export interface GameUIState {
  points: number;
  pointsPerClick: number;
  pointsPerSecond: number;
  totalClicks: number;
  totalPointsEarned: number;
  prestigeCount: number;
  stimulationLevel: number;
  comboCount: number;
  comboMultiplier: number;
  upgrades: Record<string, number>;
  achievements: Set<string>;
  manicModeActive: boolean;
  manicModeTimeLeft: number;
  canPrestige: boolean;
  newAchievement: string | null;
}

interface GameStateRef {
  points: number;
  totalPointsEarned: number;
  totalClicks: number;
  pointsPerClick: number;
  pointsPerSecond: number;
  prestigeCount: number;
  prestigeMultiplier: number;
  comboCount: number;
  comboMultiplier: number;
  lastClickTime: number;
  stimulationLevel: number;
  upgrades: Record<string, number>;
  achievements: Set<string>;
  particles: Particle[];
  floatingTexts: FloatingText[];
  chaosEntities: ChaosEntity[];
  rainbowHue: number;
  screenShakeX: number;
  screenShakeY: number;
  screenShakeDecay: number;
  manicModeActive: boolean;
  manicModeTimeLeft: number;
  timeWarpActive: boolean;
  timeWarpFactor: number;
  newAchievementId: string | null;
  lastFirework: number;
  lastMeteor: number;
  lastUFO: number;
  lastCat: number;
  lastEmojiTsunami: number;
  lastParticleStorm: number;
  confettiTimer: number;
}

// Pure helper functions (not hooks, no closures over component state)
function computeStats(
  upgrades: Record<string, number>,
  prestigeMultiplier: number,
) {
  let clickBonus = 0;
  let clickMultiplier = 1;
  let ppsBonus = 0;
  let allMult = 1;

  for (const [id, count] of Object.entries(upgrades)) {
    if (!count) continue;
    const def = UPGRADE_MAP[id];
    if (!def) continue;
    if (def.clickBonus) clickBonus += def.clickBonus * count;
    if (def.clickMult) {
      for (let i = 0; i < count; i++) clickMultiplier *= def.clickMult;
    }
    if (def.ppsBonus) ppsBonus += def.ppsBonus * count;
    if (def.allMult) {
      for (let i = 0; i < count; i++) allMult *= def.allMult;
    }
  }

  const ppc = Math.max(
    1,
    (1 + clickBonus) * clickMultiplier * allMult * prestigeMultiplier,
  );
  const pps = ppsBonus * allMult * prestigeMultiplier;
  return { ppc, pps };
}

function computeStimulation(upgrades: Record<string, number>): number {
  let total = 0;
  for (const [id, count] of Object.entries(upgrades)) {
    const def = UPGRADE_MAP[id];
    if (def?.stimulationAdd) total += def.stimulationAdd * count;
  }
  return Math.min(100, total);
}

function checkAchievements(g: GameStateRef): string | null {
  const checkState: AchievementCheckState = {
    totalClicks: g.totalClicks,
    totalPointsEarned: g.totalPointsEarned,
    pointsPerSecond: g.pointsPerSecond,
    prestigeCount: g.prestigeCount,
    comboCount: g.comboCount,
    stimulationLevel: g.stimulationLevel,
    upgrades: g.upgrades,
    achievements: g.achievements,
  };
  for (const ach of ACHIEVEMENTS) {
    if (!g.achievements.has(ach.id) && ach.checkFn(checkState)) {
      g.achievements.add(ach.id);
      return ach.id;
    }
  }
  return null;
}

export function useGameEngine(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
) {
  const gameRef = useRef<GameStateRef>({
    points: 0,
    totalPointsEarned: 0,
    totalClicks: 0,
    pointsPerClick: 1,
    pointsPerSecond: 0,
    prestigeCount: 0,
    prestigeMultiplier: 1,
    comboCount: 0,
    comboMultiplier: 1,
    lastClickTime: 0,
    stimulationLevel: 0,
    upgrades: {},
    achievements: new Set(),
    particles: [],
    floatingTexts: [],
    chaosEntities: [],
    rainbowHue: 0,
    screenShakeX: 0,
    screenShakeY: 0,
    screenShakeDecay: 0,
    manicModeActive: false,
    manicModeTimeLeft: 0,
    timeWarpActive: false,
    timeWarpFactor: 1,
    newAchievementId: null,
    lastFirework: 0,
    lastMeteor: 0,
    lastUFO: 0,
    lastCat: 0,
    lastEmojiTsunami: 0,
    lastParticleStorm: 0,
    confettiTimer: 0,
  });

  const animFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const lastUIUpdateRef = useRef<number>(0);

  const [uiState, setUIState] = useState<GameUIState>({
    points: 0,
    pointsPerClick: 1,
    pointsPerSecond: 0,
    totalClicks: 0,
    totalPointsEarned: 0,
    prestigeCount: 0,
    stimulationLevel: 0,
    comboCount: 0,
    comboMultiplier: 1,
    upgrades: {},
    achievements: new Set(),
    manicModeActive: false,
    manicModeTimeLeft: 0,
    canPrestige: false,
    newAchievement: null,
  });

  // ── Main click handler ────────────────────────────────────
  const handleClick = useCallback(
    (clientX: number, clientY: number) => {
      const g = gameRef.current;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const now = performance.now();
      const timeSinceLast = now - g.lastClickTime;
      const comboWindow = g.upgrades.combo_master
        ? 500 + g.upgrades.combo_master * 100
        : 500;

      if (timeSinceLast < comboWindow) {
        g.comboCount = Math.min(g.comboCount + 1, 50);
      } else {
        g.comboCount = 0;
      }
      g.comboMultiplier = 1 + g.comboCount * 0.15;
      g.lastClickTime = now;

      if (g.comboCount > 0) audio.combo(g.comboCount);
      else audio.click(1);

      const earned =
        g.pointsPerClick * g.comboMultiplier * (g.manicModeActive ? 2 : 1);

      g.points += earned;
      g.totalPointsEarned += earned;
      g.totalClicks++;

      // Spawn particles
      const rect = canvas.getBoundingClientRect();
      const cx = clientX - rect.left;
      const cy = clientY - rect.top;

      spawnClickParticles(
        g.particles,
        cx,
        cy,
        8 + Math.floor(g.stimulationLevel / 10),
        g.stimulationLevel,
      );
      spawnFloatingText(
        g.floatingTexts,
        cx,
        cy,
        `+${formatNumber(earned)}`,
        g.comboCount > 5 ? "#ffff00" : "#ff2d78",
        18 + Math.min(g.comboCount * 2, 20),
      );

      if (g.comboCount > 2) {
        spawnFloatingText(
          g.floatingTexts,
          cx,
          cy - 40,
          `×${g.comboMultiplier.toFixed(1)} COMBO!`,
          "#00f5ff",
          14,
        );
      }

      // Explosion effect
      if (g.upgrades.explosion_mode > 0) {
        audio.explosion();
        g.chaosEntities.push({
          type: "firework",
          x: cx,
          y: cy,
          progress: 0,
          life: 1,
          params: { color: "#ff2d78", size: g.upgrades.explosion_mode * 2 },
        });
        const shakeIntensity = g.upgrades.explosion_mode * 4;
        g.screenShakeX = (Math.random() - 0.5) * shakeIntensity;
        g.screenShakeY = (Math.random() - 0.5) * shakeIntensity;
        g.screenShakeDecay = 0.8;
      }

      if (g.upgrades.screen_shake > 0) {
        const shakeIntensity = g.upgrades.screen_shake * 2;
        g.screenShakeX = (Math.random() - 0.5) * shakeIntensity;
        g.screenShakeY = (Math.random() - 0.5) * shakeIntensity;
        g.screenShakeDecay = 0.7;
      }

      const newAch = checkAchievements(g);
      if (newAch) {
        g.newAchievementId = newAch;
        audio.achievement();
      }
    },
    [canvasRef],
  );

  // ── Buy upgrade ───────────────────────────────────────────
  const buyUpgrade = useCallback(
    (upgradeId: string) => {
      const g = gameRef.current;
      const def = UPGRADE_MAP[upgradeId];
      if (!def) return false;

      const owned = g.upgrades[upgradeId] || 0;
      if (owned >= def.maxCount) return false;

      const cost = calcUpgradeCost(def, owned);
      if (g.points < cost) return false;

      g.points -= cost;
      g.upgrades[upgradeId] = owned + 1;

      const { ppc, pps } = computeStats(g.upgrades, g.prestigeMultiplier);
      g.pointsPerClick = ppc;
      g.pointsPerSecond = pps;
      g.stimulationLevel = computeStimulation(g.upgrades);

      audio.upgrade();

      if (upgradeId === "manic_mode") {
        g.manicModeActive = true;
        g.manicModeTimeLeft = 30;
        audio.manicMode();
      }

      if (upgradeId === "disco_ball") {
        const canvas = canvasRef.current;
        const w = canvas?.width || 1200;
        const h = canvas?.height || 800;
        g.chaosEntities.push({
          type: "disco",
          x: 100 + Math.random() * (w - 200),
          y: 100 + Math.random() * (h - 200),
          vx: (Math.random() > 0.5 ? 1 : -1) * (1.5 + Math.random() * 1.5),
          vy: (Math.random() > 0.5 ? 1 : -1) * (1.5 + Math.random() * 1.5),
          progress: 0,
          life: 1,
        });
      }

      if (upgradeId === "emoji_tsunami") {
        const canvas = canvasRef.current;
        const w = canvas?.width || 1200;
        const h = canvas?.height || 800;
        spawnEmojiTsunami(g.particles, w, h, 20);
      }

      const newAch = checkAchievements(g);
      if (newAch) {
        g.newAchievementId = newAch;
        audio.achievement();
      }

      return true;
    },
    [canvasRef],
  );

  // ── Prestige ──────────────────────────────────────────────
  const doPrestige = useCallback(() => {
    const g = gameRef.current;
    if (g.totalPointsEarned < 1_000_000) return;

    g.prestigeCount++;
    g.prestigeMultiplier = 1 + g.prestigeCount * 0.5;
    g.points = 0;
    g.totalPointsEarned = 0;
    g.upgrades = {};
    g.comboCount = 0;
    g.comboMultiplier = 1;
    g.stimulationLevel = 0;
    g.manicModeActive = false;
    g.manicModeTimeLeft = 0;
    g.particles = [];
    g.floatingTexts = [];
    g.chaosEntities = [];

    const { ppc, pps } = computeStats({}, g.prestigeMultiplier);
    g.pointsPerClick = ppc;
    g.pointsPerSecond = pps;

    audio.prestige();

    const newAch = checkAchievements(g);
    if (newAch) {
      g.newAchievementId = newAch;
      audio.achievement();
    }
  }, []);

  // ── Main game loop ────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function resize() {
      if (!canvas) return;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    function loop(timestamp: number) {
      const dt = Math.min(
        (timestamp - (lastTimeRef.current || timestamp)) / 1000,
        0.05,
      );
      lastTimeRef.current = timestamp;
      const g = gameRef.current;

      const actualDt = dt * g.timeWarpFactor;

      // PPS income
      if (g.pointsPerSecond > 0) {
        const gained = g.pointsPerSecond * actualDt;
        g.points += gained;
        g.totalPointsEarned += gained;
      }

      // Manic mode countdown
      if (g.manicModeActive) {
        g.manicModeTimeLeft -= actualDt;
        if (g.manicModeTimeLeft <= 0) {
          g.manicModeActive = false;
          g.manicModeTimeLeft = 0;
        }
      }

      // Rainbow hue
      if (g.upgrades.rainbow_mode > 0) {
        g.rainbowHue = (g.rainbowHue + 60 * actualDt) % 360;
      }

      // Screen shake decay
      if (g.screenShakeDecay > 0) {
        g.screenShakeX *= g.screenShakeDecay;
        g.screenShakeY *= g.screenShakeDecay;
        if (Math.abs(g.screenShakeX) < 0.1) {
          g.screenShakeX = 0;
          g.screenShakeY = 0;
          g.screenShakeDecay = 0;
        }
      }
      if (g.upgrades.screen_shake > 0 && g.screenShakeDecay === 0) {
        const intensity = g.upgrades.screen_shake * 1.5;
        if (Math.random() < 0.05) {
          g.screenShakeX = (Math.random() - 0.5) * intensity;
          g.screenShakeY = (Math.random() - 0.5) * intensity;
          g.screenShakeDecay = 0.85;
        }
      }

      // Time warp
      if (g.upgrades.time_warp > 0 && !g.timeWarpActive) {
        if (Math.random() < 0.003 * g.upgrades.time_warp) {
          g.timeWarpActive = true;
          g.timeWarpFactor = Math.random() < 0.5 ? 0.3 : 2.5;
          setTimeout(() => {
            gameRef.current.timeWarpActive = false;
            gameRef.current.timeWarpFactor = 1;
          }, 3000);
        }
      }

      // Confetti
      if (g.upgrades.confetti_cannon > 0 && canvas) {
        g.confettiTimer -= actualDt;
        if (g.confettiTimer <= 0) {
          spawnConfetti(
            g.particles,
            g.upgrades.confetti_cannon * 3,
            canvas.width,
            canvas.height,
          );
          g.confettiTimer = 1 / g.upgrades.confetti_cannon;
        }
      }

      // Falling cats
      if (g.upgrades.falling_cats > 0 && canvas) {
        if (timestamp - g.lastCat > 1000 / g.upgrades.falling_cats) {
          spawnFallingCat(g.particles, canvas.width);
          g.lastCat = timestamp;
        }
      }

      // Particle storm
      if (g.upgrades.particle_storm > 0 && canvas) {
        if (timestamp - g.lastParticleStorm > 120) {
          // was 50ms, now 120ms
          for (let i = 0; i < g.upgrades.particle_storm; i++) {
            const px = Math.random() * canvas.width;
            g.particles.push({
              x: px,
              y: -5,
              vx: (Math.random() - 0.5) * 2,
              vy: 2 + Math.random() * 4,
              life: 1,
              size: 3 + Math.random() * 4,
              color: ["#ff2d78", "#00f5ff", "#39ff14", "#ffff00", "#bf00ff"][
                Math.floor(Math.random() * 5)
              ],
              type: "spark",
            });
          }
          g.lastParticleStorm = timestamp;
        }
      }

      // Fireworks
      if (g.upgrades.fireworks > 0 && canvas) {
        const fireworkInterval = Math.max(200, 2000 / g.upgrades.fireworks);
        if (timestamp - g.lastFirework > fireworkInterval) {
          spawnFirework(g.chaosEntities, canvas.width, canvas.height);
          audio.firework();
          g.lastFirework = timestamp;
        }
      }

      // Meteor shower
      if (g.upgrades.meteor_shower > 0 && canvas) {
        const meteorInterval = Math.max(300, 3000 / g.upgrades.meteor_shower);
        if (timestamp - g.lastMeteor > meteorInterval) {
          spawnMeteor(g.chaosEntities, canvas.width, canvas.height);
          g.lastMeteor = timestamp;
        }
      }

      // UFO
      if (g.upgrades.ufo_abduction > 0 && canvas) {
        const ufoInterval = Math.max(5000, 15000 / g.upgrades.ufo_abduction);
        if (timestamp - g.lastUFO > ufoInterval) {
          spawnUFO(g.chaosEntities, canvas.width, canvas.height);
          g.lastUFO = timestamp;
        }
      }

      // Emoji tsunami
      if (g.upgrades.emoji_tsunami > 0 && canvas) {
        const tsunamiInterval = Math.max(
          3000,
          10000 / g.upgrades.emoji_tsunami,
        );
        if (timestamp - g.lastEmojiTsunami > tsunamiInterval) {
          spawnEmojiTsunami(
            g.particles,
            canvas.width,
            canvas.height,
            g.upgrades.emoji_tsunami * 5,
          );
          g.lastEmojiTsunami = timestamp;
        }
      }

      // Cap particles
      if (g.particles.length > 400)
        g.particles.splice(0, g.particles.length - 400);
      if (g.chaosEntities.length > 30)
        g.chaosEntities.splice(0, g.chaosEntities.length - 30);

      if (canvas) updateParticles(g.particles, actualDt, canvas.height);
      updateFloatingTexts(g.floatingTexts, actualDt);
      if (canvas)
        updateChaosEntities(
          g.chaosEntities,
          actualDt,
          canvas.width,
          canvas.height,
        );

      // Render
      if (canvas && ctx) {
        const rendererState: RendererState = {
          particles: g.particles,
          floatingTexts: g.floatingTexts,
          chaosEntities: g.chaosEntities,
          upgrades: g.upgrades,
          stimulationLevel: g.stimulationLevel,
          rainbowHue: g.rainbowHue,
          screenShakeX: g.screenShakeX,
          screenShakeY: g.screenShakeY,
          manicModeActive: g.manicModeActive,
          timeWarpActive: g.timeWarpActive,
          timeWarpFactor: g.timeWarpFactor,
        };
        renderFrame(ctx, canvas, rendererState, actualDt, timestamp);
      }

      // UI throttle
      if (timestamp - lastUIUpdateRef.current > 100) {
        lastUIUpdateRef.current = timestamp;
        const g2 = gameRef.current;
        const newAch = g2.newAchievementId;
        if (newAch) g2.newAchievementId = null;

        setUIState({
          points: g2.points,
          pointsPerClick: g2.pointsPerClick,
          pointsPerSecond: g2.pointsPerSecond,
          totalClicks: g2.totalClicks,
          totalPointsEarned: g2.totalPointsEarned,
          prestigeCount: g2.prestigeCount,
          stimulationLevel: g2.stimulationLevel,
          comboCount: g2.comboCount,
          comboMultiplier: g2.comboMultiplier,
          upgrades: { ...g2.upgrades },
          achievements: new Set(g2.achievements),
          manicModeActive: g2.manicModeActive,
          manicModeTimeLeft: g2.manicModeTimeLeft,
          canPrestige: g2.totalPointsEarned >= 1_000_000,
          newAchievement: newAch,
        });
      }

      animFrameRef.current = requestAnimationFrame(loop);
    }

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [canvasRef]);

  return { uiState, handleClick, buyUpgrade, doPrestige, gameRef };
}
