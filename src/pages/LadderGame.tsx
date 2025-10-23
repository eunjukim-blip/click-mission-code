import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RewardedVideoAd } from "@/components/ads/RewardedVideoAd";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Gift } from "lucide-react";

interface LadderOption {
  id: number;
  reward: number;
  color: string;
}

const ladderOptions: LadderOption[] = [
  { id: 1, reward: 50, color: "from-blue-500 to-blue-600" },
  { id: 2, reward: 100, color: "from-purple-500 to-purple-600" },
  { id: 3, reward: 150, color: "from-pink-500 to-pink-600" },
  { id: 4, reward: 200, color: "from-orange-500 to-orange-600" },
  { id: 5, reward: 300, color: "from-green-500 to-green-600" },
];

// 사다리 경로 생성 (각 시작점에서 끝점까지의 경로)
const generateLadderPaths = () => {
  const paths: number[][] = [
    [0, 0, 1, 1, 2, 2, 3, 3, 4], // 1 -> 5
    [1, 0, 0, 1, 1, 2, 2, 3, 3], // 2 -> 4
    [2, 2, 2, 1, 1, 1, 2, 2, 2], // 3 -> 3
    [3, 3, 4, 4, 3, 3, 4, 4, 1], // 4 -> 2
    [4, 4, 3, 3, 4, 4, 1, 1, 0], // 5 -> 1
  ];
  return paths;
};

// 가로 연결선 정보 (level, from, to)
const horizontalBars = [
  { level: 1, from: 0, to: 1 },
  { level: 2, from: 1, to: 2 },
  { level: 3, from: 0, to: 1 },
  { level: 4, from: 2, to: 3 },
  { level: 5, from: 1, to: 2 },
  { level: 6, from: 3, to: 4 },
  { level: 7, from: 2, to: 3 },
  { level: 8, from: 4, to: 3 },
  { level: 8, from: 1, to: 0 },
];

export default function LadderGame() {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showAdDialog, setShowAdDialog] = useState(false);
  const [gameResult, setGameResult] = useState<LadderOption | null>(null);
  const [animatingPath, setAnimatingPath] = useState<number[]>([]);
  const [currentPathIndex, setCurrentPathIndex] = useState(0);
  const ladderPaths = generateLadderPaths();

  const handleOptionSelect = (optionId: number) => {
    if (showResult) return;
    setSelectedOption(optionId);
  };

  const handleStartGame = () => {
    if (selectedOption === null) {
      toast({
        title: "선택 필요",
        description: "하나의 사다리를 선택해주세요!",
        variant: "destructive",
      });
      return;
    }
    
    // 광고 다이얼로그 표시
    setShowAdDialog(true);
  };

  const handleRewardEarned = () => {
    if (selectedOption === null) return;
    
    setShowAdDialog(false);
    
    // 선택한 경로로 애니메이션 시작
    const path = ladderPaths[selectedOption - 1];
    setAnimatingPath(path);
    setCurrentPathIndex(0);
  };

  // 경로 애니메이션
  useEffect(() => {
    if (animatingPath.length === 0) return;
    
    if (currentPathIndex < animatingPath.length - 1) {
      const timer = setTimeout(() => {
        setCurrentPathIndex(currentPathIndex + 1);
      }, 200);
      return () => clearTimeout(timer);
    } else {
      // 애니메이션 완료 후 결과 표시
      const finalPosition = animatingPath[animatingPath.length - 1];
      const result = ladderOptions[finalPosition];
      
      setTimeout(() => {
        setGameResult(result);
        setShowResult(true);
        
        toast({
          title: "축하합니다! 🎉",
          description: `${result.reward} 포인트를 획득했습니다!`,
        });
      }, 500);
    }
  }, [currentPathIndex, animatingPath]);

  const handleReset = () => {
    setSelectedOption(null);
    setShowResult(false);
    setGameResult(null);
    setAnimatingPath([]);
    setCurrentPathIndex(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20 p-2 md:p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-2">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl md:text-3xl font-bold text-foreground">사다리 게임</h1>
          </div>
        </div>

        {/* Game Description */}
        <Card className="p-4 mb-6 bg-card/50 backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <Gift className="h-6 w-6 text-primary shrink-0 mt-1" />
            <div>
              <h2 className="font-bold text-lg mb-2">게임 방법</h2>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 5개의 사다리 중 하나를 선택하세요</li>
                <li>• 광고 시청 후 결과가 공개됩니다</li>
                <li>• 선택한 사다리의 보상을 획득할 수 있습니다</li>
                <li>• 보상: 50P ~ 300P</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Ladder Visualization */}
        <Card className="p-4 mb-6 bg-card/50 backdrop-blur-sm">
          <div className="relative">
            {/* 상단 시작점 선택 */}
            <div className="flex justify-around mb-4">
              {ladderOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleOptionSelect(option.id)}
                  disabled={showResult || animatingPath.length > 0}
                  className={`
                    w-12 h-12 md:w-16 md:h-16 rounded-full font-bold text-white
                    transition-all duration-300 flex items-center justify-center
                    ${selectedOption === option.id ? 'ring-4 ring-primary scale-110' : 'hover:scale-105'}
                    ${showResult || animatingPath.length > 0 ? 'cursor-default' : 'cursor-pointer'}
                    bg-gradient-to-br ${option.color}
                  `}
                >
                  {option.id}
                </button>
              ))}
            </div>

            {/* 사다리 그리기 */}
            <svg className="w-full h-[400px] md:h-[500px]" viewBox="0 0 500 500">
              {/* 세로 줄 */}
              {[0, 1, 2, 3, 4].map((i) => (
                <line
                  key={`v-${i}`}
                  x1={50 + i * 100}
                  y1={20}
                  x2={50 + i * 100}
                  y2={480}
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth="3"
                  opacity="0.3"
                />
              ))}

              {/* 가로 연결선 */}
              {horizontalBars.map((bar, idx) => (
                <line
                  key={`h-${idx}`}
                  x1={50 + bar.from * 100}
                  y1={20 + bar.level * 50}
                  x2={50 + bar.to * 100}
                  y2={20 + bar.level * 50}
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth="3"
                  opacity="0.3"
                />
              ))}

              {/* 애니메이션 경로 */}
              {animatingPath.length > 0 && (
                <>
                  {animatingPath.slice(0, currentPathIndex + 1).map((pos, idx) => {
                    if (idx === 0) return null;
                    const prevPos = animatingPath[idx - 1];
                    return (
                      <line
                        key={`path-${idx}`}
                        x1={50 + prevPos * 100}
                        y1={20 + (idx - 1) * 50}
                        x2={50 + pos * 100}
                        y2={20 + idx * 50}
                        stroke="hsl(var(--primary))"
                        strokeWidth="6"
                        strokeLinecap="round"
                      />
                    );
                  })}
                  {/* 현재 위치 마커 */}
                  <circle
                    cx={50 + animatingPath[currentPathIndex] * 100}
                    cy={20 + currentPathIndex * 50}
                    r="8"
                    fill="hsl(var(--primary))"
                    className="animate-pulse"
                  />
                </>
              )}
            </svg>

            {/* 하단 보상 표시 */}
            <div className="flex justify-around mt-4">
              {ladderOptions.map((option, idx) => (
                <div
                  key={option.id}
                  className={`
                    w-12 h-12 md:w-16 md:h-16 rounded-lg font-bold text-white
                    flex flex-col items-center justify-center text-xs md:text-sm
                    bg-gradient-to-br ${option.color}
                    ${showResult && gameResult?.reward === option.reward ? 'ring-4 ring-primary scale-110' : ''}
                    transition-all duration-300
                  `}
                >
                  {showResult ? (
                    <>
                      <div className="text-lg md:text-xl">{option.reward}</div>
                      <div className="text-[8px] md:text-xs">P</div>
                    </>
                  ) : (
                    <div className="text-2xl">?</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Result Display */}
        {showResult && gameResult && (
          <Card className="p-6 mb-6 bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-primary">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-2">결과</h3>
              <div className="text-4xl font-bold text-primary mb-2">
                {gameResult.reward} 포인트
              </div>
              <p className="text-muted-foreground">
                사다리 {gameResult.id}번을 선택하셨습니다!
              </p>
            </div>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          {!showResult ? (
            <Button
              onClick={handleStartGame}
              disabled={selectedOption === null}
              className="w-full text-lg py-6"
              size="lg"
            >
              광고 보고 결과 확인하기
            </Button>
          ) : (
            <Button
              onClick={handleReset}
              className="w-full text-lg py-6"
              size="lg"
              variant="outline"
            >
              다시 하기
            </Button>
          )}
        </div>
      </div>

      {/* Ad Dialog */}
      <RewardedVideoAd
        isOpen={showAdDialog}
        onClose={() => setShowAdDialog(false)}
        onRewardEarned={handleRewardEarned}
      />
    </div>
  );
}
