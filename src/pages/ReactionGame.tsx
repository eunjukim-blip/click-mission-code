import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { GameCard } from "@/components/GameCard";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type GameStage = "intro" | "waiting" | "ready" | "result";
type GameColor = "blue" | "red" | "green" | "gray";

const ReactionGame = () => {
  const navigate = useNavigate();
  const [stage, setStage] = useState<GameStage>("intro");
  const [gameColor, setGameColor] = useState<GameColor>("blue");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [resultMessage, setResultMessage] = useState("");
  const [reactionHistory, setReactionHistory] = useState<number[]>(() => {
    const saved = localStorage.getItem("reactionHistory");
    return saved ? JSON.parse(saved) : [];
  });

  const averageReactionTime = useMemo(() => {
    if (reactionHistory.length === 0) return null;
    const sum = reactionHistory.reduce((acc, time) => acc + time, 0);
    return sum / reactionHistory.length;
  }, [reactionHistory]);

  const startGame = useCallback(() => {
    setStage("waiting");
    setGameColor("green");
    setReactionTime(null);
    setStartTime(null);

    // Random delay between 2-5 seconds
    const delay = Math.random() * 3000 + 2000;
  
    setTimeout(() => {
      setGameColor("gray");
      setStage("ready");
    }, delay);
  }, []);

  const handleRedVisible = useCallback(() => {
    setStartTime(Date.now());
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
      setGameColor("gray");
      
      // 데이터베이스에 저장
      supabase
        .from('reaction_game_results')
        .insert({ reaction_time: time })
        .then(({ error }) => {
          if (error) console.error('Failed to save result:', error);
        });
      
      // 로컬 히스토리에도 저장
      const newHistory = [...reactionHistory, time];
      setReactionHistory(newHistory);
      localStorage.setItem("reactionHistory", JSON.stringify(newHistory));
      
      const timeInSeconds = (time / 1000).toFixed(2);
      if (time <= 300) {
        setResultMessage(`${timeInSeconds}초 - 리워드를 받을 수 있어요! 🎁`);
        // 오늘 리워드 받음 표시
        localStorage.setItem("reactionRewardDate", new Date().toDateString());
      } else {
        setResultMessage(`반응속도: ${timeInSeconds}초 🎯`);
      }
    }
  }, [stage, startTime, reactionHistory]);

  const retry = useCallback(() => {
    setStage("intro");
    setGameColor("green");
    setStartTime(null);
    setReactionTime(null);
    setResultMessage("");
  }, []);

  const handleRewardClick = useCallback(() => {
    toast.success("축하합니다! 🎁", {
      description: "리워드가 지급되었습니다!",
      duration: 3000,
    });
  }, []);


  // Auto-fail if no tap within 5 seconds after ready
  useEffect(() => {
    if (stage === "ready") {
      const timeout = setTimeout(() => {
        setStage("result");
        setGameColor("gray");
        setResultMessage("시간 초과! ⏰");
        setReactionTime(null);
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, [stage]);

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
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 flex flex-col items-center justify-center p-4 pt-20 gap-8">
      <Button
        onClick={() => navigate("/")}
        variant="ghost"
        className="fixed top-4 left-4 z-50"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        메뉴로
      </Button>

      {/* Intro Screen */}
      {stage === "intro" && (
        <div className="flex flex-col items-center gap-6 animate-in fade-in duration-500">
          <h1 className="text-3xl md:text-4xl font-black text-foreground mb-2 text-center">
            캐릭터 반응 게임 🎨
          </h1>
          <div className="text-center">
            <p className="text-lg text-muted-foreground mb-2">
              개구리가 고양이로 바뀔 때 터치하세요!
            </p>
            <p className="text-lg text-primary font-semibold">
              ⚡ 0.3초 보다 빠르면 리워드 적립!
            </p>
          </div>
          <div className="relative">
            <h2 className="text-2xl font-bold text-foreground mb-4 text-center">
              준비하세요!
            </h2>
            <GameCard color="green" />
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
      {(stage === "waiting" || stage === "ready") && (
        <div className="flex flex-col items-center gap-6 animate-in fade-in duration-300">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              {stage === "waiting" ? "기다려요..." : ""}
            </h2>
            <p className="text-lg text-muted-foreground">
              캐릭터가 고양이로 바뀔 때 터치하세요
            </p>
          </div>
          <GameCard color={gameColor} onClick={handleTap} onRedVisible={handleRedVisible}>
            {gameColor === "gray" ? "터치" : ""}
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
              🎬 광고 보고 다시하기
            </Button>
            {reactionTime !== null && reactionTime <= 300 && (
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
            {reactionTime !== null && (
              <>
                <p className="text-center text-muted-foreground text-sm">
                  {reactionTime <= 300
                    ? "🏆 최고의 반응속도! 리워드 획득!"
                    : reactionTime < 400
                    ? "조금만 더 빨리! (리워드는 0.3초 이하)"
                    : reactionTime < 500
                    ? "훌륭해요! 👏"
                    : reactionTime < 700
                    ? "잘했어요! 😊"
                    : "다음엔 더 빠르게! 💪"}
                </p>
                {averageReactionTime && (
                  <p className="text-center text-muted-foreground text-sm mt-2">
                    대체로 평균으로 {(averageReactionTime / 1000).toFixed(2)}초를 하고있어요
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default ReactionGame;
