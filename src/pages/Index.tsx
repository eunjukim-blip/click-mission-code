import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import missionBanner from "@/assets/mission-center-banner.jpg";

const Index = () => {
  const navigate = useNavigate();
  const [avgReactionTime, setAvgReactionTime] = useState<number | null>(null);
  const [avgClicks, setAvgClicks] = useState<number | null>(null);

  useEffect(() => {
    // 반응속도 평균 가져오기
    supabase
      .from('reaction_game_results')
      .select('reaction_time')
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          const sum = data.reduce((acc, row) => acc + row.reaction_time, 0);
          setAvgReactionTime(sum / data.length);
        }
      });

    // 클릭 평균 가져오기
    supabase
      .from('gem_game_results')
      .select('clicks')
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          const sum = data.reduce((acc, row) => acc + row.clicks, 0);
          setAvgClicks(sum / data.length);
        }
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 flex flex-col items-center justify-center p-4 pb-16 gap-8">
      <div className="w-full max-w-6xl mb-4 mt-8 animate-in fade-in duration-500">
        <img 
          src={missionBanner} 
          alt="미션 센터 배너" 
          className="w-full h-auto rounded-2xl shadow-2xl"
        />
      </div>
      
      <div className="text-center mb-4 animate-in fade-in duration-500">
        <h1 className="text-3xl md:text-5xl font-black text-foreground mb-4">데일리미션 🎯</h1>
        <p className="text-xl text-muted-foreground">원하는 미션을 선택하고 리워드를 받으세요!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full animate-in fade-in duration-700">
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
              {avgReactionTime && (
                <p className="text-primary font-semibold pt-2 border-t">
                  📊 전체 평균: {(avgReactionTime / 1000).toFixed(2)}초
                </p>
              )}
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
              {avgClicks && (
                <p className="text-primary font-semibold pt-2 border-t">
                  📊 전체 평균: {Math.round(avgClicks)}회 클릭
                </p>
              )}
            </div>
            <Button className="w-full mt-4" size="lg">
              플레이하기 →
            </Button>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-2xl"
          onClick={() => navigate("/fortune")}
        >
          <CardHeader>
            <div className="text-6xl mb-4 text-center">✨</div>
            <CardTitle className="text-2xl text-center">오늘의 운세</CardTitle>
            <CardDescription className="text-center text-base">나의 오늘 운세를 확인해보세요!</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>🔮 오늘의 운세 점수</p>
              <p>🍀 행운의 숫자 & 컬러</p>
              <p>📅 양력/음력 선택 가능</p>
            </div>
            <Button className="w-full mt-4" size="lg">
              운세 보기 →
            </Button>
          </CardContent>
        </Card>
      </div>

      
    </div>
  );
};

export default Index;
