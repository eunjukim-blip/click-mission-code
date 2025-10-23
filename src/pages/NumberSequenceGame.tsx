import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Play, RotateCcw } from "lucide-react";
import { toast } from "sonner";

interface NumberBox {
  number: number;
  position: { x: number; y: number };
  clicked: boolean;
}

const NumberSequenceGame = () => {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<"idle" | "playing" | "finished">("idle");
  const [numbers, setNumbers] = useState<NumberBox[]>([]);
  const [currentNumber, setCurrentNumber] = useState(1);
  const [startTime, setStartTime] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [level, setLevel] = useState(5);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-orange-300 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            className="bg-white/80"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            홈으로
          </Button>
          <h1 className="text-3xl font-bold text-white drop-shadow-lg">
            숫자 순서 게임
          </h1>
          <div className="w-24" />
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
            <div className="relative h-[600px] bg-white/30 rounded-lg border-4 border-white/50">
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
