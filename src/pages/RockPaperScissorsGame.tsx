import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { RewardedVideoAd } from "@/components/ads/RewardedVideoAd";

type GameStage = "intro" | "playing" | "result";
type Choice = "rock" | "paper" | "scissors";

interface Round {
  playerChoice: Choice;
  computerChoice: Choice;
  result: "win" | "lose" | "draw";
}

const CHOICES: Choice[] = ["rock", "paper", "scissors"];
const CHOICE_EMOJI = {
  rock: "✊",
  paper: "✋",
  scissors: "✌️",
};
const CHOICE_NAME = {
  rock: "바위",
  paper: "보",
  scissors: "가위",
};

const determineWinner = (player: Choice, computer: Choice): "win" | "lose" | "draw" => {
  if (player === computer) return "draw";
  if (
    (player === "rock" && computer === "scissors") ||
    (player === "paper" && computer === "rock") ||
    (player === "scissors" && computer === "paper")
  ) {
    return "win";
  }
  return "lose";
};

export default function RockPaperScissorsGame() {
  const navigate = useNavigate();
  const [stage, setStage] = useState<GameStage>("intro");
  const [rounds, setRounds] = useState<Round[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [playerWins, setPlayerWins] = useState(0);
  const [computerWins, setComputerWins] = useState(0);
  const [gameResult, setGameResult] = useState<"win" | "lose" | null>(null);
  const [showAdDialog, setShowAdDialog] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [showingSuspense, setShowingSuspense] = useState(false);
  const [countdown, setCountdown] = useState<string>("");

  const startGame = useCallback(() => {
    setStage("playing");
    setRounds([]);
    setCurrentRound(0);
    setPlayerWins(0);
    setComputerWins(0);
    setGameResult(null);
  }, []);

  const makeChoice = useCallback(
    (playerChoice: Choice) => {
      // 선택 애니메이션 시작
      setIsShaking(true);
      setShowingSuspense(true);
      
      // 카운트다운 효과
      setCountdown("가위!");
      setTimeout(() => setCountdown("바위!"), 600);
      setTimeout(() => setCountdown("보!"), 1200);
      
      const computerChoice = CHOICES[Math.floor(Math.random() * CHOICES.length)];
      const result = determineWinner(playerChoice, computerChoice);

      // 1.8초 후에 결과 공개
      setTimeout(() => {
        setIsShaking(false);
        setCountdown("");
        
        const newRound: Round = { playerChoice, computerChoice, result };
        const newRounds = [...rounds, newRound];
        setRounds(newRounds);

        let newPlayerWins = playerWins;
        let newComputerWins = computerWins;

        if (result === "win") {
          newPlayerWins++;
          setPlayerWins(newPlayerWins);
        } else if (result === "lose") {
          newComputerWins++;
          setComputerWins(newComputerWins);
        }

        const nextRound = currentRound + 1;
        setCurrentRound(nextRound);
        
        setShowingSuspense(false);

        if (newPlayerWins === 2) {
          setGameResult("win");
          setTimeout(() => {
            setStage("result");
            saveResult(newRounds.length, newPlayerWins, newComputerWins, "win");
          }, 1500);
        } else if (newComputerWins === 2) {
          setGameResult("lose");
          setTimeout(() => {
            setStage("result");
            saveResult(newRounds.length, newPlayerWins, newComputerWins, "lose");
          }, 1500);
        }
      }, 1800);
    },
    [rounds, currentRound, playerWins, computerWins]
  );

  const saveResult = async (
    roundsPlayed: number,
    roundsWon: number,
    roundsLost: number,
    result: "win" | "lose"
  ) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      
      if (!user) {
        console.log("User not authenticated");
        return;
      }

      const { error } = await supabase.from("rock_paper_scissors_games").insert({
        user_id: user.id,
        rounds_played: roundsPlayed,
        rounds_won: roundsWon,
        rounds_lost: roundsLost,
        result: result,
      });

      if (error) throw error;
    } catch (error) {
      console.error("Error saving result:", error);
    }
  };

  const retry = useCallback(() => {
    startGame();
    setShowAdDialog(false);
  }, [startGame]);

  const handleRewardClick = () => {
    toast({
      title: "보상 획득!",
      description: "리워드를 받았습니다!",
    });
    navigate("/");
  };

  const handleAdButtonClick = () => {
    setShowAdDialog(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6 flex flex-col">
      <Button
        variant="ghost"
        onClick={() => navigate("/")}
        className="self-start mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        메인으로
      </Button>

      <div className="flex-1 flex items-center justify-center">
        {stage === "intro" && (
          <Card className="p-8 max-w-md w-full text-center space-y-6">
            <div className="text-6xl mb-4">🎮</div>
            <h1 className="text-3xl font-bold">가위바위보 게임</h1>
            <div className="space-y-2 text-left">
              <p className="text-muted-foreground">📋 게임 규칙:</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>3판 2선승제입니다</li>
                <li>2승을 먼저 달성하면 승리!</li>
                <li>승리하면 리워드를 받습니다</li>
                <li>패배하면 광고 시청 후 재도전 가능</li>
              </ul>
            </div>
            <Button onClick={startGame} size="lg" className="w-full">
              게임 시작
            </Button>
          </Card>
        )}

        {stage === "playing" && (
          <div className="max-w-2xl w-full space-y-8">
            <Card className="p-6 text-center">
              <div className="text-2xl font-bold mb-4">
                {playerWins} : {computerWins}
              </div>
              <div className="text-sm text-muted-foreground">
                라운드 {currentRound + 1} (2승 먼저 달성!)
              </div>
            </Card>

            {isShaking && (
              <Card className="p-6 text-center animate-in fade-in duration-300">
                <div className="flex justify-around items-center mb-6">
                  <div className="text-center">
                    <div className="text-6xl mb-2 animate-[shake_0.5s_ease-in-out_infinite]">
                      ✊
                    </div>
                    <p className="text-sm text-muted-foreground">플레이어</p>
                  </div>
                  <div className="text-4xl">VS</div>
                  <div className="text-center">
                    <div className="text-6xl mb-2 animate-[shake_0.5s_ease-in-out_infinite]">
                      ✊
                    </div>
                    <p className="text-sm text-muted-foreground">컴퓨터</p>
                  </div>
                </div>
                <div className="text-3xl font-bold animate-pulse text-primary">
                  {countdown}
                </div>
              </Card>
            )}

            {!isShaking && rounds.length > 0 && (
              <Card className="p-6 text-center animate-in fade-in zoom-in duration-500">
                <div className="flex justify-around items-center mb-4">
                  <div className="text-center">
                    <div className="text-6xl mb-2 animate-in zoom-in duration-300">
                      {CHOICE_EMOJI[rounds[rounds.length - 1].playerChoice]}
                    </div>
                    <p className="text-sm text-muted-foreground">플레이어</p>
                    <p className="font-medium">
                      {CHOICE_NAME[rounds[rounds.length - 1].playerChoice]}
                    </p>
                  </div>
                  <div className="text-4xl">VS</div>
                  <div className="text-center">
                    <div className="text-6xl mb-2 animate-in zoom-in duration-300 delay-100">
                      {CHOICE_EMOJI[rounds[rounds.length - 1].computerChoice]}
                    </div>
                    <p className="text-sm text-muted-foreground">컴퓨터</p>
                    <p className="font-medium">
                      {CHOICE_NAME[rounds[rounds.length - 1].computerChoice]}
                    </p>
                  </div>
                </div>
                <div className="text-xl font-bold animate-in zoom-in duration-300 delay-200">
                  {rounds[rounds.length - 1].result === "win" && "🎉 승리!"}
                  {rounds[rounds.length - 1].result === "lose" && "😢 패배"}
                  {rounds[rounds.length - 1].result === "draw" && "🤝 무승부"}
                </div>
              </Card>
            )}

            {gameResult === null && !showingSuspense && (
              <Card className="p-6">
                <p className="text-center mb-4 font-medium">선택하세요!</p>
                <div className="flex justify-center gap-4">
                  {CHOICES.map((choice) => (
                    <Button
                      key={choice}
                      onClick={() => makeChoice(choice)}
                      size="lg"
                      className="flex flex-col h-auto py-6 px-8 hover:scale-110 transition-transform duration-200"
                      disabled={isShaking}
                    >
                      <span className="text-4xl mb-2">{CHOICE_EMOJI[choice]}</span>
                      <span>{CHOICE_NAME[choice]}</span>
                    </Button>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}

        {stage === "result" && (
          <Card className="p-8 max-w-md w-full text-center space-y-6">
            <div className="text-6xl mb-4">
              {gameResult === "win" ? "🎉" : "😢"}
            </div>
            <h2 className="text-3xl font-bold">
              {gameResult === "win" ? "승리!" : "패배"}
            </h2>
            <div className="space-y-2">
              <p className="text-lg">
                최종 스코어: {playerWins} : {computerWins}
              </p>
              <p className="text-sm text-muted-foreground">
                총 {rounds.length}라운드 진행
              </p>
            </div>

            <div className="space-y-3">
              {gameResult === "win" ? (
                <Button onClick={handleRewardClick} size="lg" className="w-full">
                  리워드 받기 🎁
                </Button>
              ) : (
                <Button onClick={handleAdButtonClick} size="lg" className="w-full">
                  광고 보고 재도전 📺
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => navigate("/")}
                size="lg"
                className="w-full"
              >
                메인으로
              </Button>
            </div>
          </Card>
        )}
      </div>

      <RewardedVideoAd
        isOpen={showAdDialog}
        onClose={() => setShowAdDialog(false)}
        onRewardEarned={retry}
      />
    </div>
  );
}
