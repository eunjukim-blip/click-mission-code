import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RewardedVideoAd } from "@/components/ads/RewardedVideoAd";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Gift } from "lucide-react";
import confetti from "canvas-confetti";
import { processGameReward } from "@/lib/rewardUtils";

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

// 랜덤 보상 생성 (50P ~ 300P) - 최적화됨
const generateRandomRewards = () => {
  const rewards = [50, 100, 150, 200, 300];
  for (let i = rewards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rewards[i], rewards[j]] = [rewards[j], rewards[i]];
  }
  return rewards;
};

// 랜덤 사다리 경로 생성 - 최적화됨
const generateRandomLadder = () => {
  const bars: { level: number; from: number; to: number }[] = [];
  
  for (let level = 1; level <= LEVELS; level++) {
    const barCount = Math.floor(Math.random() * 2) + 1;
    const usedPositions = new Set<number>();
    
    for (let i = 0; i < barCount; i++) {
      let from: number;
      do {
        from = Math.floor(Math.random() * (LANE_COUNT - 1));
      } while (usedPositions.has(from) || usedPositions.has(from + 1));
      
      usedPositions.add(from);
      usedPositions.add(from + 1);
      bars.push({ level, from, to: from + 1 });
    }
  }
  
  const paths: number[][] = [];
  
  for (let start = 0; start < LANE_COUNT; start++) {
    const path: number[] = [start];
    let currentPos = start;
    
    for (let level = 1; level <= LEVELS; level++) {
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
  const [gameResult, setGameResult] = useState<{ reward: number; finalPosition: number } | null>(null);
  const [animatingPath, setAnimatingPath] = useState<Array<{ x: number; y: number }>>([]);
  const [currentPathIndex, setCurrentPathIndex] = useState(0);
  const [resetKey, setResetKey] = useState(0);
  
  // useMemo로 사다리와 보상을 메모이제이션하여 불필요한 재생성 방지
  const ladderData = useMemo(() => generateRandomLadder(), [resetKey]);
  const rewards = useMemo(() => generateRandomRewards(), [resetKey]);

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
    
    // 선택한 경로를 세로-가로 이동으로 분리
    const originalPath = ladderData.paths[selectedOption - 1];
    const detailedPath: Array<{ x: number; y: number }> = [];
    
    for (let i = 0; i < originalPath.length; i++) {
      const currentX = originalPath[i];
      const currentY = i;
      
      if (i === 0) {
        // 시작점
        detailedPath.push({ x: currentX, y: currentY });
      } else {
        const prevX = originalPath[i - 1];
        
        if (currentX !== prevX) {
          // 가로 이동이 있는 경우: 현재 레벨에서 가로로 먼저 이동
          detailedPath.push({ x: prevX, y: currentY });
          detailedPath.push({ x: currentX, y: currentY });
        } else {
          // 세로로만 이동
          detailedPath.push({ x: currentX, y: currentY });
        }
      }
    }
    
    setAnimatingPath(detailedPath);
    setCurrentPathIndex(0);
  };

  // 경로 애니메이션
  useEffect(() => {
    if (animatingPath.length === 0) return;
    
    if (currentPathIndex < animatingPath.length - 1) {
      const timer = setTimeout(() => {
        setCurrentPathIndex(currentPathIndex + 1);
      }, 150);
      return () => clearTimeout(timer);
    } else {
      // 애니메이션 완료 후 결과 표시
      const finalPosition = animatingPath[animatingPath.length - 1].x;
      const reward = rewards[finalPosition];
      
      setTimeout(() => {
        setGameResult({ reward, finalPosition });
        setShowResult(true);
        
        // 최고 당첨금(300P)일 때 폭죽 효과
        if (reward === 300) {
          triggerConfetti();
        }
        
        // 리워드 처리
        processGameReward("ladder", { reward, position: finalPosition }, reward);
        
        toast({
          title: "축하합니다! 🎉",
          description: `${reward} 포인트를 획득했습니다!`,
        });
      }, 500);
    }
  }, [currentPathIndex, animatingPath, rewards]);

  const triggerConfetti = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval = window.setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);
  };

  const handleReset = () => {
    setSelectedOption(null);
    setShowResult(false);
    setGameResult(null);
    setAnimatingPath([]);
    setCurrentPathIndex(0);
    setResetKey(prev => prev + 1); // resetKey 변경으로 새로운 사다리와 보상 생성
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
                  {animatingPath.slice(0, currentPathIndex + 1).map((point, idx) => {
                    if (idx === 0) return null;
                    const prevPoint = animatingPath[idx - 1];
                    return (
                      <line
                        key={`path-${idx}`}
                        x1={100 + prevPoint.x * 100}
                        y1={20 + prevPoint.y * 40}
                        x2={100 + point.x * 100}
                        y2={20 + point.y * 40}
                        stroke="hsl(var(--primary))"
                        strokeWidth="6"
                        strokeLinecap="round"
                      />
                    );
                  })}
                  {/* 현재 위치 마커 */}
                  <circle
                    cx={100 + animatingPath[currentPathIndex].x * 100}
                    cy={20 + animatingPath[currentPathIndex].y * 40}
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
                    ${showResult && gameResult && gameResult.finalPosition === idx ? 'ring-4 ring-primary scale-110' : ''}
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
