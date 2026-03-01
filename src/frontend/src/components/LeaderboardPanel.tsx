import { formatNumber } from "@/game/gameData";
import type { GameUIState } from "@/game/useGameEngine";
import { useActor } from "@/hooks/useActor";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

interface LeaderboardPanelProps {
  uiState: GameUIState;
}

export function LeaderboardPanel({ uiState }: LeaderboardPanelProps) {
  const [playerName, setPlayerName] = useState("");
  const queryClient = useQueryClient();
  const { actor, isFetching } = useActor();

  const { data: leaderboard = [], isLoading: isLoadingLB } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLeaderboard();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
  });

  const { data: globalStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["globalStats"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getGlobalStats();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      const name = playerName.trim() || "Anonymous";
      return actor.submitScore(
        name,
        BigInt(Math.floor(uiState.totalPointsEarned)),
        BigInt(uiState.prestigeCount),
      );
    },
    onSuccess: () => {
      toast.success("Score submitted!", {
        style: {
          background: "#0d0d1a",
          border: "1px solid #39ff14",
          color: "#39ff14",
        },
      });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
      queryClient.invalidateQueries({ queryKey: ["globalStats"] });
    },
    onError: () => {
      toast.error("Failed to submit score", {
        style: {
          background: "#0d0d1a",
          border: "1px solid #ff2d78",
          color: "#ff2d78",
        },
      });
    },
  });

  const rankColors = ["#ffcc00", "#c0c0c0", "#cd7f32"];
  const rankEmojis = ["🥇", "🥈", "🥉"];

  return (
    <div className="flex flex-col gap-3 h-full overflow-y-auto custom-scrollbar">
      {/* Global Stats */}
      <div
        className="rounded p-3 grid grid-cols-3 gap-2"
        style={{
          background: "rgba(0,245,255,0.06)",
          border: "1px solid rgba(0,245,255,0.2)",
        }}
      >
        <GlobalStatItem
          label="PLAYERS"
          value={
            isLoadingStats
              ? "..."
              : formatNumber(Number(globalStats?.totalPlayers ?? 0))
          }
          color="#00f5ff"
        />
        <GlobalStatItem
          label="TOTAL CLICKS"
          value={
            isLoadingStats
              ? "..."
              : formatNumber(Number(globalStats?.totalClicks ?? 0))
          }
          color="#ff2d78"
        />
        <GlobalStatItem
          label="PRESTIGES"
          value={
            isLoadingStats
              ? "..."
              : formatNumber(Number(globalStats?.totalPrestige ?? 0))
          }
          color="#bf00ff"
        />
      </div>

      {/* Submit score */}
      <div
        className="rounded p-3 flex flex-col gap-2"
        style={{
          background: "rgba(57,255,20,0.06)",
          border: "1px solid rgba(57,255,20,0.2)",
        }}
      >
        <div
          className="font-display font-black"
          style={{
            fontSize: "11px",
            color: "#39ff14",
            textShadow: "0 0 6px #39ff14",
            letterSpacing: "0.08em",
          }}
        >
          SUBMIT YOUR SCORE
        </div>
        <div
          className="font-mono text-center"
          style={{ fontSize: "10px", color: "#ffffff60" }}
        >
          Total earned: {formatNumber(uiState.totalPointsEarned)} pts &bull;{" "}
          {uiState.prestigeCount} prestiges
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value.slice(0, 20))}
            placeholder="Your name..."
            maxLength={20}
            className="flex-1 rounded px-2 py-1 font-mono text-xs focus:outline-none"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(57,255,20,0.3)",
              color: "#ffffff",
              fontSize: "11px",
            }}
          />
          <button
            type="button"
            onClick={() => submitMutation.mutate()}
            disabled={submitMutation.isPending || isFetching}
            className="rounded px-3 py-1 font-display font-black transition-all hover:scale-105 active:scale-95"
            style={{
              background:
                submitMutation.isPending || isFetching
                  ? "rgba(57,255,20,0.2)"
                  : "linear-gradient(135deg, #006600, #39ff14)",
              color: "#000",
              fontSize: "11px",
              cursor:
                submitMutation.isPending || isFetching
                  ? "not-allowed"
                  : "pointer",
              border: "none",
            }}
          >
            {submitMutation.isPending ? "..." : "SUBMIT"}
          </button>
        </div>
      </div>

      {/* Leaderboard table */}
      <div
        className="font-display font-black"
        style={{
          fontSize: "11px",
          color: "#ff2d78",
          letterSpacing: "0.08em",
          textShadow: "0 0 6px #ff2d78",
        }}
      >
        TOP PLAYERS
      </div>

      {isLoadingLB || isFetching ? (
        <div
          className="text-center font-mono py-4"
          style={{ fontSize: "11px", color: "#ffffff40" }}
        >
          Loading...
        </div>
      ) : leaderboard.length === 0 ? (
        <div
          className="text-center font-mono py-4"
          style={{ fontSize: "11px", color: "#ffffff30" }}
        >
          No scores yet. Be the first!
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          {leaderboard.slice(0, 10).map((entry, idx) => (
            <div
              key={`${entry.name}-${idx}`}
              className="flex items-center gap-2 rounded px-2 py-1.5"
              style={{
                background:
                  idx === 0 ? "rgba(255,204,0,0.08)" : "rgba(255,255,255,0.03)",
                border:
                  idx < 3
                    ? `1px solid ${rankColors[idx]}30`
                    : "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <span
                style={{
                  fontSize: "14px",
                  width: "20px",
                  textAlign: "center",
                }}
              >
                {idx < 3 ? rankEmojis[idx] : `#${idx + 1}`}
              </span>
              <span
                className="flex-1 font-display font-bold truncate"
                style={{
                  fontSize: "11px",
                  color: idx < 3 ? rankColors[idx] : "#ffffff80",
                  textShadow:
                    idx < 3 ? `0 0 6px ${rankColors[idx]}60` : undefined,
                }}
              >
                {entry.name}
              </span>
              <div className="text-right">
                <div
                  className="font-display font-black"
                  style={{
                    fontSize: "12px",
                    color: idx < 3 ? rankColors[idx] : "#ffffff60",
                  }}
                >
                  {formatNumber(Number(entry.score))}
                </div>
                {Number(entry.prestigeCount) > 0 && (
                  <div
                    className="font-mono"
                    style={{ fontSize: "9px", color: "#bf00ff80" }}
                  >
                    ⭐×{Number(entry.prestigeCount)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function GlobalStatItem({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="text-center">
      <div
        className="font-display font-black"
        style={{
          fontSize: "14px",
          color,
          textShadow: `0 0 8px ${color}80`,
        }}
      >
        {value}
      </div>
      <div
        className="font-mono"
        style={{ fontSize: "8px", color: "#ffffff30" }}
      >
        {label}
      </div>
    </div>
  );
}
