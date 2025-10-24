import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Gift, Flame } from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";

export const AttendanceCheck = () => {
  const [alreadyChecked, setAlreadyChecked] = useState(false);
  const [consecutiveDays, setConsecutiveDays] = useState(0);
  const [rewardPoints, setRewardPoints] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkAttendanceStatus();
  }, []);

  const checkAttendanceStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split("T")[0];

      const { data } = await supabase
        .from("daily_attendance")
        .select("*")
        .eq("user_id", user.id)
        .eq("attendance_date", today)
        .single();

      if (data) {
        setAlreadyChecked(true);
        setConsecutiveDays(data.consecutive_days);
        setRewardPoints(data.reward_points);
      }
    } catch (error) {
      console.error("Error checking attendance status:", error);
    }
  };

  const handleCheckAttendance = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("로그인이 필요합니다");
        return;
      }

      const { data, error } = await supabase.functions.invoke(
        "check-daily-attendance",
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (error) throw error;

      if (data.alreadyChecked) {
        toast.info("오늘은 이미 출석 체크를 완료했습니다");
      } else {
        setAlreadyChecked(true);
        setConsecutiveDays(data.consecutiveDays);
        setRewardPoints(data.rewardPoints);

        // 폭죽 효과
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });

        toast.success(
          `출석 체크 완료! 🎉\n${data.consecutiveDays}일 연속 출석\n${data.rewardPoints}P 획득!`,
          { duration: 5000 }
        );
      }
    } catch (error) {
      console.error("Error checking attendance:", error);
      toast.error("출석 체크에 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  const getRewardForDay = (day: number) => {
    if (day >= 7) return 50;
    if (day >= 5) return 35;
    if (day >= 3) return 25;
    if (day >= 2) return 15;
    return 10;
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          출석 체크
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
          <div className="flex items-center gap-3">
            <Flame className="w-8 h-8 text-orange-500" />
            <div>
              <p className="text-sm text-muted-foreground">연속 출석</p>
              <p className="text-2xl font-bold">{consecutiveDays}일</p>
            </div>
          </div>
          {alreadyChecked && (
            <Badge variant="default" className="gap-1">
              <Gift className="w-3 h-3" />
              +{rewardPoints}P
            </Badge>
          )}
        </div>

        {!alreadyChecked ? (
          <Button
            onClick={handleCheckAttendance}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? "처리 중..." : "오늘의 출석 체크하기"}
          </Button>
        ) : (
          <div className="text-center p-4 rounded-lg bg-muted">
            <p className="text-sm text-muted-foreground">
              ✅ 오늘 출석 체크를 완료했습니다!
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              내일 다시 방문해주세요
            </p>
          </div>
        )}

        <div className="space-y-2">
          <p className="text-sm font-semibold">연속 출석 보상</p>
          <div className="grid grid-cols-7 gap-2">
            {[1, 2, 3, 4, 5, 6, 7].map((day) => (
              <div
                key={day}
                className={`text-center p-2 rounded border ${
                  consecutiveDays >= day
                    ? "bg-primary/10 border-primary"
                    : "bg-card border-border"
                }`}
              >
                <p className="text-xs font-semibold">{day}일</p>
                <p className="text-xs text-muted-foreground">
                  {getRewardForDay(day)}P
                </p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
