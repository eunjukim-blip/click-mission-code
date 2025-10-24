import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gamepad2, Trophy, LogIn } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="absolute top-6 right-6">
        {user ? (
          <Button
            variant="outline"
            onClick={() => supabase.auth.signOut()}
          >
            로그아웃
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={() => navigate("/auth")}
            className="gap-2"
          >
            <LogIn className="w-4 h-4" />
            로그인
          </Button>
        )}
      </div>

      <div className="text-center mb-12 animate-in fade-in duration-500">
        <Gamepad2 className="w-24 h-24 mx-auto mb-6 text-primary" strokeWidth={1.5} />
        <h1 className="text-4xl md:text-5xl font-bold text-foreground">데일리미션</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-5xl w-full animate-in fade-in duration-700">
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
  );
};

export default Index;
