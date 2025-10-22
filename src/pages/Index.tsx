import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Gamepad2 } from "lucide-react";

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
            <div className="text-5xl mb-4">🎨</div>
            <CardTitle className="text-xl">빨리 클릭하기</CardTitle>
          </CardHeader>
        </Card>

        <Card
          className="cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-lg"
          onClick={() => navigate("/reaction")}
        >
          <CardHeader className="text-center pb-6 pt-8">
            <div className="text-5xl mb-4">⏱️</div>
            <CardTitle className="text-xl">많이 클릭하기</CardTitle>
          </CardHeader>
        </Card>

        <Card
          className="cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-lg"
          onClick={() => navigate("/quiz")}
        >
          <CardHeader className="text-center pb-6 pt-8">
            <div className="text-5xl mb-4">❓</div>
            <CardTitle className="text-xl">OX퀴즈</CardTitle>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
};

export default Index;
