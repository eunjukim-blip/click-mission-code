import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type GameStage = "intro" | "playing" | "result";

const TARGET_CLICKS = 120;
const GAME_DURATION = 20;

const GemGame = () => {
  const navigate = useNavigate();
  const [stage, setStage] = useState<GameStage>("intro");
  const [clicks, setClicks] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [clickHistory, setClickHistory] = useState<number[]>(() => {
    const saved = localStorage.getItem("clickHistory");
    return saved ? JSON.parse(saved) : [];
  });

  const averageClicks = useMemo(() => {
    if (clickHistory.length === 0) return null;
    const sum = clickHistory.reduce((acc, clicks) => acc + clicks, 0);
    return sum / clickHistory.length;
  }, [clickHistory]);

  const startGame = useCallback(() => {
    setStage("playing");
    setClicks(0);
    setTimeLeft(GAME_DURATION);
  }, []);

  const handleBalloonClick = useCallback(() => {
    if (stage !== "playing") return;

    const newClicks = clicks + 1;
    setClicks(newClicks);

    // Check win condition
    if (newClicks >= TARGET_CLICKS) {
      setStage("result");
      toast.success("성공! 💎", {
        description: `보석을 찾았어요!`,
      });
    }
  }, [stage, clicks]);

  const retry = useCallback(() => {
    setStage("intro");
    setClicks(0);
    setTimeLeft(GAME_DURATION);
  }, []);

  const handleRewardClick = useCallback(() => {
    toast.success("축하합니다! 🎁", {
      description: "리워드가 지급되었습니다!",
      duration: 3000,
    });
  }, []);

  // Timer countdown
  useEffect(() => {
    if (stage !== "playing") return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0.1) {
          setStage("result");
          const success = clicks >= TARGET_CLICKS;
          
          // 데이터베이스에 저장
          supabase
            .from('gem_game_results')
            .insert({ clicks, success })
            .then(({ error }) => {
              if (error) console.error('Failed to save result:', error);
            });
          
          // 로컬 히스토리에도 저장
          const newHistory = [...clickHistory, clicks];
          setClickHistory(newHistory);
          localStorage.setItem("clickHistory", JSON.stringify(newHistory));
          
          // 실패시 진동
          if (!success && 'vibrate' in navigator) {
            navigator.vibrate([200, 100, 200]);
          }
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [stage, clicks, clickHistory]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 flex flex-col items-center justify-center p-4 gap-8">
      <Button
        onClick={() => navigate("/")}
        variant="ghost"
        className="fixed top-4 left-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        메뉴로
      </Button>

      {/* Intro Screen */}
      {stage === "intro" && (
        <div className="flex flex-col items-center gap-6 animate-in fade-in duration-500 max-w-md">
          <h1 className="text-3xl md:text-4xl font-black text-foreground mb-2 text-center">
            보석 캐기 챌린지 💎
          </h1>
          <div className="text-center space-y-3">
            <p className="text-xl text-muted-foreground">
              돌을 깨고 보석을 캐내세요!
            </p>
            <p className="text-lg text-primary font-semibold">
              ⚡ 20초안에 120을 클릭하면 보석획득!
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
                {clicks}/{TARGET_CLICKS}
              </div>
            </div>
            <Progress value={(clicks / TARGET_CLICKS) * 100} className="h-3" />
          </div>

          <div 
            onClick={handleBalloonClick}
            className="relative flex items-center justify-center cursor-pointer select-none mt-8 w-48 h-48 active:scale-90 transition-transform duration-100"
          >
            {clicks >= TARGET_CLICKS ? (
              // 보석 등장!
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-8xl animate-bounce">💎</div>
                <div className="absolute text-6xl animate-ping">✨</div>
              </div>
            ) : (
              <div className="relative">
                {/* 돌 */}
                <div 
                  className="w-40 h-40 bg-gradient-to-br from-gray-500 via-gray-600 to-gray-700 rounded-lg rotate-45 shadow-2xl transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  {/* 균열 효과 - 진행도에 따라 */}
                  <div className="absolute inset-0 overflow-hidden rounded-lg">
                    {/* 0-50: 초반 균열 */}
                    {clicks > 10 && (
                      <>
                        <div className="absolute top-0 left-1/2 w-0.5 h-full bg-black/50"></div>
                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-black/50"></div>
                      </>
                    )}
                    {/* 50: 반 정도 깨짐 */}
                    {clicks >= 50 && (
                      <>
                        <div className="absolute top-0 left-1/3 w-0.5 h-full bg-black/60 rotate-12"></div>
                        <div className="absolute top-0 right-1/3 w-0.5 h-full bg-black/60 -rotate-12"></div>
                        <div className="absolute top-1/3 left-0 w-full h-0.5 bg-black/60"></div>
                        <div className="absolute inset-2 bg-black/10 rounded"></div>
                      </>
                    )}
                    {/* 100: 80% 깨짐 */}
                    {clicks >= 100 && (
                      <>
                        <div className="absolute top-0 left-1/4 w-1 h-full bg-black/70 rotate-6"></div>
                        <div className="absolute top-0 right-1/4 w-1 h-full bg-black/70 -rotate-6"></div>
                        <div className="absolute top-1/4 left-0 w-full h-1 bg-black/70 rotate-3"></div>
                        <div className="absolute bottom-1/4 left-0 w-full h-1 bg-black/70 -rotate-3"></div>
                        <div className="absolute inset-3 bg-black/20 rounded"></div>
                        {/* 보석 힌트 */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl opacity-50">💎</div>
                      </>
                    )}
                  </div>
                  <div className="absolute inset-4 bg-gradient-to-br from-gray-400 to-gray-500 rounded-sm"></div>
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl pointer-events-none animate-bounce">⛏️</div>
              </div>
            )}
          </div>
          
          <p className="text-muted-foreground text-center">
            {clicks < 50 
              ? "돌을 터치하세요!" 
              : clicks < 100 
              ? "반쯤 왔어요! 계속!" 
              : clicks < TARGET_CLICKS
              ? "거의 다 왔어요! 조금만 더!"
              : "보석 발견! 🎉"
            }
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
              <div className="text-9xl animate-bounce">💎</div>
            ) : (
              <div className="text-7xl">😢</div>
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
                🎁 리워드 받기
              </Button>
            )}
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              size="lg"
              className="text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all"
            >
              🏠 미니게임 홈으로
            </Button>
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

export default GemGame;
