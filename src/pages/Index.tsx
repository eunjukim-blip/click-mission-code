import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

type GameStage = "intro" | "playing" | "result";

const TARGET_CLICKS = 120;
const GAME_DURATION = 20;

const Index = () => {
  const [stage, setStage] = useState<GameStage>("intro");
  const [clicks, setClicks] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [balloonScale, setBalloonScale] = useState(1);
  const [isPopping, setIsPopping] = useState(false);

  const startGame = useCallback(() => {
    setStage("playing");
    setClicks(0);
    setTimeLeft(GAME_DURATION);
    setBalloonScale(1);
    setIsPopping(false);
  }, []);

  const handleBalloonClick = useCallback(() => {
    if (stage !== "playing") return;

    const newClicks = clicks + 1;
    setClicks(newClicks);

    // Balloon grows with each click
    const scale = 1 + (newClicks % 10) * 0.15;
    setBalloonScale(scale);

    // Pop animation every 10 clicks
    if (newClicks % 10 === 0) {
      setIsPopping(true);
      setTimeout(() => {
        setIsPopping(false);
        setBalloonScale(1);
      }, 300);
    }

    // Check win condition
    if (newClicks >= TARGET_CLICKS) {
      setStage("result");
      toast.success("성공! 🎉", {
        description: `${TARGET_CLICKS}개 달성!`,
      });
    }
  }, [stage, clicks]);

  const retry = useCallback(() => {
    setStage("intro");
    setClicks(0);
    setTimeLeft(GAME_DURATION);
    setBalloonScale(1);
    setIsPopping(false);
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

  // Timer countdown
  useEffect(() => {
    if (stage !== "playing") return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0.1) {
          setStage("result");
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [stage]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 flex flex-col items-center justify-center p-4 gap-8">
      {/* Intro Screen */}
      {stage === "intro" && (
        <div className="flex flex-col items-center gap-6 animate-in fade-in duration-500 max-w-md">
          <h1 className="text-5xl font-black text-foreground mb-2 text-center">
            보석 캐기 챌린지 💎
          </h1>
          <div className="text-center space-y-3">
            <p className="text-xl text-muted-foreground">
              20초 안에 돌을 120번 캐세요!
            </p>
            <p className="text-lg text-primary font-semibold">
              ⚡ 성공하면 리워드를 받을 수 있어요!
            </p>
          </div>
          <div className="w-48 h-48 flex items-center justify-center">
            <div className="relative">
              <div className="w-40 h-40 bg-gradient-to-br from-gray-500 via-gray-600 to-gray-700 rounded-lg rotate-45 shadow-2xl animate-pulse">
                <div className="absolute inset-4 bg-gradient-to-br from-gray-400 to-gray-500 rounded-sm"></div>
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl">⛏️</div>
            </div>
          </div>
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
      {stage === "playing" && (
        <div className="flex flex-col items-center gap-6 animate-in fade-in duration-300 w-full max-w-md">
          <div className="w-full space-y-4">
            <div className="flex justify-between items-center">
              <div className="text-2xl font-bold text-foreground">
                ⏱️ {timeLeft.toFixed(1)}초
              </div>
              <div className="text-2xl font-bold text-primary">
                🎈 {clicks}/{TARGET_CLICKS}
              </div>
            </div>
            <Progress value={(clicks / TARGET_CLICKS) * 100} className="h-3" />
          </div>

          <div 
            onClick={handleBalloonClick}
            className="relative flex items-center justify-center cursor-pointer select-none mt-8"
          >
            {!isPopping ? (
              <div className="relative">
                <div 
                  className="w-40 h-40 bg-gradient-to-br from-gray-500 via-gray-600 to-gray-700 rounded-lg rotate-45 shadow-2xl transition-all duration-200 hover:scale-110 active:scale-95"
                  style={{ 
                    transform: `rotate(45deg) scale(${balloonScale})`,
                  }}
                >
                  {/* 균열 효과 */}
                  {clicks % 10 > 3 && (
                    <div className="absolute inset-0 overflow-hidden rounded-lg">
                      <div className="absolute top-0 left-1/2 w-0.5 h-full bg-black/40 rotate-12"></div>
                      <div className="absolute top-1/2 left-0 w-full h-0.5 bg-black/40 -rotate-12"></div>
                    </div>
                  )}
                  {clicks % 10 > 6 && (
                    <div className="absolute inset-0 overflow-hidden rounded-lg">
                      <div className="absolute top-0 right-1/4 w-0.5 h-full bg-black/40 -rotate-12"></div>
                      <div className="absolute top-1/4 left-0 w-full h-0.5 bg-black/40 rotate-12"></div>
                    </div>
                  )}
                  <div className="absolute inset-4 bg-gradient-to-br from-gray-400 to-gray-500 rounded-sm"></div>
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl pointer-events-none">⛏️</div>
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-8xl animate-ping">💎</div>
                <div className="absolute text-6xl">✨</div>
              </div>
            )}
          </div>
          
          <p className="text-muted-foreground text-center">
            돌을 빠르게 캐세요! 보석이 나올 거예요!
          </p>
        </div>
      )}

      {/* Result Screen */}
      {stage === "result" && (
        <div className="flex flex-col items-center gap-6 animate-in fade-in duration-500 max-w-md">
          <h2 className="text-4xl font-bold text-foreground">
            {clicks >= TARGET_CLICKS ? "🎉 성공!" : "아쉬워요!"}
          </h2>
          
          <div className="text-center space-y-2">
            <p className="text-3xl font-bold text-primary">
              {clicks}/{TARGET_CLICKS} 클릭
            </p>
            <p className="text-xl text-muted-foreground">
              {clicks >= TARGET_CLICKS 
                ? "완벽해요! 리워드를 받으세요! 🎁"
                : `${TARGET_CLICKS - clicks}개 더 필요했어요!`
              }
            </p>
          </div>

          <div className="w-48 h-48 flex items-center justify-center">
            {clicks >= TARGET_CLICKS ? (
              <div className="relative">
                <div className="text-8xl animate-bounce">💎</div>
                <div className="absolute inset-0 text-6xl animate-pulse">✨</div>
              </div>
            ) : (
              <div className="relative">
                <div className="w-40 h-40 bg-gradient-to-br from-gray-400 to-gray-500 rounded-lg rotate-45 opacity-50">
                  <div className="absolute inset-4 bg-gradient-to-br from-gray-300 to-gray-400 rounded-sm"></div>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 w-full">
            <Button
              onClick={retry}
              size="lg"
              className="text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all"
            >
              🎬 광고 보고 다시하기
            </Button>
            {clicks >= TARGET_CLICKS && (
              <Button
                onClick={handleRewardClick}
                variant="secondary"
                size="lg"
                className="text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all"
              >
                🎬 광고 보고 리워드 받기
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="fixed bottom-4 text-center text-xs text-muted-foreground">
        보석 캐기 챌린지 💎 열심히 캐보세요!
      </div>
    </div>
  );
};

export default Index;
