import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Play, X } from "lucide-react";

interface RewardedVideoAdProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardEarned: () => void;
}

/**
 * 보상형 비디오 광고 컴포넌트
 * 
 * 실제 광고 네트워크 연동 옵션:
 * 1. Google AdMob for Web
 * 2. Unity Ads
 * 3. IronSource
 * 4. AdColony
 * 
 * 현재는 시뮬레이션 버전입니다.
 */
export const RewardedVideoAd = ({ isOpen, onClose, onRewardEarned }: RewardedVideoAdProps) => {
  const [isWatching, setIsWatching] = useState(false);
  const [watchProgress, setWatchProgress] = useState(0);
  const [canSkip, setCanSkip] = useState(false);

  const handleWatchAd = () => {
    setIsWatching(true);
    setWatchProgress(0);
    setCanSkip(false);

    // 광고 시청 시뮬레이션 (5초)
    const interval = setInterval(() => {
      setWatchProgress((prev) => {
        const newProgress = prev + 20;
        if (newProgress >= 100) {
          clearInterval(interval);
          setCanSkip(true);
          return 100;
        }
        return newProgress;
      });
    }, 1000);

    // TODO: 실제 광고 SDK 연동
    // 예: AdMob.showRewardedVideo().then(onRewardEarned)
  };

  const handleClaimReward = () => {
    onRewardEarned();
    setIsWatching(false);
    setWatchProgress(0);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {isWatching ? "광고 시청 중..." : "광고를 시청하고 계속하기"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!isWatching ? (
            <>
              <div className="text-center space-y-2">
                <div className="text-6xl">📺</div>
                <p className="text-muted-foreground">
                  짧은 광고를 시청하고<br />다음 라운드로 진행하세요
                </p>
              </div>
              <Button onClick={handleWatchAd} className="w-full" size="lg">
                <Play className="mr-2 h-4 w-4" />
                광고 시청하기
              </Button>
              <Button onClick={onClose} variant="ghost" className="w-full">
                <X className="mr-2 h-4 w-4" />
                취소
              </Button>
            </>
          ) : (
            <>
              {/* 광고 영역 시뮬레이션 */}
              <div className="aspect-video bg-black rounded-lg flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-purple-600 to-blue-600 animate-pulse">
                  <div className="text-white text-center">
                    <Play className="h-16 w-16 mx-auto mb-2" />
                    <p className="text-sm">광고 시청 중...</p>
                  </div>
                </div>
              </div>

              {/* 진행 바 */}
              <div className="space-y-2">
                <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-1000"
                    style={{ width: `${watchProgress}%` }}
                  />
                </div>
                <p className="text-xs text-center text-muted-foreground">
                  {watchProgress < 100 ? `${Math.floor(watchProgress / 20)}초 / 5초` : "시청 완료!"}
                </p>
              </div>

              {canSkip && (
                <Button onClick={handleClaimReward} className="w-full" size="lg">
                  보상 받고 계속하기
                </Button>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
