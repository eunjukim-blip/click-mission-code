import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMemo } from "react";

const Index = () => {
  const navigate = useNavigate();

  const stats = useMemo(() => {
    const reactionHistory = localStorage.getItem("reactionHistory");
    const clickHistory = localStorage.getItem("clickHistory");
    
    let avgReaction = null;
    let avgClicks = null;
    
    if (reactionHistory) {
      const history = JSON.parse(reactionHistory);
      if (history.length > 0) {
        const sum = history.reduce((acc: number, time: number) => acc + time, 0);
        avgReaction = sum / history.length;
      }
    }
    
    if (clickHistory) {
      const history = JSON.parse(clickHistory);
      if (history.length > 0) {
        const sum = history.reduce((acc: number, clicks: number) => acc + clicks, 0);
        avgClicks = sum / history.length;
      }
    }
    
    return { avgReaction, avgClicks };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 flex flex-col items-center justify-center p-4 pb-16 gap-8">
      <div className="text-center mb-4 mt-8 animate-in fade-in duration-500">
        <h1 className="text-3xl md:text-5xl font-black text-foreground mb-4">게임 센터 🎮</h1>
        <p className="text-xl text-muted-foreground">원하는 게임을 선택하고 리워드를 받으세요!</p>
        {(stats.avgReaction || stats.avgClicks) && (
          <div className="mt-4 p-4 bg-card rounded-lg shadow-md max-w-md">
            <h3 className="text-sm font-semibold text-foreground mb-2">📊 내 게임 통계</h3>
            <div className="flex gap-4 text-sm text-muted-foreground justify-center">
              {stats.avgReaction && (
                <div>
                  <span className="font-medium">평균 반응속도:</span>{" "}
                  <span className="text-primary font-bold">{(stats.avgReaction / 1000).toFixed(2)}초</span>
                </div>
              )}
              {stats.avgClicks && (
                <div>
                  <span className="font-medium">평균 클릭:</span>{" "}
                  <span className="text-primary font-bold">{Math.round(stats.avgClicks)}회</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full animate-in fade-in duration-700">
        <Card
          className="cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-2xl"
          onClick={() => navigate("/reaction")}
        >
          <CardHeader>
            <div className="text-6xl mb-4 text-center">🎨</div>
            <CardTitle className="text-2xl text-center">캐릭터 반응 게임</CardTitle>
            <CardDescription className="text-center text-base">여우로 바뀔 때 빠르게 반응하세요!</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>⚡ 반응속도가 0.15초 보다 빠르면 리워드 적립!</p>
              <p>🎯 반응속도 측정</p>
            </div>
            <Button className="w-full mt-4" size="lg">
              플레이하기 →
            </Button>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-2xl"
          onClick={() => navigate("/gem")}
        >
          <CardHeader>
            <div className="text-6xl mb-4 text-center">💎</div>
            <CardTitle className="text-2xl text-center">보석 캐기 챌린지</CardTitle>
            <CardDescription className="text-center text-base">20초 안에 돌을 깨고 보석을 캐내세요!</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>⏱️ 20초 시간 제한</p>
              <p>🎯 120번 클릭 하면 보석획득!</p>
            </div>
            <Button className="w-full mt-4" size="lg">
              플레이하기 →
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 text-center text-xs text-muted-foreground">즐거운 게임 되세요! ✨</div>
    </div>
  );
};

export default Index;
