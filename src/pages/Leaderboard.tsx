import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatUserIdentifier } from "@/lib/userIdentifier";

interface RankingData {
  user_identifier: string;
  total_points: number;
  total_games: number;
  rank: number;
}

const Leaderboard = () => {
  const navigate = useNavigate();
  const [rankings, setRankings] = useState<RankingData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRankings();
  }, []);

  const loadRankings = async () => {
    try {
      const today = new Date();
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      const weekStartStr = weekStart.toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("weekly_rankings")
        .select("*")
        .eq("week_start_date", weekStartStr)
        .order("total_points", { ascending: false })
        .limit(50);

      if (error) throw error;

      // 순위 부여
      const rankedData = data?.map((item, index) => ({
        ...item,
        rank: index + 1,
      })) || [];

      setRankings(rankedData);
    } catch (error) {
      console.error("Error loading rankings:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="p-2 rounded-full bg-yellow-500/20">
          <Trophy className="w-6 h-6 text-yellow-500" />
        </div>
      );
    } else if (rank === 2) {
      return (
        <div className="p-2 rounded-full bg-gray-400/20">
          <Medal className="w-6 h-6 text-gray-400" />
        </div>
      );
    } else if (rank === 3) {
      return (
        <div className="p-2 rounded-full bg-orange-500/20">
          <Medal className="w-6 h-6 text-orange-500" />
        </div>
      );
    }
    return (
      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
        <span className="font-bold text-sm">{rank}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 헤더 */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Trophy className="w-8 h-8 text-yellow-500" />
              주간 리더보드
            </h1>
            <p className="text-muted-foreground">
              이번 주 최고 성적을 거둔 플레이어들
            </p>
          </div>
        </div>

        {/* 랭킹 리스트 */}
        <Card>
          <CardHeader>
            <CardTitle>TOP 50</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground text-center py-8">
                로딩 중...
              </p>
            ) : rankings.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                아직 랭킹 데이터가 없습니다
              </p>
            ) : (
              <div className="space-y-2">
                {rankings.map((ranking) => (
                  <div
                    key={ranking.user_identifier}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {getRankBadge(ranking.rank)}
                      <div>
                        <p className="font-semibold">
                          User {formatUserIdentifier(ranking.user_identifier).slice(0, 11)}...
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {ranking.total_games} 게임 플레이
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-lg px-4 py-1">
                      {ranking.total_points}P
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 보상 안내 */}
        <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Trophy className="w-6 h-6 text-yellow-500 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">주간 보상</h3>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>🥇 1위: 1000P</p>
                  <p>🥈 2위: 500P</p>
                  <p>🥉 3위: 300P</p>
                  <p>📍 4-10위: 100P</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Leaderboard;
