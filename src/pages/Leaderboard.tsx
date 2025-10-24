import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trophy, Medal, Award } from "lucide-react";
import { toast } from "sonner";

interface RankingEntry {
  user_id: string;
  total_points: number;
  total_games: number;
  profiles?: {
    display_name: string;
    email: string;
  };
}

const Leaderboard = () => {
  const navigate = useNavigate();
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [myRank, setMyRank] = useState<number | null>(null);

  useEffect(() => {
    loadRankings();
  }, []);

  const loadRankings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const today = new Date();
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      const weekStartStr = weekStart.toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("weekly_rankings")
        .select("user_id, total_points, total_games")
        .eq("week_start_date", weekStartStr)
        .order("total_points", { ascending: false })
        .limit(50);

      if (error) throw error;

      // profiles 정보 추가로 가져오기
      const rankingsWithProfiles = await Promise.all(
        (data || []).map(async (ranking) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("display_name, email")
            .eq("id", ranking.user_id)
            .single();

          return {
            ...ranking,
            profiles: profile,
          };
        })
      );

      setRankings(rankingsWithProfiles);

      // 내 순위 찾기
      if (user) {
        const myIndex = rankingsWithProfiles?.findIndex((r) => r.user_id === user.id);
        if (myIndex !== undefined && myIndex !== -1) {
          setMyRank(myIndex + 1);
        }
      }

    } catch (error) {
      console.error("Error loading rankings:", error);
      toast.error("랭킹을 불러오는데 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1)
      return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (rank === 2)
      return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3)
      return <Award className="w-6 h-6 text-orange-600" />;
    return null;
  };

  const getRankBadge = (rank: number) => {
    if (rank <= 3) return "default";
    if (rank <= 10) return "secondary";
    return "outline";
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">주간 랭킹</h1>
            <p className="text-muted-foreground">이번 주 최고의 플레이어</p>
          </div>
        </div>

        {myRank && (
          <Card className="bg-gradient-to-r from-primary/20 to-primary/10 border-primary/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getRankIcon(myRank)}
                  <div>
                    <p className="text-sm text-muted-foreground">내 순위</p>
                    <p className="text-2xl font-bold">#{myRank}</p>
                  </div>
                </div>
                <Badge variant="default">
                  {rankings[myRank - 1]?.total_points.toLocaleString()}P
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              TOP 50 랭킹
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground py-8">
                로딩 중...
              </p>
            ) : rankings.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                아직 랭킹 데이터가 없습니다
              </p>
            ) : (
              <div className="space-y-2">
                {rankings.map((entry, index) => {
                  const rank = index + 1;
                  const profile = entry.profiles as any;

                  return (
                    <div
                      key={entry.user_id}
                      className={`flex items-center justify-between p-4 rounded-lg transition-all ${
                        rank <= 3
                          ? "bg-primary/10 border-2 border-primary/30"
                          : "bg-card hover:bg-accent"
                      }`}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <Badge variant={getRankBadge(rank)} className="w-12 justify-center">
                          #{rank}
                        </Badge>
                        {getRankIcon(rank)}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">
                            {profile?.display_name || "익명"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {entry.total_games}회 플레이
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="ml-2">
                        {entry.total_points.toLocaleString()}P
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground space-y-1">
          <p>💡 매주 일요일에 순위가 초기화됩니다</p>
          <p>🏆 상위 랭커에게는 특별 보상이 지급됩니다</p>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
