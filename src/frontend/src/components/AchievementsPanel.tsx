import { ACHIEVEMENTS } from "@/game/gameData";
import type { GameUIState } from "@/game/useGameEngine";

interface AchievementsPanelProps {
  uiState: GameUIState;
}

export function AchievementsPanel({ uiState }: AchievementsPanelProps) {
  const { achievements } = uiState;
  const unlocked = achievements.size;
  const total = ACHIEVEMENTS.length;

  return (
    <div className="flex flex-col gap-3 h-full overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="text-center">
        <div
          className="font-display font-black"
          style={{
            fontSize: "14px",
            color: "#bf00ff",
            textShadow: "0 0 10px #bf00ff",
          }}
        >
          {unlocked} / {total} UNLOCKED
        </div>
        <div
          className="mt-1 rounded-full overflow-hidden"
          style={{ height: 4, background: "rgba(255,255,255,0.08)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${(unlocked / total) * 100}%`,
              background: "linear-gradient(90deg, #bf00ff, #ff2d78)",
              boxShadow: "0 0 8px #bf00ff",
            }}
          />
        </div>
      </div>

      {/* Achievement grid */}
      <div className="grid grid-cols-2 gap-2">
        {ACHIEVEMENTS.map((ach) => {
          const isUnlocked = achievements.has(ach.id);
          return (
            <div
              key={ach.id}
              className="rounded p-2 flex flex-col items-center gap-1 text-center"
              style={{
                background: isUnlocked
                  ? "rgba(191,0,255,0.12)"
                  : "rgba(255,255,255,0.03)",
                border: isUnlocked
                  ? "1px solid rgba(191,0,255,0.4)"
                  : "1px solid rgba(255,255,255,0.06)",
                opacity: isUnlocked ? 1 : 0.4,
                transition: "all 0.3s",
              }}
            >
              <span
                style={{
                  fontSize: "22px",
                  filter: isUnlocked ? "none" : "grayscale(1)",
                }}
              >
                {ach.icon}
              </span>
              <div
                className="font-display font-bold leading-tight"
                style={{
                  fontSize: "10px",
                  color: isUnlocked ? "#bf00ff" : "#ffffff40",
                  textShadow: isUnlocked ? "0 0 6px #bf00ff80" : undefined,
                }}
              >
                {ach.name}
              </div>
              <div
                className="font-mono"
                style={{ fontSize: "8px", color: "#ffffff30", lineHeight: 1.3 }}
              >
                {ach.description}
              </div>
              {isUnlocked && (
                <div
                  style={{
                    fontSize: "8px",
                    color: "#39ff14",
                    fontFamily: "monospace",
                  }}
                >
                  ✓ UNLOCKED
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
