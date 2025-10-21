import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import blueCharacter from "@/assets/character-blue.png";
import redCharacter from "@/assets/character-red.png";
import greenCharacter from "@/assets/character-green.png";
import grayCharacter from "@/assets/character-gray.png";
import yellowCharacter from "@/assets/character-yellow.png";
import pinkCharacter from "@/assets/character-pink.png";
import orangeCharacter from "@/assets/character-orange.png";
import purpleCharacter from "@/assets/character-purple.png";

type CardColor = "blue" | "red" | "green" | "gray" | "yellow" | "pink" | "orange" | "purple";

interface Card {
  id: number;
  color: CardColor;
  isFlipped: boolean;
  isMatched: boolean;
}

const characterMap = {
  blue: blueCharacter,
  red: redCharacter,
  green: greenCharacter,
  gray: grayCharacter,
  yellow: yellowCharacter,
  pink: pinkCharacter,
  orange: orangeCharacter,
  purple: purpleCharacter,
};

const MemoryGame = () => {
  const navigate = useNavigate();
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(30);
  const [roundComplete, setRoundComplete] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const roundConfigs = [
    { round: 1, pairs: 2, gridCols: 2 }, // 4개 카드
    { round: 2, pairs: 4, gridCols: 4 }, // 8개 카드
    { round: 3, pairs: 8, gridCols: 4 }, // 16개 카드
  ];

  const currentConfig = roundConfigs[currentRound - 1];

  const initializeRound = useCallback((round: number) => {
    const config = roundConfigs[round - 1];
    const allColors: CardColor[] = ["blue", "red", "green", "gray", "yellow", "pink", "orange", "purple"];
    const selectedColors = allColors.slice(0, config.pairs);
    const shuffled = [...selectedColors, ...selectedColors]
      .sort(() => Math.random() - 0.5)
      .map((color, index) => ({
        id: index,
        color,
        isFlipped: false,
        isMatched: false,
      }));
    
    setCards(shuffled);
    setFlippedCards([]);
    setMatchedPairs(0);
    setStartTime(Date.now());
    setIsChecking(false);
    setGameStarted(true);
    setTimeLeft(30);
    setRoundComplete(false);
  }, []);

  const resetGame = useCallback(() => {
    setCurrentRound(1);
    setAttempts(0);
    setGameOver(false);
    initializeRound(1);
  }, [initializeRound]);

  useEffect(() => {
    initializeRound(1);
  }, [initializeRound]);

  // 타이머 관리
  useEffect(() => {
    if (!gameStarted || roundComplete || gameOver) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameOver(true);
          toast.error("⏰ 시간 초과! 게임 오버");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, roundComplete, gameOver]);

  const handleCardClick = useCallback((cardId: number) => {
    if (isChecking || flippedCards.length >= 2 || roundComplete || gameOver) return;
    
    // CPC 광고 플레이스홀더 (실제 광고 SDK 연동 필요)
    console.log("CPC 광고 노출 기회");
    
    const card = cards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    setCards(prev => prev.map(c => 
      c.id === cardId ? { ...c, isFlipped: true } : c
    ));

    if (newFlippedCards.length === 2) {
      setIsChecking(true);
      setAttempts(prev => prev + 1);

      const [firstId, secondId] = newFlippedCards;
      const firstCard = cards.find(c => c.id === firstId);
      const secondCard = cards.find(c => c.id === secondId);

      if (firstCard?.color === secondCard?.color) {
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.id === firstId || c.id === secondId ? { ...c, isMatched: true } : c
          ));
          setMatchedPairs(prev => prev + 1);
          setFlippedCards([]);
          setIsChecking(false);
        }, 500);
      } else {
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.id === firstId || c.id === secondId ? { ...c, isFlipped: false } : c
          ));
          setFlippedCards([]);
          setIsChecking(false);
        }, 1000);
      }
    }
  }, [cards, flippedCards, isChecking, roundComplete, gameOver]);

  // 라운드 완료 체크
  useEffect(() => {
    if (matchedPairs === currentConfig.pairs && !roundComplete && !gameOver) {
      setRoundComplete(true);
      
      if (currentRound === 3) {
        // 최종 라운드 완료
        const success = attempts <= 15;
        supabase
          .from("memory_game_results")
          .insert({
            attempts,
            time_taken: 30 - timeLeft,
            success,
          })
          .then(() => {
            if (success) {
              localStorage.setItem("memoryRewardDate", new Date().toDateString());
              toast.success("🎉 전체 게임 완료! 리워드 적립!");
            } else {
              toast.success("🎉 전체 게임 완료!");
            }
          });
      } else {
        toast.success(`🎉 라운드 ${currentRound} 완료!`);
      }
    }
  }, [matchedPairs, currentConfig.pairs, roundComplete, gameOver, currentRound, attempts, timeLeft]);

  const handleNextRound = () => {
    // RV 광고 플레이스홀더 (실제 광고 SDK 연동 필요)
    console.log("RV 광고 재생 필요");
    toast.info("광고 시청 후 다음 라운드로 진행됩니다");
    
    // 광고 시청 시뮬레이션 후 다음 라운드로
    setTimeout(() => {
      setCurrentRound(prev => prev + 1);
      initializeRound(currentRound + 1);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          홈으로
        </Button>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            🧠 기억력 게임
          </h1>
          <p className="text-lg text-muted-foreground mb-4">
            라운드 {currentRound}/3 - 같은 캐릭터를 찾아보세요!
          </p>
          <div className="flex justify-center gap-6 text-lg">
            <span className="font-semibold">시도: {attempts}회</span>
            <span className="font-semibold">매칭: {matchedPairs}/{currentConfig.pairs}</span>
            <span className={`font-semibold ${timeLeft <= 10 ? 'text-destructive animate-pulse' : ''}`}>
              ⏱️ {timeLeft}초
            </span>
          </div>
          <p className="text-sm text-primary font-semibold mt-2">
            ⚡ 30초 안에 완료하세요! (전체 15회 이하로 완료하면 리워드!)
          </p>
        </div>

        {!gameOver && !roundComplete ? (
          <div className={`grid gap-4 max-w-2xl mx-auto`} style={{ gridTemplateColumns: `repeat(${currentConfig.gridCols}, minmax(0, 1fr))` }}>
            {cards.map((card) => (
              <div
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                className={`
                  aspect-square rounded-xl cursor-pointer transition-all duration-300
                  ${card.isFlipped || card.isMatched 
                    ? 'bg-white dark:bg-gray-800 scale-100' 
                    : 'bg-gray-300 dark:bg-gray-700 hover:scale-105'
                  }
                  ${card.isMatched ? 'opacity-60' : ''}
                  shadow-lg overflow-hidden flex items-center justify-center p-2
                `}
              >
                {(card.isFlipped || card.isMatched) && (
                  <img 
                    src={characterMap[card.color]} 
                    alt={card.color}
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
            ))}
          </div>
        ) : roundComplete && currentRound < 3 ? (
          <div className="text-center space-y-6">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-foreground">
              라운드 {currentRound} 완료!
            </h2>
            <p className="text-xl text-muted-foreground">
              다음 라운드로 진행하시겠습니까?
            </p>
            <Button onClick={handleNextRound} size="lg">
              광고 보고 다음 라운드 시작
            </Button>
          </div>
        ) : gameOver ? (
          <div className="text-center space-y-6">
            <div className="text-6xl mb-4">😢</div>
            <h2 className="text-3xl font-bold text-foreground">
              게임 오버
            </h2>
            <p className="text-xl text-muted-foreground">
              시간 내에 완료하지 못했습니다
            </p>
            <Button onClick={resetGame} size="lg">
              다시 시작
            </Button>
          </div>
        ) : (
          <div className="text-center space-y-6">
            <div className="text-6xl mb-4">
              {attempts <= 15 ? "🎉" : "✨"}
            </div>
            <h2 className="text-3xl font-bold text-foreground">
              전체 게임 완료!
            </h2>
            <div className="space-y-2">
              <p className="text-xl text-muted-foreground">
                총 {attempts}회 시도
              </p>
              {attempts <= 15 ? (
                <p className="text-xl text-primary font-bold">
                  🎁 리워드 적립 완료!
                </p>
              ) : (
                <p className="text-lg text-muted-foreground">
                  15회 이하로 도전해보세요!
                </p>
              )}
            </div>
            <div className="flex gap-4 justify-center">
              <Button onClick={resetGame} size="lg">
                다시 하기
              </Button>
              <Button onClick={() => navigate("/")} variant="outline" size="lg">
                홈으로
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemoryGame;
