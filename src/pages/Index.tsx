import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { GameCard } from "@/components/GameCard";
import { toast } from "sonner";

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
      setGameColor("red");
      const timeInSeconds = (time / 1000).toFixed(2);
      if (time <= 150) {
        setResultMessage(`${timeInSeconds}초 - 리워드를 받을 수 있어요! 🎁`);
      } else {
        setResultMessage(`반응속도: ${timeInSeconds}초 🎯`);
      }
    }
  }, [stage, startTime]);

  const retry = useCallback(() => {
    setStage("intro");
    setGameColor("blue");
    setStartTime(null);
    setReactionTime(null);
    setResultMessage("");
  }, []);

  const handleRewardClick = useCallback(() => {
    toast("광고 시청 중...", {
      description: "잠시만 기다려주세요!",
      duration: 2000,
    });
    
    setTimeout(() => {
      toast.success("축하합니다! 🎁", {
        description: "리워드가 지급되었습니다!",
        duration: 3000,
      });
    }, 2000);
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
            캐릭터 반응 게임 🎨
          </h1>
          <p className="text-xl text-muted-foreground mb-4">
            여우로 바뀔 때만 터치하세요!
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
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              {stage === "waiting" ? "기다려요..." : "지금 터치!"}
            </h2>
            <p className="text-lg text-muted-foreground">
              캐릭터가 여우로 바뀔 때 터치하세요
            </p>
          </div>
          <GameCard color={gameColor} onClick={handleTap}>
            {stage === "waiting" ? "터치!" : "지금!"}
          </GameCard>
          <p className="text-muted-foreground">* 캐릭터를 터치하세요</p>
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
            {reactionTime !== null && reactionTime <= 150 && (
              <Button
                onClick={handleRewardClick}
                variant="secondary"
                size="lg"
                className="text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all"
              >
                🎬 광고 보고 리워드 받기
              </Button>
            )}
            {reactionTime !== null && (
              <p className="text-center text-muted-foreground text-sm">
                {reactionTime <= 150
                  ? "🏆 최고의 반응속도! 리워드 획득!"
                  : reactionTime < 200
                  ? "조금만 더 빨리! (리워드는 0.15초 이하)"
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
        귀여운 캐릭터 반응속도 게임 ✨
      </div>
    </div>
  );
};

export default Index;
