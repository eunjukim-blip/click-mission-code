import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Star, TrendingUp } from "lucide-react";
import { getUserIdentifier } from "@/lib/userIdentifier";

interface UserStats {
  level: number;
  experience: number;
  total_games_played: number;
  login_streak: number;
}

export const UserLevelCard = () => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [totalPoints, setTotalPoints] = useState(0);

  useEffect(() => {
    loadUserStats();
  }, []);

  const loadUserStats = async () => {
    try {
      const userIdentifier = getUserIdentifier();
      if (!userIdentifier) return;

      // user_stats 가져오기
      const { data: statsData } = await supabase
        .from("user_stats")
        .select("*")
        .eq("user_identifier", userIdentifier)
        .single();

      if (statsData) {
        setStats(statsData);
      }

      // 포인트 가져오기
      const { data: profileData } = await supabase
        .from("profiles")
        .select("total_points")
        .eq("user_identifier", userIdentifier)
        .single();

      if (profileData) {
        setTotalPoints(profileData.total_points);
      }
    } catch (error) {
      console.error("Error loading user stats:", error);
    }
  };

  const getExpForNextLevel = (level: number) => {
    return level * level * 100;
  };

  const getExpProgress = () => {
    if (!stats) return 0;
    const currentLevelExp = (stats.level - 1) * (stats.level - 1) * 100;
    const nextLevelExp = getExpForNextLevel(stats.level);
    const expInLevel = stats.experience - currentLevelExp;
    const expNeeded = nextLevelExp - currentLevelExp;
    return (expInLevel / expNeeded) * 100;
  };

  if (!stats) {
    return (
      <Card className="bg-gradient-to-br from-primary/20 via-primary/10 to-background">
        <CardContent className="p-6">
          <p className="text-muted-foreground">로딩 중...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-primary/20 via-primary/10 to-background animate-fade-in">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-primary/10">
              <Star className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">Level {stats.level}</h3>
              <p className="text-sm text-muted-foreground">
                {totalPoints} 포인트
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="text-sm">
            <TrendingUp className="w-3 h-3 mr-1" />
            {stats.total_games_played} 게임
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">경험치</span>
            <span className="font-medium">
              {stats.experience} / {getExpForNextLevel(stats.level)} EXP
            </span>
          </div>
          <Progress value={getExpProgress()} className="h-2" />
          <p className="text-xs text-muted-foreground text-right">
            다음 레벨까지 {getExpForNextLevel(stats.level) - stats.experience} EXP
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">
              {stats.total_games_played}
            </p>
            <p className="text-xs text-muted-foreground">총 플레이</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">
              {totalPoints}P
            </p>
            <p className="text-xs text-muted-foreground">보유 포인트</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
