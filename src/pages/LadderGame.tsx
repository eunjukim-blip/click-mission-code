import { useState } from "react";
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

export default function LadderGame() {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showAdDialog, setShowAdDialog] = useState(false);
  const [gameResult, setGameResult] = useState<LadderOption | null>(null);

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
    // 결과 계산 (선택한 옵션의 보상 지급)
    const result = ladderOptions.find(opt => opt.id === selectedOption);
    if (result) {
      setGameResult(result);
      setShowResult(true);
      setShowAdDialog(false);
      
      toast({
        title: "축하합니다! 🎉",
        description: `${result.reward} 포인트를 획득했습니다!`,
      });
    }
  };

  const handleReset = () => {
    setSelectedOption(null);
    setShowResult(false);
    setGameResult(null);
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

        {/* Ladder Selection */}
        <div className="grid grid-cols-5 gap-2 md:gap-4 mb-6">
          {ladderOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => handleOptionSelect(option.id)}
              disabled={showResult}
              className={`
                relative aspect-[3/4] rounded-lg transition-all duration-300
                ${selectedOption === option.id 
                  ? 'ring-4 ring-primary scale-105' 
                  : 'hover:scale-105'
                }
                ${showResult ? 'cursor-default' : 'cursor-pointer'}
              `}
            >
              <div className={`
                w-full h-full rounded-lg bg-gradient-to-br ${option.color}
                flex flex-col items-center justify-center text-white
                shadow-lg
              `}>
                <div className="text-2xl md:text-4xl font-bold mb-2">{option.id}</div>
                {showResult && (
                  <div className="text-xs md:text-sm font-semibold">
                    {option.reward}P
                  </div>
                )}
              </div>
              
              {selectedOption === option.id && !showResult && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-6 h-6 md:w-8 md:h-8 bg-white rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 md:w-6 md:h-6 bg-primary rounded-full"></div>
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>

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
