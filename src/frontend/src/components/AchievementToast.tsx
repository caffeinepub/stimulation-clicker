import { ACHIEVEMENT_MAP } from "@/game/gameData";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

interface AchievementToastProps {
  achievementId: string | null;
}

function AchievementToast({ achievementId }: AchievementToastProps) {
  const ach = achievementId ? ACHIEVEMENT_MAP[achievementId] : null;

  return (
    <AnimatePresence>
      {ach && (
        <motion.div
          key={achievementId}
          initial={{ y: 60, opacity: 0, scale: 0.8 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -60, opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
          style={{ minWidth: "220px" }}
        >
          <div
            className="rounded-lg px-4 py-3 flex items-center gap-3"
            style={{
              background:
                "linear-gradient(135deg, rgba(13,13,26,0.95), rgba(30,10,50,0.95))",
              border: "1px solid rgba(191,0,255,0.6)",
              boxShadow:
                "0 0 20px rgba(191,0,255,0.4), 0 0 60px rgba(191,0,255,0.15)",
              backdropFilter: "blur(10px)",
            }}
          >
            <span style={{ fontSize: "28px" }}>{ach.icon}</span>
            <div>
              <div
                className="font-mono font-bold"
                style={{
                  fontSize: "9px",
                  color: "#bf00ff",
                  textShadow: "0 0 6px #bf00ff",
                  letterSpacing: "0.12em",
                  marginBottom: "2px",
                }}
              >
                ACHIEVEMENT UNLOCKED!
              </div>
              <div
                className="font-display font-black"
                style={{
                  fontSize: "14px",
                  color: "#ffffff",
                  textShadow: "0 0 8px #bf00ff60",
                }}
              >
                {ach.name}
              </div>
              <div
                className="font-mono"
                style={{ fontSize: "10px", color: "#ffffff60" }}
              >
                {ach.description}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function AchievementToastManager({
  newAchievementId,
}: {
  newAchievementId: string | null;
}) {
  const [visible, setVisible] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((id: string) => {
    setVisible(id);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setVisible(null), 3000);
  }, []);

  useEffect(() => {
    if (newAchievementId) show(newAchievementId);
  }, [newAchievementId, show]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return <AchievementToast achievementId={visible} />;
}
