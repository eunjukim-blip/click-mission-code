import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 flex flex-col items-center justify-center p-4 pb-16 gap-8">
      <div className="text-center mb-4 mt-8 animate-in fade-in duration-500">
        <h1 className="text-3xl md:text-5xl font-black text-foreground mb-4">게임 센터 🎮</h1>
        <p className="text-2xl text-muted-foreground">원하는 게임을 선택하고 리워드를 받으세요!</p>
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
