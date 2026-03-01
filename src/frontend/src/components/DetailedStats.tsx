import { UPGRADES } from "@/game/gameData";
import { formatNumber } from "@/game/gameData";
import type { GameUIState } from "@/game/useGameEngine";

interface DetailedStatsProps {
  uiState: GameUIState;
}

export function DetailedStats({ uiState }: DetailedStatsProps) {
  const {
    points,
    totalPointsEarned,
    totalClicks,
    pointsPerClick,
    pointsPerSecond,
    prestigeCount,
    stimulationLevel,
    upgrades,
    achievements,
  } = uiState;

  const totalUpgrades = Object.values(upgrades).reduce((a, b) => a + b, 0);
  const ownedUpgradeNames = UPGRADES.filter((u) => (upgrades[u.id] || 0) > 0);

  return (
    <div className="flex flex-col gap-3 h-full overflow-y-auto custom-scrollbar">
      <StatSection title="ECONOMY" color="#00f5ff">
        <StatRow label="Current Points" value={formatNumber(points)} />
        <StatRow label="Total Earned" value={formatNumber(totalPointsEarned)} />
        <StatRow label="Points / Click" value={formatNumber(pointsPerClick)} />
        <StatRow
          label="Points / Second"
          value={formatNumber(pointsPerSecond)}
        />
        <StatRow
          label="Points / Minute"
          value={formatNumber(pointsPerSecond * 60)}
        />
      </StatSection>

      <StatSection title="PROGRESS" color="#bf00ff">
        <StatRow label="Total Clicks" value={totalClicks.toLocaleString()} />
        <StatRow label="Prestige Count" value={`${prestigeCount}×`} />
        <StatRow
          label="Prestige Multiplier"
          value={`×${(1 + prestigeCount * 0.5).toFixed(1)}`}
        />
        <StatRow label="Achievements" value={`${achievements.size} / 20`} />
        <StatRow label="Total Upgrades" value={`${totalUpgrades}`} />
      </StatSection>

      <StatSection title="STIMULATION" color="#ff6b00">
        <StatRow
          label="Stimulation Level"
          value={`${Math.round(stimulationLevel)}%`}
        />
        <StatRow
          label="Status"
          value={
            stimulationLevel >= 80
              ? "MAXIMUM OVERLOAD"
              : stimulationLevel >= 50
                ? "BRAIN MELTING"
                : stimulationLevel >= 25
                  ? "GETTING CHAOTIC"
                  : "CALM... FOR NOW"
          }
        />
        <StatRow
          label="Until Prestige"
          value={
            totalPointsEarned >= 1_000_000
              ? "READY!"
              : `${formatNumber(1_000_000 - totalPointsEarned)} left`
          }
        />
      </StatSection>

      {ownedUpgradeNames.length > 0 && (
        <StatSection title="OWNED UPGRADES" color="#39ff14">
          {ownedUpgradeNames.map((u) => (
            <StatRow
              key={u.id}
              label={u.name}
              value={`${upgrades[u.id] || 0} / ${u.maxCount}`}
            />
          ))}
        </StatSection>
      )}
    </div>
  );
}

function StatSection({
  title,
  color,
  children,
}: {
  title: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div
        className="font-display font-black text-xs mb-2 flex items-center gap-2"
        style={{
          color,
          textShadow: `0 0 8px ${color}80`,
          letterSpacing: "0.1em",
        }}
      >
        <div className="h-px flex-1" style={{ background: `${color}40` }} />
        {title}
        <div className="h-px flex-1" style={{ background: `${color}40` }} />
      </div>
      <div
        className="rounded overflow-hidden"
        style={{ border: `1px solid ${color}20` }}
      >
        {children}
      </div>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="flex justify-between items-center px-2 py-1.5"
      style={{
        borderBottom: "1px solid rgba(255,255,255,0.04)",
        background: "rgba(255,255,255,0.02)",
      }}
    >
      <span
        className="font-mono"
        style={{ fontSize: "10px", color: "#ffffff60" }}
      >
        {label}
      </span>
      <span
        className="font-display font-bold"
        style={{ fontSize: "11px", color: "#ffffff90" }}
      >
        {value}
      </span>
    </div>
  );
}
