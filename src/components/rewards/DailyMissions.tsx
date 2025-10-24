import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Trophy } from "lucide-react";
import { toast } from "sonner";

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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("user_mission_progress")
        .select("*")
        .eq("user_id", user.id)
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

  const getMissionProgress = (mission: Mission) => {
    const p = progress[mission.id];
    if (!p) return { current: 0, completed: false };
    return { current: p.current_count, completed: p.completed };
  };

  const getProgressPercentage = (mission: Mission) => {
    const { current } = getMissionProgress(mission);
    return Math.min((current / mission.target_count) * 100, 100);
  };

  if (loading) {
    return (
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            데일리 미션
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">로딩 중...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          데일리 미션
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {missions.map((mission) => {
          const { current, completed } = getMissionProgress(mission);
          const progressPercent = getProgressPercentage(mission);

          return (
            <div
              key={mission.id}
              className={`p-4 rounded-lg border transition-all ${
                completed
                  ? "bg-primary/5 border-primary/20"
                  : "bg-card border-border hover:border-primary/50"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start gap-3">
                  {completed ? (
                    <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground mt-0.5" />
                  )}
                  <div>
                    <h4 className="font-semibold">{mission.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {mission.description}
                    </p>
                  </div>
                </div>
                <Badge variant={completed ? "default" : "secondary"}>
                  +{mission.reward_points}P
                </Badge>
              </div>

              <div className="ml-8 space-y-2">
                <Progress value={progressPercent} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>
                    진행도: {current}/{mission.target_count}
                  </span>
                  <span>+{mission.reward_exp} EXP</span>
                </div>
              </div>
            </div>
          );
        })}

        {missions.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            현재 진행 중인 미션이 없습니다
          </p>
        )}
      </CardContent>
    </Card>
  );
};
