import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Star, TrendingUp } from "lucide-react";

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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // user_stats 가져오기
      const { data: statsData } = await supabase
        .from("user_stats")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (statsData) {
        setStats(statsData);
      }

      // 포인트 가져오기
      const { data: profileData } = await supabase
        .from("profiles")
        .select("total_points")
        .eq("id", user.id)
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
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Star className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">레벨</p>
              <p className="text-3xl font-bold">{stats.level}</p>
            </div>
          </div>
          <Badge variant="secondary" className="gap-1 text-base px-3 py-1">
            <TrendingUp className="w-4 h-4" />
            {totalPoints.toLocaleString()}P
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">경험치</span>
            <span className="font-semibold">
              {stats.experience.toLocaleString()} /{" "}
              {getExpForNextLevel(stats.level).toLocaleString()} EXP
            </span>
          </div>
          <Progress value={getExpProgress()} className="h-3" />
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="text-center p-3 rounded-lg bg-background/50">
            <p className="text-xs text-muted-foreground">총 플레이</p>
            <p className="text-xl font-bold">{stats.total_games_played}</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-background/50">
            <p className="text-xs text-muted-foreground">연속 로그인</p>
            <p className="text-xl font-bold">{stats.login_streak}일</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
