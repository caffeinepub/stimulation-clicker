import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  UPGRADES,
  type UpgradeDef,
  calcUpgradeCost,
  formatNumber,
} from "@/game/gameData";
import type { GameUIState } from "@/game/useGameEngine";
import { useMemo } from "react";

interface UpgradeShopProps {
  uiState: GameUIState;
  onBuy: (id: string) => boolean;
}

export function UpgradeShop({ uiState, onBuy }: UpgradeShopProps) {
  const { points, upgrades } = uiState;

  const categories = useMemo(() => {
    const cats: Record<string, UpgradeDef[]> = {};
    for (const u of UPGRADES) {
      if (!cats[u.category]) cats[u.category] = [];
      cats[u.category].push(u);
    }
    return cats;
  }, []);

  return (
    <div className="flex flex-col gap-3 h-full overflow-y-auto custom-scrollbar pr-1">
      {Object.entries(categories).map(([cat, items]) => (
        <div key={cat}>
          <div
            className="font-display font-black text-xs mb-2 flex items-center gap-2"
            style={{
              color: CATEGORY_COLORS[cat],
              textShadow: `0 0 8px ${CATEGORY_COLORS[cat]}80`,
              letterSpacing: "0.1em",
            }}
          >
            <div
              className="h-px flex-1"
              style={{ background: `${CATEGORY_COLORS[cat]}40` }}
            />
            {CATEGORY_LABELS[cat]?.toUpperCase()}
            <div
              className="h-px flex-1"
              style={{ background: `${CATEGORY_COLORS[cat]}40` }}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            {items.map((upgrade) => {
              const owned = upgrades[upgrade.id] || 0;
              const cost = calcUpgradeCost(upgrade, owned);
              const canAfford = points >= cost;
              const maxed = owned >= upgrade.maxCount;
              const catColor = CATEGORY_COLORS[upgrade.category];

              return (
                <button
                  key={upgrade.id}
                  type="button"
                  onClick={() => onBuy(upgrade.id)}
                  disabled={!canAfford || maxed}
                  className="w-full text-left rounded transition-all duration-150 focus:outline-none"
                  style={{
                    background: maxed
                      ? "rgba(255,255,255,0.03)"
                      : canAfford
                        ? `${catColor}15`
                        : "rgba(255,255,255,0.04)",
                    border: maxed
                      ? "1px solid rgba(255,255,255,0.06)"
                      : canAfford
                        ? `1px solid ${catColor}50`
                        : `1px solid ${catColor}20`,
                    cursor: maxed || !canAfford ? "not-allowed" : "pointer",
                    opacity: maxed ? 0.4 : canAfford ? 1 : 0.65,
                    padding: "6px 10px",
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {upgrade.emoji && (
                        <span style={{ fontSize: "16px" }}>
                          {upgrade.emoji}
                        </span>
                      )}
                      <div className="flex-1 min-w-0">
                        <div
                          className="font-display font-bold truncate"
                          style={{
                            fontSize: "12px",
                            color: maxed
                              ? "#ffffff40"
                              : canAfford
                                ? catColor
                                : "#ffffff60",
                            textShadow:
                              canAfford && !maxed
                                ? `0 0 6px ${catColor}60`
                                : undefined,
                          }}
                        >
                          {upgrade.name}
                          {upgrade.id === "maximum_overdrive" && (
                            <span
                              className="ml-1"
                              style={{ color: "#ff2d78", fontSize: "10px" }}
                            >
                              !!!
                            </span>
                          )}
                        </div>
                        <div
                          className="font-mono truncate"
                          style={{ fontSize: "9px", color: "#ffffff40" }}
                        >
                          {upgrade.description}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end shrink-0">
                      {maxed ? (
                        <span
                          className="font-mono font-bold"
                          style={{ fontSize: "9px", color: "#39ff1480" }}
                        >
                          MAX
                        </span>
                      ) : (
                        <span
                          className="font-display font-black"
                          style={{
                            fontSize: "11px",
                            color: canAfford ? "#ffcc00" : "#ffffff40",
                            textShadow: canAfford
                              ? "0 0 6px #ffcc0080"
                              : undefined,
                          }}
                        >
                          {formatNumber(cost)}
                        </span>
                      )}
                      <span
                        className="font-mono"
                        style={{ fontSize: "9px", color: "#ffffff30" }}
                      >
                        {owned}/{upgrade.maxCount}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Footer */}
      <div
        className="text-center py-3 font-mono"
        style={{ fontSize: "10px", color: "#ffffff20" }}
      >
        © {new Date().getFullYear()}. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#ff2d7860" }}
        >
          caffeine.ai
        </a>
      </div>
    </div>
  );
}
