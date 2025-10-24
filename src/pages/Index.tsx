import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gamepad2, Trophy, Award, Key, Copy } from "lucide-react";
import { UserLevelCard } from "@/components/rewards/UserLevelCard";
import { AttendanceCheck } from "@/components/rewards/AttendanceCheck";
import { DailyMissions } from "@/components/rewards/DailyMissions";
import { SerialNumberInput } from "@/components/SerialNumberInput";
import { getUserIdentifier, formatUserIdentifier } from "@/lib/userIdentifier";
import { toast } from "sonner";

const Index = () => {
  const navigate = useNavigate();
  const [userIdentifier, setUserIdentifier] = useState<string | null>(null);

  useEffect(() => {
    const identifier = getUserIdentifier();
    setUserIdentifier(identifier);
  }, []);

  const handleSerialNumberSuccess = () => {
    const identifier = getUserIdentifier();
    setUserIdentifier(identifier);
  };

  const copySerialNumber = () => {
    if (userIdentifier) {
      navigator.clipboard.writeText(userIdentifier);
      toast.success("시리얼 넘버가 클립보드에 복사되었습니다!");
    }
  };

  if (!userIdentifier) {
    return <SerialNumberInput onSuccess={handleSerialNumberSuccess} />;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Gamepad2 className="w-10 h-10 text-primary" strokeWidth={1.5} />
            <h1 className="text-3xl md:text-4xl font-bold">데일리미션</h1>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate("/leaderboard")}
              className="gap-2"
            >
              <Award className="w-4 h-4" />
              랭킹
            </Button>
            <Button
              variant="outline"
              onClick={copySerialNumber}
              className="gap-2"
            >
              <Copy className="w-4 h-4" />
              시리얼 복사
            </Button>
          </div>
        </div>

        <div className="bg-card/50 backdrop-blur-sm p-3 rounded-lg border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">시리얼 넘버</span>
            </div>
            <code className="text-xs bg-muted px-2 py-1 rounded">
              {formatUserIdentifier(userIdentifier)}
            </code>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
            <UserLevelCard />
            <AttendanceCheck />
          <DailyMissions />
        </div>

        {/* 게임 카드 */}
        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Gamepad2 className="w-6 h-6" />
            미니 게임
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card
          className="cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-lg bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/30"
          onClick={() => navigate("/rewards")}
        >
          <CardHeader className="text-center pb-6 pt-8">
            <div className="text-5xl mb-4">🎁</div>
            <CardTitle className="text-xl">리워드 센터</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">레벨, 출석, 미션</p>
          </CardHeader>
        </Card>

        <Card
          className="cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-lg bg-gradient-to-br from-primary/10 to-primary/5"
          onClick={() => navigate("/missions")}
        >
          <CardHeader className="text-center pb-6 pt-8">
            <Trophy className="w-12 h-12 mx-auto mb-4 text-primary" />
            <CardTitle className="text-xl">미션 센터</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">보상을 받으세요</p>
          </CardHeader>
        </Card>

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
          onClick={() => navigate("/number-sequence")}
        >
          <CardHeader className="text-center pb-6 pt-8">
            <div className="text-5xl mb-4">🔢</div>
            <CardTitle className="text-xl">숫자순서게임</CardTitle>
          </CardHeader>
        </Card>

        <Card
          className="cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-lg"
          onClick={() => navigate("/ladder")}
        >
          <CardHeader className="text-center pb-6 pt-8">
            <div className="text-5xl mb-4">🎰</div>
            <CardTitle className="text-xl">사다리게임</CardTitle>
          </CardHeader>
        </Card>

        <Card
          className="cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-lg"
          onClick={() => navigate("/rock-paper-scissors")}
        >
          <CardHeader className="text-center pb-6 pt-8">
            <div className="text-5xl mb-4">✊</div>
            <CardTitle className="text-xl">가위바위보</CardTitle>
          </CardHeader>
        </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
