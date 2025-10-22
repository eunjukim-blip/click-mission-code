import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Gamepad2, Sparkles, Calendar, Joystick, Gift } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="text-center mb-12 animate-in fade-in duration-500">
        <Gamepad2 className="w-24 h-24 mx-auto mb-6 text-primary" strokeWidth={1.5} />
        <h1 className="text-4xl md:text-5xl font-bold text-foreground">데일리미션</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl w-full animate-in fade-in duration-700">
        <Card
          className="cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-lg"
          onClick={() => navigate("/memory")}
        >
          <CardHeader className="text-center pb-6 pt-8">
            <div className="text-5xl mb-4">🃏</div>
            <CardTitle className="text-xl">카드맞추기</CardTitle>
          </CardHeader>
        </Card>

        <Card
          className="cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-lg"
          onClick={() => navigate("/gem")}
        >
          <CardHeader className="text-center pb-6 pt-8">
            <div className="text-5xl mb-4">💎</div>
            <CardTitle className="text-xl">보석캐기</CardTitle>
          </CardHeader>
        </Card>

        <Card
          className="cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-lg"
          onClick={() => navigate("/reaction")}
        >
          <CardHeader className="text-center pb-6 pt-8">
            <div className="text-5xl mb-4">⏱️</div>
            <CardTitle className="text-xl">반응게임</CardTitle>
          </CardHeader>
        </Card>

        <Card
          className="cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-lg"
          onClick={() => navigate("/quiz")}
        >
          <CardHeader className="text-center pb-6 pt-8">
            <div className="text-5xl mb-4">📰</div>
            <CardTitle className="text-xl">경제상식 OX퀴즈</CardTitle>
          </CardHeader>
        </Card>

        <Card
          className="cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-lg"
          onClick={() => navigate("/fortune")}
        >
          <CardHeader className="text-center pb-6 pt-8">
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-primary" />
            <CardTitle className="text-xl">오늘의 운세</CardTitle>
          </CardHeader>
        </Card>

        <Card
          className="cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-lg"
          onClick={() => navigate("/attendance")}
        >
          <CardHeader className="text-center pb-6 pt-8">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-primary" />
            <CardTitle className="text-xl">출석체크</CardTitle>
          </CardHeader>
        </Card>

        <Card
          className="cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-lg"
          onClick={() => navigate("/minigames")}
        >
          <CardHeader className="text-center pb-6 pt-8">
            <Joystick className="w-12 h-12 mx-auto mb-4 text-primary" />
            <CardTitle className="text-xl">미니게임</CardTitle>
          </CardHeader>
        </Card>

        <Card
          className="cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-lg"
          onClick={() => navigate("/coupang")}
        >
          <CardHeader className="text-center pb-6 pt-8">
            <Gift className="w-12 h-12 mx-auto mb-4 text-primary" />
            <CardTitle className="text-xl">쿠팡적립</CardTitle>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
};

export default Index;
