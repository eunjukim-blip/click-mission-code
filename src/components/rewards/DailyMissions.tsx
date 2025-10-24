import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Trophy } from "lucide-react";
import { toast } from "sonner";
import { getUserIdentifier } from "@/lib/userIdentifier";

interface Mission {
  id: string;
  title: string;
  description: string;
  target_count: number;
  reward_points: number;
  reward_exp: number;
  mission_type: string;
}

interface MissionProgress {
  mission_id: string;
  current_count: number;
  completed: boolean;
}

export const DailyMissions = () => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [progress, setProgress] = useState<{ [key: string]: MissionProgress }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMissions();
    loadProgress();
  }, []);

  const loadMissions = async () => {
    try {
      const { data, error } = await supabase
        .from("daily_missions")
        .select("*")
        .eq("is_active", true)
        .order("reward_points", { ascending: false });

      if (error) throw error;
      setMissions(data || []);
    } catch (error) {
      console.error("Error loading missions:", error);
      toast.error("미션을 불러오는데 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  const loadProgress = async () => {
    try {
      const userIdentifier = getUserIdentifier();
      if (!userIdentifier) return;

      const today = new Date().toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("user_mission_progress")
        .select("*")
        .eq("user_identifier", userIdentifier)
        .eq("mission_date", today);

      if (error) throw error;

      const progressMap: { [key: string]: MissionProgress } = {};
      data?.forEach((p) => {
        progressMap[p.mission_id] = {
          mission_id: p.mission_id,
          current_count: p.current_count,
          completed: p.completed,
        };
      });

      setProgress(progressMap);
    } catch (error) {
      console.error("Error loading progress:", error);
    }
  };

  const getMissionProgress = (missionId: string) => {
    return progress[missionId] || { current_count: 0, completed: false, mission_id: missionId };
  };

  const getProgressPercentage = (mission: Mission) => {
    const missionProgress = getMissionProgress(mission.id);
    return Math.min((missionProgress.current_count / mission.target_count) * 100, 100);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">미션 로딩 중...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          일일 미션
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {missions.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            현재 활성화된 미션이 없습니다
          </p>
        ) : (
          missions.map((mission) => {
            const missionProgress = getMissionProgress(mission.id);
            const percentage = getProgressPercentage(mission);

            return (
              <div
                key={mission.id}
                className="p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-3">
                    {missionProgress.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground mt-0.5" />
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold">{mission.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {mission.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="secondary">
                      {mission.reward_points}P
                    </Badge>
                    <Badge variant="outline">
                      {mission.reward_exp} EXP
                    </Badge>
                  </div>
                </div>

                <div className="space-y-1 mt-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">진행도</span>
                    <span className="font-medium">
                      {missionProgress.current_count} / {mission.target_count}
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>

                {missionProgress.completed && (
                  <Badge variant="default" className="mt-2 w-full justify-center">
                    완료!
                  </Badge>
                )}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};
