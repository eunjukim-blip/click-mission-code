import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RewardedVideoAd } from "@/components/ads/RewardedVideoAd";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Gift } from "lucide-react";

interface LadderOption {
  id: number;
  label: string;
  color: string;
}

const ladderOptions: LadderOption[] = [
  { id: 1, label: "A", color: "from-pink-500 to-pink-600" },
  { id: 2, label: "B", color: "from-purple-500 to-purple-600" },
  { id: 3, label: "C", color: "from-blue-500 to-blue-600" },
  { id: 4, label: "D", color: "from-green-500 to-green-600" },
  { id: 5, label: "E", color: "from-orange-500 to-orange-600" },
];

const LEVELS = 12; // 사다리 레벨 수
const LANE_COUNT = 5; // 사다리 라인 수

// 랜덤 보상 생성 (50P ~ 300P)
const generateRandomRewards = () => {
  const rewards = [50, 100, 150, 200, 300];
  // Fisher-Yates 셔플 알고리즘으로 랜덤 섞기
  for (let i = rewards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rewards[i], rewards[j]] = [rewards[j], rewards[i]];
  }
  return rewards;
};

// 랜덤 사다리 경로 생성
const generateRandomLadder = () => {
  // 가로 연결선 생성 (랜덤)
  const bars: { level: number; from: number; to: number }[] = [];
  
  for (let level = 1; level <= LEVELS; level++) {
    // 각 레벨에서 1-2개의 가로줄을 생성
    const barCount = Math.floor(Math.random() * 2) + 1;
    const usedPositions = new Set<number>();
    
    for (let i = 0; i < barCount; i++) {
      // 겹치지 않는 위치 찾기
      let from: number;
      do {
        from = Math.floor(Math.random() * (LANE_COUNT - 1));
      } while (usedPositions.has(from) || usedPositions.has(from + 1));
      
      usedPositions.add(from);
      usedPositions.add(from + 1);
      
      bars.push({ level, from, to: from + 1 });
    }
  }
  
  // 각 시작점에서의 경로 계산
  const paths: number[][] = [];
  
  for (let start = 0; start < LANE_COUNT; start++) {
    const path: number[] = [start];
    let currentPos = start;
    
    for (let level = 1; level <= LEVELS; level++) {
      // 현재 레벨에서 이동 가능한 가로줄 찾기
      const leftBar = bars.find(b => b.level === level && b.to === currentPos);
      const rightBar = bars.find(b => b.level === level && b.from === currentPos);
      
      if (leftBar) {
        currentPos = leftBar.from;
      } else if (rightBar) {
        currentPos = rightBar.to;
      }
      
      path.push(currentPos);
    }
    
    paths.push(path);
  }
  
  return { paths, bars };
};

export default function LadderGame() {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showAdDialog, setShowAdDialog] = useState(false);
  const [gameResult, setGameResult] = useState<{ reward: number; path: number[] } | null>(null);
  const [animatingPath, setAnimatingPath] = useState<number[]>([]);
  const [currentPathIndex, setCurrentPathIndex] = useState(0);
  const [ladderData, setLadderData] = useState(() => generateRandomLadder());
  const [rewards, setRewards] = useState(() => generateRandomRewards());

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
    const path = ladderData.paths[selectedOption - 1];
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
      const reward = rewards[finalPosition];
      
      setTimeout(() => {
        setGameResult({ reward, path: animatingPath });
        setShowResult(true);
        
        toast({
          title: "축하합니다! 🎉",
          description: `${reward} 포인트를 획득했습니다!`,
        });
      }, 500);
    }
  }, [currentPathIndex, animatingPath, rewards]);

  const handleReset = () => {
    setSelectedOption(null);
    setShowResult(false);
    setGameResult(null);
    setAnimatingPath([]);
    setCurrentPathIndex(0);
    setLadderData(generateRandomLadder()); // 새로운 랜덤 사다리 생성
    setRewards(generateRandomRewards()); // 새로운 랜덤 보상 생성
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20 p-2 md:p-4 flex flex-col">
      <div className="max-w-4xl mx-auto w-full flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg md:text-2xl font-bold text-foreground">사다리 게임</h1>
          <div className="w-10" />
        </div>

        {/* Game Description - Compact */}
        <Card className="p-3 mb-2 bg-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary shrink-0" />
            <p className="text-xs text-muted-foreground">
              사다리 선택 → 광고 시청 → 보상 획득 (50P~300P)
            </p>
          </div>
        </Card>

        {/* Ladder Visualization */}
        <Card className="p-2 md:p-4 mb-2 bg-card/50 backdrop-blur-sm flex-1 flex flex-col min-h-0">
          <div className="relative flex flex-col h-full">
            {/* 상단 시작점 선택 */}
            <div className="flex justify-around mb-2">
              {ladderOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleOptionSelect(option.id)}
                  disabled={showResult || animatingPath.length > 0}
                  className={`
                    w-10 h-10 md:w-12 md:h-12 rounded-lg font-bold text-white text-sm
                    transition-all duration-300 flex items-center justify-center
                    ${selectedOption === option.id ? 'ring-4 ring-primary scale-110' : 'hover:scale-105'}
                    ${showResult || animatingPath.length > 0 ? 'cursor-default' : 'cursor-pointer'}
                    bg-gradient-to-br ${option.color}
                  `}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {/* 사다리 그리기 */}
            <svg className="w-full flex-1" viewBox="0 0 600 550" preserveAspectRatio="xMidYMid meet">
              {/* 세로 줄 */}
              {[0, 1, 2, 3, 4].map((i) => (
                <line
                  key={`v-${i}`}
                  x1={100 + i * 100}
                  y1={20}
                  x2={100 + i * 100}
                  y2={520}
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth="3"
                  opacity="0.3"
                />
              ))}

              {/* 가로 연결선 */}
              {ladderData.bars.map((bar, idx) => (
                <line
                  key={`h-${idx}`}
                  x1={100 + bar.from * 100}
                  y1={20 + bar.level * 40}
                  x2={100 + bar.to * 100}
                  y2={20 + bar.level * 40}
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
                        x1={100 + prevPos * 100}
                        y1={20 + (idx - 1) * 40}
                        x2={100 + pos * 100}
                        y2={20 + idx * 40}
                        stroke="hsl(var(--primary))"
                        strokeWidth="6"
                        strokeLinecap="round"
                      />
                    );
                  })}
                  {/* 현재 위치 마커 */}
                  <circle
                    cx={100 + animatingPath[currentPathIndex] * 100}
                    cy={20 + currentPathIndex * 40}
                    r="8"
                    fill="hsl(var(--primary))"
                    className="animate-pulse"
                  />
                </>
              )}
            </svg>

            {/* 하단 보상 표시 */}
            <div className="flex justify-around mt-2">
              {rewards.map((reward, idx) => (
                <div
                  key={idx}
                  className={`
                    w-10 h-10 md:w-12 md:h-12 rounded-lg font-bold text-white
                    flex flex-col items-center justify-center text-[10px]
                    ${idx === 0 ? 'bg-gradient-to-br from-pink-500 to-pink-600' : ''}
                    ${idx === 1 ? 'bg-gradient-to-br from-purple-500 to-purple-600' : ''}
                    ${idx === 2 ? 'bg-gradient-to-br from-blue-500 to-blue-600' : ''}
                    ${idx === 3 ? 'bg-gradient-to-br from-green-500 to-green-600' : ''}
                    ${idx === 4 ? 'bg-gradient-to-br from-orange-500 to-orange-600' : ''}
                    ${showResult && gameResult && animatingPath[animatingPath.length - 1] === idx ? 'ring-4 ring-primary scale-110' : ''}
                    transition-all duration-300
                  `}
                >
                  {showResult ? (
                    <>
                      <div className="text-sm md:text-base">{reward}</div>
                      <div className="text-[8px]">P</div>
                    </>
                  ) : (
                    <div className="text-lg">?</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Result Display */}
        {showResult && gameResult && (
          <Card className="p-4 mb-2 bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-primary">
            <div className="text-center">
              <h3 className="text-lg font-bold mb-1">축하합니다!</h3>
              <div className="text-2xl font-bold text-primary">
                {gameResult.reward}P 획득
              </div>
            </div>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pb-2">
          {!showResult ? (
            <Button
              onClick={handleStartGame}
              disabled={selectedOption === null}
              className="w-full py-5"
              size="lg"
            >
              광고 보고 결과 확인
            </Button>
          ) : (
            <Button
              onClick={handleReset}
              className="w-full py-5"
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
