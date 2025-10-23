import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Play, RotateCcw, Trophy, Gift } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface NumberBox {
  number: number;
  position: { x: number; y: number };
  clicked: boolean;
}

interface RankingEntry {
  id: string;
  level: number;
  time_taken: number;
  created_at: string;
}

interface RewardEntry {
  id: string;
  ranking_date: string;
  rank: number;
  level: number;
  time_taken: number;
  reward_amount: number;
}

const NumberSequenceGame = () => {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<"idle" | "playing" | "finished">("idle");
  const [numbers, setNumbers] = useState<NumberBox[]>([]);
  const [currentNumber, setCurrentNumber] = useState(1);
  const [startTime, setStartTime] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [level, setLevel] = useState(5);
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [showRankings, setShowRankings] = useState(false);
  const [rankingLevel, setRankingLevel] = useState(5);
  const [myRewards, setMyRewards] = useState<RewardEntry[]>([]);
  const [showRewards, setShowRewards] = useState(false);

  const generateNumbers = () => {
    const newNumbers: NumberBox[] = [];
    for (let i = 1; i <= level; i++) {
      newNumbers.push({
        number: i,
        position: {
          x: Math.random() * 80 + 5,
          y: Math.random() * 70 + 10,
        },
        clicked: false,
      });
    }
    setNumbers(newNumbers);
  };

  const startGame = () => {
    generateNumbers();
    setCurrentNumber(1);
    setGameState("playing");
    setStartTime(Date.now());
  };

  const saveResult = async (timeTaken: number, completed: boolean) => {
    if (!completed) return;

    try {
      await supabase.from("number_sequence_results").insert({
        level,
        time_taken: timeTaken,
      });
    } catch (error) {
      console.error("Error saving result:", error);
    }
  };

  const fetchRankings = async (selectedLevel: number) => {
    try {
      const { data, error } = await supabase
        .from("number_sequence_results")
        .select("*")
        .eq("level", selectedLevel)
        .order("time_taken", { ascending: true })
        .limit(10);

      if (error) throw error;
      setRankings(data || []);
    } catch (error) {
      console.error("Error fetching rankings:", error);
      toast.error("랭킹을 불러올 수 없습니다");
    }
  };

  const fetchMyRewards = async () => {
    try {
      const userIdentifier = localStorage.getItem("userIdentifier") || "anonymous";
      const { data, error } = await supabase
        .from("daily_ranking_rewards")
        .select("*")
        .eq("user_identifier", userIdentifier)
        .order("ranking_date", { ascending: false });

      if (error) throw error;
      setMyRewards(data || []);
    } catch (error) {
      console.error("Error fetching rewards:", error);
      toast.error("리워드를 불러올 수 없습니다");
    }
  };

  const handleNumberClick = (number: number) => {
    if (gameState !== "playing") return;

    if (number === currentNumber) {
      setNumbers((prev) =>
        prev.map((n) => (n.number === number ? { ...n, clicked: true } : n))
      );

      if (number === level) {
        const timeTaken = Math.floor((Date.now() - startTime) / 1000);
        setElapsedTime(timeTaken);
        setGameState("finished");
        saveResult(timeTaken, true);
        toast.success(`완료! ${timeTaken}초 걸렸습니다!`);
      } else {
        setCurrentNumber((prev) => prev + 1);
      }
    } else {
      toast.error("순서가 틀렸습니다!");
      setGameState("finished");
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }
  };

  const resetGame = () => {
    setGameState("idle");
    setCurrentNumber(1);
    setElapsedTime(0);
  };

  useEffect(() => {
    if (showRankings) {
      fetchRankings(rankingLevel);
    }
  }, [showRankings, rankingLevel]);

  useEffect(() => {
    if (showRewards) {
      fetchMyRewards();
    }
  }, [showRewards]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-orange-300 p-2 md:p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-2 md:gap-4 mb-4">
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            className="bg-white/80 w-full md:w-auto text-sm md:text-base"
            size="sm"
          >
            <ArrowLeft className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
            홈으로
          </Button>
          <h1 className="text-xl md:text-3xl font-bold text-white drop-shadow-lg">
            숫자 순서 게임
          </h1>
          <div className="flex gap-2 w-full md:w-auto">
            <Dialog open={showRankings} onOpenChange={setShowRankings}>
              <DialogTrigger asChild>
                <Button variant="outline" className="bg-white/80 flex-1 md:flex-none text-sm md:text-base" size="sm">
                  <Trophy className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                  랭킹
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>랭킹 TOP 10</DialogTitle>
              </DialogHeader>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  난이도 선택
                </label>
                <select
                  value={rankingLevel}
                  onChange={(e) => setRankingLevel(Number(e.target.value))}
                  className="w-full p-2 border rounded"
                >
                  {[5, 8, 10, 12, 15, 20].map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl}개
                    </option>
                  ))}
                </select>
              </div>
              <ScrollArea className="h-96">
                {rankings.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    아직 기록이 없습니다
                  </p>
                ) : (
                  <div className="space-y-2">
                    {rankings.map((entry, index) => (
                      <Card key={entry.id} className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span
                              className={`text-lg font-bold ${
                                index === 0
                                  ? "text-yellow-500"
                                  : index === 1
                                  ? "text-gray-400"
                                  : index === 2
                                  ? "text-amber-600"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {index + 1}위
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">
                              {entry.time_taken}초
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(entry.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </DialogContent>
          </Dialog>

          <Dialog open={showRewards} onOpenChange={setShowRewards}>
            <DialogTrigger asChild>
              <Button variant="outline" className="bg-white/80 flex-1 md:flex-none text-sm md:text-base" size="sm">
                <Gift className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                내 리워드
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>내 리워드 내역</DialogTitle>
              </DialogHeader>
              <ScrollArea className="h-96">
                {myRewards.length === 0 ? (
                  <div className="text-center py-8 space-y-2">
                    <p className="text-muted-foreground">
                      아직 받은 리워드가 없습니다
                    </p>
                    <p className="text-sm text-muted-foreground">
                      매일 레벨별 상위 5명에게 리워드를 지급합니다!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {myRewards.map((reward) => (
                      <Card key={reward.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={reward.rank === 1 ? "default" : "secondary"}
                              >
                                {reward.rank}위
                              </Badge>
                              <span className="text-sm font-medium">
                                레벨 {reward.level}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {reward.ranking_date} 달성
                            </p>
                            <p className="text-xs text-muted-foreground">
                              기록: {reward.time_taken}초
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-primary">
                              {reward.reward_amount.toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground">포인트</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </div>
        </div>

        {gameState === "idle" && (
          <Card className="p-8 text-center max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-4">게임 방법</h2>
            <p className="text-muted-foreground mb-6">
              화면에 나타나는 숫자를 1부터 순서대로 클릭하세요!
              <br />
              빠르게 완료할수록 좋은 점수입니다.
            </p>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                난이도 (숫자 개수: {level})
              </label>
              <input
                type="range"
                min="5"
                max="20"
                value={level}
                onChange={(e) => setLevel(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <Button onClick={startGame} size="lg" className="w-full">
              <Play className="mr-2 h-5 w-5" />
              게임 시작
            </Button>
          </Card>
        )}

        {gameState === "playing" && (
          <div className="relative">
            <Card className="p-4 mb-4 text-center">
              <p className="text-xl font-bold">
                다음 숫자: <span className="text-primary text-3xl">{currentNumber}</span>
              </p>
            </Card>
            <div className="relative h-[400px] md:h-[500px] bg-white/30 rounded-lg border-4 border-white/50">
              {numbers.map((num) => (
                <button
                  key={num.number}
                  onClick={() => handleNumberClick(num.number)}
                  disabled={num.clicked}
                  className={`absolute w-16 h-16 rounded-full text-2xl font-bold transition-all transform hover:scale-110 ${
                    num.clicked
                      ? "bg-green-500 text-white cursor-not-allowed opacity-50"
                      : "bg-white text-gray-800 shadow-lg hover:shadow-xl"
                  }`}
                  style={{
                    left: `${num.position.x}%`,
                    top: `${num.position.y}%`,
                  }}
                >
                  {num.number}
                </button>
              ))}
            </div>
          </div>
        )}

        {gameState === "finished" && (
          <Card className="p-8 text-center max-w-md mx-auto">
            <h2 className="text-3xl font-bold mb-4">
              {currentNumber > level ? "완료!" : "게임 오버"}
            </h2>
            <p className="text-xl mb-2">소요 시간: {elapsedTime}초</p>
            <p className="text-muted-foreground mb-6">
              {currentNumber > level
                ? `${level}개의 숫자를 모두 클릭했습니다!`
                : `${currentNumber - 1}개까지 클릭했습니다.`}
            </p>
            <div className="flex gap-4">
              <Button onClick={startGame} className="flex-1">
                <Play className="mr-2 h-4 w-4" />
                다시 하기
              </Button>
              <Button onClick={resetGame} variant="outline" className="flex-1">
                <RotateCcw className="mr-2 h-4 w-4" />
                처음으로
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default NumberSequenceGame;
