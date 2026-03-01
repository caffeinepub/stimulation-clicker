import { formatNumber } from "@/game/gameData";
import type { GameUIState } from "@/game/useGameEngine";

interface StatsPanelProps {
  uiState: GameUIState;
  onPrestige: () => void;
}

export function StatsPanel({ uiState, onPrestige }: StatsPanelProps) {
  const {
    points,
    pointsPerClick,
    pointsPerSecond,
    stimulationLevel,
    prestigeCount,
    canPrestige,
    manicModeActive,
    manicModeTimeLeft,
    comboCount,
    comboMultiplier,
  } = uiState;

  const stimColor =
    stimulationLevel >= 80
      ? "#ff2d78"
      : stimulationLevel >= 50
        ? "#ff6b00"
        : stimulationLevel >= 25
          ? "#ffff00"
          : "#39ff14";

  return (
    <div className="flex flex-col gap-2">
      {/* Points display */}
      <div className="text-center mb-1">
        <div
          className="font-display font-black leading-none"
          style={{
            fontSize: "clamp(28px, 4vw, 48px)",
            color: "#ff2d78",
            textShadow: "0 0 12px #ff2d78, 0 0 30px #ff2d7860",
          }}
        >
          {formatNumber(points)}
        </div>
        <div className="text-xs font-mono" style={{ color: "#ffffff80" }}>
          STIMULATION POINTS
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-1.5">
        <StatBox
          label="PER CLICK"
          value={formatNumber(pointsPerClick)}
          color="#00f5ff"
        />
        <StatBox
          label="PER SECOND"
          value={formatNumber(pointsPerSecond)}
          color="#39ff14"
        />
        {prestigeCount > 0 && (
          <StatBox
            label="PRESTIGE"
            value={`×${prestigeCount}`}
            color="#bf00ff"
          />
        )}
        {comboCount > 1 && (
          <StatBox
            label="COMBO"
            value={`×${comboMultiplier.toFixed(1)}`}
            color="#ffff00"
          />
        )}
      </div>

      {/* Stimulation meter */}
      <div className="mt-1">
        <div
          className="flex justify-between items-center mb-1"
          style={{ fontSize: "10px", color: "#ffffff60" }}
        >
          <span className="font-mono font-bold" style={{ color: stimColor }}>
            STIMULATION
          </span>
          <span className="font-mono" style={{ color: stimColor }}>
            {Math.round(stimulationLevel)}%
          </span>
        </div>
        <div
          className="relative rounded-full overflow-hidden"
          style={{
            height: 8,
            background: "rgba(255,255,255,0.08)",
            border: `1px solid ${stimColor}40`,
          }}
        >
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-all duration-300"
            style={{
              width: `${stimulationLevel}%`,
              background: `linear-gradient(90deg, ${stimColor}80, ${stimColor})`,
              boxShadow: `0 0 8px ${stimColor}`,
            }}
          />
          {/* Segment marks */}
          {[25, 50, 75].map((mark) => (
            <div
              key={mark}
              className="absolute inset-y-0 w-px"
              style={{
                left: `${mark}%`,
                background: "rgba(255,255,255,0.3)",
              }}
            />
          ))}
        </div>
        <div
          className="flex justify-between mt-0.5"
          style={{ fontSize: "9px", color: "#ffffff30" }}
        >
          <span>CALM</span>
          <span>CHAOS</span>
          <span>MAX</span>
        </div>
      </div>

      {/* Manic mode timer */}
      {manicModeActive && (
        <div
          className="text-center font-display font-black rounded px-2 py-1"
          style={{
            background: "rgba(255,200,0,0.15)",
            border: "1px solid #ffcc00",
            color: "#ffcc00",
            textShadow: "0 0 10px #ffcc00",
            fontSize: "11px",
            animation: "prestige-pulse 0.8s ease-in-out infinite",
          }}
        >
          ⚡ MANIC MODE: {Math.ceil(manicModeTimeLeft)}s
        </div>
      )}

      {/* Prestige button */}
      {canPrestige && (
        <button
          type="button"
          onClick={onPrestige}
          className="w-full font-display font-black rounded py-2 px-3 transition-all hover:scale-105 active:scale-95 prestige-pulse-anim"
          style={{
            background: "linear-gradient(135deg, #6b0030, #b80050, #ff6600)",
            color: "#fff",
            fontSize: "12px",
            letterSpacing: "0.12em",
            border: "1px solid #ffcc00",
            textShadow: "0 0 8px #ffcc00",
            cursor: "pointer",
          }}
        >
          ⭐ PRESTIGE ⭐
        </button>
      )}
    </div>
  );
}

function StatBox({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div
      className="rounded px-2 py-1.5 text-center"
      style={{
        background: `${color}10`,
        border: `1px solid ${color}30`,
      }}
    >
      <div
        className="font-display font-black"
        style={{ color, fontSize: "15px", textShadow: `0 0 8px ${color}80` }}
      >
        {value}
      </div>
      <div
        className="font-mono"
        style={{ fontSize: "9px", color: `${color}80` }}
      >
        {label}
      </div>
    </div>
  );
}
