import { useCallback, useState } from "react";

interface ClickButtonProps {
  onClickAt: (x: number, y: number) => void;
  pointsPerClick: number;
  comboCount: number;
  stimulationLevel: number;
}

export function ClickButton({
  onClickAt,
  comboCount,
  stimulationLevel,
}: ClickButtonProps) {
  const [isClicking, setIsClicking] = useState(false);
  const [ripples, setRipples] = useState<
    { id: number; x: number; y: number }[]
  >([]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setIsClicking(true);
      setTimeout(() => setIsClicking(false), 150);

      const id = Date.now() + Math.random();
      setRipples((prev) => [...prev.slice(-5), { id, x, y }]);
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 600);

      onClickAt(e.clientX, e.clientY);
    },
    [onClickAt],
  );

  const orbSize = 140 + Math.min(stimulationLevel * 0.8, 60);
  const comboColor =
    comboCount > 20
      ? "#ffff00"
      : comboCount > 10
        ? "#ff6b00"
        : comboCount > 5
          ? "#ff2d78"
          : "#ff2d78";

  const glowIntensity = 1 + stimulationLevel / 50;

  return (
    <div className="flex flex-col items-center gap-4 select-none">
      {/* Combo indicator */}
      {comboCount > 1 && (
        <div
          className="font-display font-black text-center transition-all"
          style={{
            color: comboColor,
            fontSize: `${Math.min(14 + comboCount * 1.5, 36)}px`,
            textShadow: `0 0 12px ${comboColor}, 0 0 30px ${comboColor}60`,
            animation: "neon-flicker 0.5s ease-in-out",
          }}
        >
          ×{(1 + comboCount * 0.15).toFixed(1)} COMBO!
        </div>
      )}

      {/* Main orb */}
      <div
        className="relative flex items-center justify-center"
        style={{ touchAction: "none" }}
      >
        {/* Outer glow ring */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: orbSize + 60,
            height: orbSize + 60,
            background: `radial-gradient(circle, oklch(0.68 0.28 340 / ${0.15 * glowIntensity}) 0%, transparent 70%)`,
            animation: "orb-pulse 2.5s ease-in-out infinite",
          }}
        />

        {/* Click button */}
        <button
          type="button"
          onPointerDown={handlePointerDown}
          className="relative rounded-full cursor-pointer overflow-hidden focus:outline-none"
          style={{
            width: orbSize,
            height: orbSize,
            background: `radial-gradient(circle at 35% 35%, 
              #ff6eb4 0%, 
              #ff2d78 35%, 
              #b80050 65%,
              #6b0030 100%
            )`,
            boxShadow: `
              0 0 ${20 * glowIntensity}px ${8 * glowIntensity}px #ff2d78aa,
              0 0 ${60 * glowIntensity}px ${20 * glowIntensity}px #ff2d7844,
              0 0 ${100 * glowIntensity}px ${40 * glowIntensity}px #bf00ff22,
              inset 0 2px 10px rgba(255,255,255,0.3),
              inset 0 -2px 10px rgba(0,0,0,0.4)
            `,
            transform: isClicking ? "scale(0.91)" : "scale(1)",
            transition: "transform 0.12s cubic-bezier(0.34, 1.56, 0.64, 1)",
            animation: !isClicking
              ? "orb-pulse 2.5s ease-in-out infinite"
              : undefined,
          }}
        >
          {/* Shine */}
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: "55%",
              height: "55%",
              top: "8%",
              left: "15%",
              background:
                "radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)",
            }}
          />

          {/* Label */}
          <div
            className="absolute inset-0 flex items-center justify-center font-display font-black pointer-events-none"
            style={{
              fontSize: orbSize * 0.11,
              color: "rgba(255,255,255,0.9)",
              textShadow: "0 2px 8px rgba(0,0,0,0.6)",
              letterSpacing: "0.05em",
            }}
          >
            CLICK!
          </div>

          {/* Ripples */}
          {ripples.map((r) => (
            <div
              key={r.id}
              className="absolute rounded-full pointer-events-none"
              style={{
                left: r.x - 5,
                top: r.y - 5,
                width: 10,
                height: 10,
                background: "rgba(255,255,255,0.6)",
                animation: "ripple-out 0.6s ease-out forwards",
              }}
            />
          ))}
        </button>

        {/* Orbiting particles when stimulation high */}
        {stimulationLevel > 30 &&
          Array.from(
            { length: Math.floor(stimulationLevel / 20) },
            (_, i) => i,
          ).map((i) => (
            <div
              key={`orbit-${i}`}
              className="absolute rounded-full pointer-events-none"
              style={{
                width: 8,
                height: 8,
                background: ["#ff2d78", "#00f5ff", "#39ff14", "#ffff00"][i % 4],
                boxShadow: `0 0 6px 2px ${["#ff2d78", "#00f5ff", "#39ff14", "#ffff00"][i % 4]}`,
                transformOrigin: "0 0",
                animation: `orbit-${i} ${2 + i * 0.5}s linear infinite`,
                top: "50%",
                left: "50%",
                transform: `rotate(${(360 / Math.floor(stimulationLevel / 20)) * i}deg) translateX(${orbSize / 2 + 20}px)`,
              }}
            />
          ))}
      </div>

      <style>{`
        @keyframes ripple-out {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(${orbSize / 5}); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
