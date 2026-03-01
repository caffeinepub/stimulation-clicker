import { AchievementToastManager } from "@/components/AchievementToast";
import { AchievementsPanel } from "@/components/AchievementsPanel";
import { ClickButton } from "@/components/ClickButton";
import { DetailedStats } from "@/components/DetailedStats";
import { LeaderboardPanel } from "@/components/LeaderboardPanel";
import { StatsPanel } from "@/components/StatsPanel";
import { UpgradeShop } from "@/components/UpgradeShop";
import { Toaster } from "@/components/ui/sonner";
import { useGameEngine } from "@/game/useGameEngine";
import { useRef, useState } from "react";

type Panel = "shop" | "achievements" | "leaderboard" | "stats";

const NAV_ITEMS: { id: Panel; label: string; icon: string }[] = [
  { id: "shop", label: "Shop", icon: "🛒" },
  { id: "achievements", label: "Achiev.", icon: "🏆" },
  { id: "leaderboard", label: "Leaders", icon: "👑" },
  { id: "stats", label: "Stats", icon: "📊" },
];

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { uiState, handleClick, buyUpgrade, doPrestige } =
    useGameEngine(canvasRef);
  const [activePanel, setActivePanel] = useState<Panel>("shop");

  // Prestige confirm state
  const [showPrestigeConfirm, setShowPrestigeConfirm] = useState(false);

  function handlePrestigeClick() {
    setShowPrestigeConfirm(true);
  }

  function confirmPrestige() {
    doPrestige();
    setShowPrestigeConfirm(false);
  }

  return (
    <div
      className="relative w-full h-full overflow-hidden"
      style={{ background: "#050510" }}
    >
      {/* ── Canvas layer ─────────────────────────────────── */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ zIndex: 0 }}
      />

      {/* Scanline overlay */}
      <div
        className="absolute inset-0 scanlines pointer-events-none"
        style={{ zIndex: 1 }}
      />

      {/* ── UI Layer ─────────────────────────────────────── */}
      <div className="absolute inset-0 flex" style={{ zIndex: 10 }}>
        {/* ── Left: Stats + Click Button ─────────────────── */}
        <div
          className="flex flex-col items-center justify-between py-4 px-3 shrink-0"
          style={{
            width: "clamp(180px, 22vw, 260px)",
            background: "rgba(5,5,16,0.75)",
            borderRight: "1px solid rgba(255,45,120,0.15)",
            backdropFilter: "blur(4px)",
          }}
        >
          {/* Title */}
          <div className="text-center w-full">
            <div
              className="font-display font-black leading-none neon-flicker"
              style={{
                fontSize: "clamp(16px, 2.5vw, 22px)",
                color: "#ff2d78",
                textShadow: "0 0 12px #ff2d78, 0 0 30px #ff2d7840",
                letterSpacing: "0.08em",
              }}
            >
              STIMULATION
            </div>
            <div
              className="font-display font-black leading-none"
              style={{
                fontSize: "clamp(12px, 1.8vw, 16px)",
                color: "#00f5ff",
                textShadow: "0 0 10px #00f5ff",
                letterSpacing: "0.2em",
              }}
            >
              CLICKER
            </div>
          </div>

          {/* Stats */}
          <div className="w-full">
            <StatsPanel uiState={uiState} onPrestige={handlePrestigeClick} />
          </div>
        </div>

        {/* ── Center: Click Button ─────────────────────────── */}
        <div className="flex-1 flex items-center justify-center relative">
          <ClickButton
            onClickAt={handleClick}
            pointsPerClick={uiState.pointsPerClick}
            comboCount={uiState.comboCount}
            stimulationLevel={uiState.stimulationLevel}
          />

          {/* Time warp indicator */}
          {uiState.stimulationLevel > 0 && (
            <div
              className="absolute bottom-4 left-1/2 -translate-x-1/2 font-mono text-center pointer-events-none"
              style={{ fontSize: "9px", color: "rgba(255,255,255,0.2)" }}
            >
              STIM: {Math.round(uiState.stimulationLevel)}% •{" "}
              {uiState.totalClicks.toLocaleString()} CLICKS
            </div>
          )}
        </div>

        {/* ── Right: Panel ────────────────────────────────── */}
        <div
          className="flex flex-col shrink-0"
          style={{
            width: "clamp(200px, 26vw, 320px)",
            background: "rgba(5,5,16,0.85)",
            borderLeft: "1px solid rgba(0,245,255,0.12)",
            backdropFilter: "blur(4px)",
          }}
        >
          {/* Nav tabs */}
          <div
            className="flex"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActivePanel(item.id)}
                className="flex-1 flex flex-col items-center justify-center py-2 transition-all"
                style={{
                  background:
                    activePanel === item.id
                      ? "rgba(255,45,120,0.12)"
                      : "transparent",
                  borderBottom:
                    activePanel === item.id
                      ? "2px solid #ff2d78"
                      : "2px solid transparent",
                  color:
                    activePanel === item.id
                      ? "#ff2d78"
                      : "rgba(255,255,255,0.35)",
                  cursor: "pointer",
                  fontSize: "16px",
                  lineHeight: 1,
                }}
              >
                <span>{item.icon}</span>
                <span
                  className="font-mono"
                  style={{ fontSize: "7px", marginTop: "2px" }}
                >
                  {item.label}
                </span>
              </button>
            ))}
          </div>

          {/* Panel content */}
          <div className="flex-1 overflow-hidden p-3">
            {activePanel === "shop" && (
              <UpgradeShop uiState={uiState} onBuy={buyUpgrade} />
            )}
            {activePanel === "achievements" && (
              <AchievementsPanel uiState={uiState} />
            )}
            {activePanel === "leaderboard" && (
              <LeaderboardPanel uiState={uiState} />
            )}
            {activePanel === "stats" && <DetailedStats uiState={uiState} />}
          </div>
        </div>
      </div>

      {/* ── Achievement toast ─────────────────────────────── */}
      <AchievementToastManager newAchievementId={uiState.newAchievement} />

      {/* ── Prestige confirm dialog ──────────────────────── */}
      {showPrestigeConfirm && (
        <div
          className="fixed inset-0 flex items-center justify-center"
          style={{
            zIndex: 50,
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(4px)",
          }}
        >
          <div
            className="rounded-xl p-6 flex flex-col gap-4 max-w-sm w-full mx-4"
            style={{
              background: "rgba(5,5,20,0.98)",
              border: "1px solid rgba(255,204,0,0.5)",
              boxShadow: "0 0 40px rgba(255,204,0,0.2)",
            }}
          >
            <div className="text-center">
              <div style={{ fontSize: "40px" }}>⭐</div>
              <div
                className="font-display font-black mt-2"
                style={{
                  fontSize: "20px",
                  color: "#ffcc00",
                  textShadow: "0 0 12px #ffcc00",
                }}
              >
                PRESTIGE?
              </div>
              <div
                className="font-mono mt-2"
                style={{ fontSize: "12px", color: "#ffffff80" }}
              >
                Reset everything for a permanent{" "}
                <span style={{ color: "#ffcc00" }}>+50%</span> multiplier.
                <br />
                Keep achievements. Lose upgrades.
              </div>
              <div
                className="font-mono mt-1"
                style={{ fontSize: "11px", color: "#bf00ff" }}
              >
                New multiplier: ×
                {(1 + (uiState.prestigeCount + 1) * 0.5).toFixed(1)}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowPrestigeConfirm(false)}
                className="flex-1 rounded py-2 font-display font-bold transition-all hover:scale-105"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "#ffffff80",
                  cursor: "pointer",
                  fontSize: "12px",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmPrestige}
                className="flex-1 rounded py-2 font-display font-black transition-all hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, #6b4400, #ffcc00)",
                  color: "#000",
                  cursor: "pointer",
                  fontSize: "12px",
                  border: "none",
                }}
              >
                ⭐ PRESTIGE!
              </button>
            </div>
          </div>
        </div>
      )}

      <Toaster position="bottom-center" />
    </div>
  );
}
