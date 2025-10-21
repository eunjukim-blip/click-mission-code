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

  const initializeGame = useCallback(() => {
    const colors: CardColor[] = ["blue", "red", "green", "gray", "yellow", "pink", "orange", "purple"];
    const shuffled = [...colors, ...colors]
      .sort(() => Math.random() - 0.5)
      .map((color, index) => ({
        id: index,
        color,
        isFlipped: false,
        isMatched: false,
      }));
    
    setCards(shuffled);
    setFlippedCards([]);
    setAttempts(0);
    setMatchedPairs(0);
    setStartTime(null);
    setIsChecking(false);
    setGameStarted(false);
  }, []);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  const handleCardClick = useCallback((cardId: number) => {
    if (!gameStarted) {
      setGameStarted(true);
      setStartTime(Date.now());
    }

    if (isChecking || flippedCards.length >= 2) return;
    
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
        // 매칭 성공
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.id === firstId || c.id === secondId ? { ...c, isMatched: true } : c
          ));
          setMatchedPairs(prev => prev + 1);
          setFlippedCards([]);
          setIsChecking(false);
        }, 500);
      } else {
        // 매칭 실패
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.id === firstId || c.id === secondId ? { ...c, isFlipped: false } : c
          ));
          setFlippedCards([]);
          setIsChecking(false);
        }, 1000);
      }
    }
  }, [cards, flippedCards, isChecking, gameStarted]);

  useEffect(() => {
    if (matchedPairs === 8 && startTime) {
      const timeTaken = Math.floor((Date.now() - startTime) / 1000);
      const success = attempts <= 15;

      // 데이터베이스에 저장
      supabase
        .from("memory_game_results")
        .insert({
          attempts,
          time_taken: timeTaken,
          success,
        })
        .then(() => {
          if (success) {
            localStorage.setItem("memoryRewardDate", new Date().toDateString());
            toast.success("🎁 리워드 적립 완료!");
          }
        });
    }
  }, [matchedPairs, attempts, startTime]);

  const isGameComplete = matchedPairs === 8;
  const gotReward = attempts <= 15 && isGameComplete;

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
            같은 색상의 카드를 찾아보세요!
          </p>
          <div className="flex justify-center gap-6 text-lg">
            <span className="font-semibold">시도: {attempts}회</span>
            <span className="font-semibold">매칭: {matchedPairs}/8</span>
          </div>
          <p className="text-sm text-primary font-semibold mt-2">
            ⚡ 15회 이하 시도로 완료하면 리워드 적립!
          </p>
        </div>

        {!isGameComplete ? (
          <div className="grid grid-cols-4 gap-4 max-w-2xl mx-auto">
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
        ) : (
          <div className="text-center space-y-6">
            <div className="text-6xl mb-4">
              {gotReward ? "🎉" : "✨"}
            </div>
            <h2 className="text-3xl font-bold text-foreground">
              게임 완료!
            </h2>
            <div className="space-y-2">
              <p className="text-xl text-muted-foreground">
                총 {attempts}회 시도
              </p>
              {gotReward ? (
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
              <Button onClick={initializeGame} size="lg">
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
