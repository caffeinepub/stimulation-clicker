export interface UpgradeDef {
  id: string;
  name: string;
  description: string;
  category: "clicking" | "auto" | "chaos" | "absurd" | "multiplier";
  cost: number;
  maxCount: number;
  // Effect: what it does per level
  clickBonus?: number; // flat add per click
  clickMult?: number; // multiplier per click (stacks multiplicatively)
  ppsBonus?: number; // points per second add
  ppsMult?: number; // multiplier on all pps
  allMult?: number; // multiplier on everything
  stimulationAdd?: number; // adds to stimulation level (0-100)
  emoji?: string;
}

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  checkFn: (state: AchievementCheckState) => boolean;
}

export interface AchievementCheckState {
  totalClicks: number;
  totalPointsEarned: number;
  pointsPerSecond: number;
  prestigeCount: number;
  comboCount: number;
  stimulationLevel: number;
  upgrades: Record<string, number>;
  achievements: Set<string>;
}

export const UPGRADES: UpgradeDef[] = [
  // ── Basic Clicking ─────────────────────────────
  {
    id: "quick_fingers",
    name: "Quick Fingers",
    description: "+1 per click",
    category: "clicking",
    cost: 10,
    maxCount: 50,
    clickBonus: 1,
    stimulationAdd: 0,
  },
  {
    id: "click_frenzy",
    name: "Click Frenzy",
    description: "+10 per click",
    category: "clicking",
    cost: 50,
    maxCount: 20,
    clickBonus: 10,
    stimulationAdd: 0.1,
  },
  {
    id: "double_tap",
    name: "Double Tap",
    description: "×2 click value",
    category: "clicking",
    cost: 100,
    maxCount: 10,
    clickMult: 2,
    stimulationAdd: 0.2,
  },
  {
    id: "triple_tap",
    name: "Triple Tap",
    description: "×3 click value",
    category: "clicking",
    cost: 500,
    maxCount: 5,
    clickMult: 3,
    stimulationAdd: 0.5,
  },
  {
    id: "power_click",
    name: "Power Click",
    description: "×5 click value",
    category: "clicking",
    cost: 5000,
    maxCount: 5,
    clickMult: 5,
    stimulationAdd: 1,
  },
  // ── Auto-Clickers ─────────────────────────────
  {
    id: "robot_hand",
    name: "Robot Hand",
    description: "+0.5/s",
    category: "auto",
    cost: 50,
    maxCount: 100,
    ppsBonus: 0.5,
    stimulationAdd: 0.1,
    emoji: "🤖",
  },
  {
    id: "click_bot",
    name: "Click Bot",
    description: "+2/s",
    category: "auto",
    cost: 500,
    maxCount: 50,
    ppsBonus: 2,
    stimulationAdd: 0.2,
    emoji: "⚙️",
  },
  {
    id: "auto_turret",
    name: "Auto-Turret",
    description: "+10/s",
    category: "auto",
    cost: 5000,
    maxCount: 20,
    ppsBonus: 10,
    stimulationAdd: 0.5,
    emoji: "🔫",
  },
  {
    id: "click_factory",
    name: "Click Factory",
    description: "+50/s",
    category: "auto",
    cost: 50000,
    maxCount: 10,
    ppsBonus: 50,
    stimulationAdd: 1,
    emoji: "🏭",
  },
  {
    id: "click_dimension",
    name: "Click Dimension",
    description: "+200/s",
    category: "auto",
    cost: 500000,
    maxCount: 5,
    ppsBonus: 200,
    stimulationAdd: 3,
    emoji: "🌀",
  },
  // ── Visual Chaos ─────────────────────────────
  {
    id: "confetti_cannon",
    name: "Confetti Cannon",
    description: "Spawns confetti particles",
    category: "chaos",
    cost: 200,
    maxCount: 20,
    stimulationAdd: 1,
    emoji: "🎊",
  },
  {
    id: "fireworks",
    name: "Fireworks",
    description: "Random firework explosions",
    category: "chaos",
    cost: 1000,
    maxCount: 10,
    stimulationAdd: 2,
    emoji: "🎆",
  },
  {
    id: "explosion_mode",
    name: "Explosion Mode",
    description: "Screen flash on click",
    category: "chaos",
    cost: 3000,
    maxCount: 5,
    stimulationAdd: 3,
    emoji: "💥",
  },
  {
    id: "neon_pulse",
    name: "Neon Pulse",
    description: "Neon glow pulses in/out",
    category: "chaos",
    cost: 8000,
    maxCount: 10,
    stimulationAdd: 2,
    emoji: "💡",
  },
  {
    id: "rainbow_mode",
    name: "Rainbow Mode",
    description: "Cycling hue shift on background",
    category: "chaos",
    cost: 2000,
    maxCount: 1,
    stimulationAdd: 5,
    emoji: "🌈",
  },
  {
    id: "particle_storm",
    name: "Particle Storm",
    description: "Constant particle rain",
    category: "chaos",
    cost: 5000,
    maxCount: 10,
    stimulationAdd: 3,
    emoji: "✨",
  },
  {
    id: "laser_grid",
    name: "Laser Grid",
    description: "Laser beams sweep the screen",
    category: "chaos",
    cost: 15000,
    maxCount: 5,
    stimulationAdd: 5,
    emoji: "🔦",
  },
  {
    id: "disco_ball",
    name: "Disco Ball",
    description: "Spinning disco ball entity on screen",
    category: "chaos",
    cost: 10000,
    maxCount: 3,
    stimulationAdd: 5,
    emoji: "🪩",
  },
  {
    id: "screen_shake",
    name: "Screen Shake",
    description: "Screen shakes constantly",
    category: "chaos",
    cost: 20000,
    maxCount: 5,
    stimulationAdd: 4,
    emoji: "📳",
  },
  {
    id: "strobe_flash",
    name: "Strobe Flash",
    description: "White flash strobes constantly",
    category: "chaos",
    cost: 25000,
    maxCount: 3,
    stimulationAdd: 6,
    emoji: "⚡",
  },
  // ── Absurd ─────────────────────────────
  {
    id: "falling_cats",
    name: "Falling Cats",
    description: "Cats emoji rain from top",
    category: "absurd",
    cost: 50000,
    maxCount: 10,
    stimulationAdd: 5,
    emoji: "🐱",
  },
  {
    id: "ufo_abduction",
    name: "UFO Abduction",
    description: "UFO beam flies across screen",
    category: "absurd",
    cost: 100000,
    maxCount: 3,
    stimulationAdd: 8,
    emoji: "🛸",
  },
  {
    id: "meteor_shower",
    name: "Meteor Shower",
    description: "Meteors streak across screen",
    category: "absurd",
    cost: 75000,
    maxCount: 5,
    stimulationAdd: 6,
    emoji: "☄️",
  },
  {
    id: "time_warp",
    name: "Time Warp",
    description: "Everything slows/speeds up briefly",
    category: "absurd",
    cost: 150000,
    maxCount: 3,
    stimulationAdd: 8,
    emoji: "⏰",
  },
  {
    id: "brain_overload",
    name: "Brain Overload",
    description: "Random screen color flashes",
    category: "absurd",
    cost: 200000,
    maxCount: 5,
    stimulationAdd: 10,
    emoji: "🧠",
  },
  {
    id: "emoji_tsunami",
    name: "Emoji Tsunami",
    description: "Wave of random emojis",
    category: "absurd",
    cost: 300000,
    maxCount: 5,
    stimulationAdd: 10,
    emoji: "🌊",
  },
  {
    id: "hypno_spiral",
    name: "Hypno Spiral",
    description: "Spinning spiral in background",
    category: "absurd",
    cost: 500000,
    maxCount: 2,
    stimulationAdd: 12,
    emoji: "🌀",
  },
  {
    id: "void_rift",
    name: "Void Rift",
    description: "Black hole effect on screen",
    category: "absurd",
    cost: 750000,
    maxCount: 2,
    stimulationAdd: 15,
    emoji: "🕳️",
  },
  {
    id: "reality_glitch",
    name: "Reality Glitch",
    description: "Pixel glitch effect on screen",
    category: "absurd",
    cost: 1000000,
    maxCount: 2,
    stimulationAdd: 15,
    emoji: "👾",
  },
  {
    id: "maximum_overdrive",
    name: "MAXIMUM OVERDRIVE",
    description: "ALL effects simultaneously — the end of sanity",
    category: "absurd",
    cost: 5000000,
    maxCount: 1,
    stimulationAdd: 30,
    allMult: 3,
    emoji: "☢️",
  },
  // ── Multipliers ─────────────────────────────
  {
    id: "lucky_click",
    name: "Lucky Click",
    description: "+25% click value",
    category: "multiplier",
    cost: 2500,
    maxCount: 20,
    clickMult: 1.25,
    stimulationAdd: 0.5,
    emoji: "🍀",
  },
  {
    id: "combo_master",
    name: "Combo Master",
    description: "Extends combo window to 1s",
    category: "multiplier",
    cost: 10000,
    maxCount: 5,
    stimulationAdd: 1,
    emoji: "🥊",
  },
  {
    id: "stimulation_surge",
    name: "Stimulation Surge",
    description: "+10% all points",
    category: "multiplier",
    cost: 25000,
    maxCount: 10,
    allMult: 1.1,
    stimulationAdd: 2,
    emoji: "⚡",
  },
  {
    id: "manic_mode",
    name: "Manic Mode",
    description: "Double points for 30s (triggered)",
    category: "multiplier",
    cost: 100000,
    maxCount: 5,
    stimulationAdd: 5,
    emoji: "😈",
  },
  {
    id: "overdrive",
    name: "Overdrive",
    description: "×3 all output",
    category: "multiplier",
    cost: 1000000,
    maxCount: 3,
    allMult: 3,
    stimulationAdd: 10,
    emoji: "🔥",
  },
];

export const UPGRADE_MAP: Record<string, UpgradeDef> = Object.fromEntries(
  UPGRADES.map((u) => [u.id, u]),
);

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: "first_click",
    name: "First Click",
    description: "Click once",
    icon: "👆",
    checkFn: (s) => s.totalClicks >= 1,
  },
  {
    id: "clicks_100",
    name: "Century",
    description: "100 total clicks",
    icon: "💯",
    checkFn: (s) => s.totalClicks >= 100,
  },
  {
    id: "clicks_1000",
    name: "Thousand",
    description: "1,000 total clicks",
    icon: "🔢",
    checkFn: (s) => s.totalClicks >= 1000,
  },
  {
    id: "clicks_10000",
    name: "Ten Thousand",
    description: "10,000 total clicks",
    icon: "🔥",
    checkFn: (s) => s.totalClicks >= 10000,
  },
  {
    id: "first_upgrade",
    name: "Shopaholic",
    description: "Buy your first upgrade",
    icon: "🛒",
    checkFn: (s) => Object.values(s.upgrades).reduce((a, b) => a + b, 0) >= 1,
  },
  {
    id: "upgrades_10",
    name: "Upgrade Addict",
    description: "Own 10 upgrades total",
    icon: "📦",
    checkFn: (s) => Object.values(s.upgrades).reduce((a, b) => a + b, 0) >= 10,
  },
  {
    id: "upgrades_50",
    name: "Upgrade Maniac",
    description: "Own 50 upgrades total",
    icon: "🤯",
    checkFn: (s) => Object.values(s.upgrades).reduce((a, b) => a + b, 0) >= 50,
  },
  {
    id: "points_1000",
    name: "Four Digits",
    description: "Earn 1,000 points",
    icon: "💰",
    checkFn: (s) => s.totalPointsEarned >= 1000,
  },
  {
    id: "points_million",
    name: "Millionaire",
    description: "Earn 1,000,000 points",
    icon: "💎",
    checkFn: (s) => s.totalPointsEarned >= 1_000_000,
  },
  {
    id: "points_billion",
    name: "Billionaire",
    description: "Earn 1,000,000,000 points",
    icon: "👑",
    checkFn: (s) => s.totalPointsEarned >= 1_000_000_000,
  },
  {
    id: "first_auto",
    name: "Lazy Clicker",
    description: "Own first auto-clicker",
    icon: "🦾",
    checkFn: (s) =>
      (s.upgrades.robot_hand || 0) +
        (s.upgrades.click_bot || 0) +
        (s.upgrades.auto_turret || 0) +
        (s.upgrades.click_factory || 0) +
        (s.upgrades.click_dimension || 0) >=
      1,
  },
  {
    id: "pps_100",
    name: "Passive Income",
    description: "100 points per second",
    icon: "📈",
    checkFn: (s) => s.pointsPerSecond >= 100,
  },
  {
    id: "pps_1000",
    name: "Money Machine",
    description: "1,000 points per second",
    icon: "🏦",
    checkFn: (s) => s.pointsPerSecond >= 1000,
  },
  {
    id: "first_prestige",
    name: "Reborn",
    description: "Perform your first prestige",
    icon: "🌟",
    checkFn: (s) => s.prestigeCount >= 1,
  },
  {
    id: "prestige_5",
    name: "Veteran",
    description: "Prestige 5 times",
    icon: "⭐",
    checkFn: (s) => s.prestigeCount >= 5,
  },
  {
    id: "combo_10",
    name: "Combo King",
    description: "Reach 10x combo",
    icon: "🥇",
    checkFn: (s) => s.comboCount >= 10,
  },
  {
    id: "stimulation_50",
    name: "Halfway Stimulated",
    description: "Stimulation level 50",
    icon: "🌡️",
    checkFn: (s) => s.stimulationLevel >= 50,
  },
  {
    id: "stimulation_100",
    name: "Maximum Stimulation",
    description: "Stimulation level 100",
    icon: "🔮",
    checkFn: (s) => s.stimulationLevel >= 100,
  },
  {
    id: "chaos_starter",
    name: "Chaos Starter",
    description: "Buy your first chaos upgrade",
    icon: "🌪️",
    checkFn: (s) =>
      UPGRADES.filter((u) => u.category === "chaos").some(
        (u) => (s.upgrades[u.id] || 0) >= 1,
      ),
  },
  {
    id: "all_absurd",
    name: "Reality Broken",
    description: "Own all absurd upgrades",
    icon: "💀",
    checkFn: (s) =>
      UPGRADES.filter((u) => u.category === "absurd").every(
        (u) => (s.upgrades[u.id] || 0) >= 1,
      ),
  },
];

export const ACHIEVEMENT_MAP: Record<string, AchievementDef> =
  Object.fromEntries(ACHIEVEMENTS.map((a) => [a.id, a]));

export const CATEGORY_LABELS: Record<string, string> = {
  clicking: "Basic Clicking",
  auto: "Auto-Clickers",
  chaos: "Visual Chaos",
  absurd: "Absurd",
  multiplier: "Multipliers",
};

export const CATEGORY_COLORS: Record<string, string> = {
  clicking: "#f0abfc",
  auto: "#67e8f9",
  chaos: "#4ade80",
  absurd: "#fb923c",
  multiplier: "#facc15",
};

export function formatNumber(n: number): string {
  if (n < 1000) return Math.floor(n).toString();
  if (n < 1_000_000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  if (n < 1_000_000_000)
    return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n < 1_000_000_000_000)
    return `${(n / 1_000_000_000).toFixed(1).replace(/\.0$/, "")}B`;
  if (n < 1_000_000_000_000_000)
    return `${(n / 1_000_000_000_000).toFixed(1).replace(/\.0$/, "")}T`;
  return `${(n / 1_000_000_000_000_000).toFixed(1).replace(/\.0$/, "")}Qa`;
}

export function calcUpgradeCost(def: UpgradeDef, owned: number): number {
  return Math.floor(def.cost * 1.15 ** owned);
}
