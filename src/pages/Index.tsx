import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { GameCard } from "@/components/GameCard";

type GameStage = "intro" | "waiting" | "ready" | "result";
type GameColor = "blue" | "red" | "green" | "gray";

const Index = () => {
  const [stage, setStage] = useState<GameStage>("intro");
  const [gameColor, setGameColor] = useState<GameColor>("blue");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [resultMessage, setResultMessage] = useState("");

  const startGame = useCallback(() => {
    setStage("waiting");
    setGameColor("blue");
    setReactionTime(null);

    // Random delay between 2-5 seconds
    const delay = Math.random() * 3000 + 2000;
    
    const timer = setTimeout(() => {
      setGameColor("red");
      setStartTime(Date.now());
      setStage("ready");
    }, delay);

    return () => clearTimeout(timer);
  }, []);

  const handleTap = useCallback(() => {
    if (stage === "waiting") {
      // Too early!
      setStage("result");
      setGameColor("gray");
      setResultMessage("너무 빨라요! 😅");
      setReactionTime(null);
    } else if (stage === "ready" && startTime) {
      // Perfect timing!
      const time = Date.now() - startTime;
      setReactionTime(time);
      setStage("result");
      setGameColor("green");
      setResultMessage(`반응속도: ${(time / 1000).toFixed(2)}초 🎯`);
    }
  }, [stage, startTime]);

  const retry = useCallback(() => {
    setStage("intro");
    setGameColor("blue");
    setStartTime(null);
    setReactionTime(null);
    setResultMessage("");
  }, []);

  // Keyboard support (Space bar)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        if (stage === "intro") {
          startGame();
        } else if (stage === "waiting" || stage === "ready") {
          handleTap();
        } else if (stage === "result") {
          retry();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [stage, startGame, handleTap, retry]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 flex flex-col items-center justify-center p-4 gap-8">
      {/* Intro Screen */}
      {stage === "intro" && (
        <div className="flex flex-col items-center gap-6 animate-in fade-in duration-500">
          <h1 className="text-5xl font-black text-foreground mb-2">
            색깔 반응 게임 🎨
          </h1>
          <p className="text-xl text-muted-foreground mb-4">
            빨간색으로 바뀔 때만 터치하세요!
          </p>
          <GameCard color="blue">준비하세요!</GameCard>
          <Button
            onClick={startGame}
            size="lg"
            className="text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all"
          >
            시작하기 🚀
          </Button>
        </div>
      )}

      {/* Game Screen */}
      {(stage === "waiting" || stage === "ready") && (
        <div className="flex flex-col items-center gap-6 animate-in fade-in duration-300">
          <h2 className="text-3xl font-bold text-foreground">
            {stage === "waiting" ? "기다려요..." : "지금 터치!"}
          </h2>
          <GameCard color={gameColor} onClick={handleTap}>
            {stage === "waiting" ? "터치!" : "지금!"}
          </GameCard>
          <p className="text-muted-foreground">* 박스를 터치하세요</p>
        </div>
      )}

      {/* Result Screen */}
      {stage === "result" && (
        <div className="flex flex-col items-center gap-6 animate-in fade-in duration-500">
          <h2 className="text-3xl font-bold text-foreground">결과</h2>
          <GameCard color={gameColor}>{resultMessage}</GameCard>
          <div className="flex flex-col gap-3">
            <Button
              onClick={retry}
              size="lg"
              className="text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all"
            >
              다시 하기 🔄
            </Button>
            {reactionTime !== null && (
              <p className="text-center text-muted-foreground text-sm">
                {reactionTime < 200
                  ? "놀라운 반응속도! 🏆"
                  : reactionTime < 300
                  ? "훌륭해요! 👏"
                  : reactionTime < 500
                  ? "잘했어요! 😊"
                  : "다음엔 더 빠르게! 💪"}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="fixed bottom-4 text-center text-xs text-muted-foreground">
        귀여운 캐릭터와 함께하는 반응속도 게임 ✨
      </div>
    </div>
  );
};

export default Index;
