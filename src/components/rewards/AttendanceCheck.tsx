import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Gift, Flame } from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { getUserIdentifier } from "@/lib/userIdentifier";

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
      const userIdentifier = getUserIdentifier();
      if (!userIdentifier) return;

      const today = new Date().toISOString().split("T")[0];

      const { data } = await supabase
        .from("daily_attendance")
        .select("*")
        .eq("user_identifier", userIdentifier)
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
      const userIdentifier = getUserIdentifier();
      if (!userIdentifier) {
        toast.error("시리얼 넘버가 필요합니다");
        return;
      }

      const { data, error } = await supabase.functions.invoke(
        "check-daily-attendance",
        {
          body: {
            userIdentifier,
          },
        }
      );

      if (error) throw error;

      if (!data.success) {
        toast.info("오늘은 이미 출석 체크를 완료했습니다");
      } else {
        setAlreadyChecked(true);
        setConsecutiveDays(data.consecutiveDays);
        setRewardPoints(data.reward);

        // 폭죽 효과
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });

        toast.success(
          `출석 체크 완료! 🎉\n${data.consecutiveDays}일 연속 출석\n${data.reward}P 획득!`,
          { duration: 5000 }
        );
      }
    } catch (error) {
      console.error("Error checking attendance:", error);
      toast.error("출석 체크 중 오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-orange-500/20 via-orange-500/10 to-background animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          출석 체크
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {alreadyChecked ? (
          <>
            <div className="flex items-center justify-center p-6 bg-primary/10 rounded-lg">
              <div className="text-center space-y-2">
                <Gift className="w-12 h-12 mx-auto text-primary animate-bounce" />
                <p className="text-lg font-semibold">출석 완료!</p>
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  +{rewardPoints}P
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-orange-500/10 rounded-lg">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" />
                <span className="font-medium">연속 출석</span>
              </div>
              <Badge variant="outline" className="text-lg">
                {consecutiveDays}일
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground text-center">
              내일 다시 출석하면 보너스 포인트를 받을 수 있어요!
            </p>
          </>
        ) : (
          <>
            <div className="text-center p-6 space-y-2">
              <Calendar className="w-12 h-12 mx-auto text-primary" />
              <p className="text-lg font-semibold">오늘의 출석체크</p>
              <p className="text-sm text-muted-foreground">
                매일 출석하고 보상을 받으세요!
              </p>
            </div>

            <Button
              onClick={handleCheckAttendance}
              disabled={loading}
              size="lg"
              className="w-full"
            >
              <Gift className="w-4 h-4 mr-2" />
              {loading ? "처리 중..." : "출석 체크하기"}
            </Button>

            <div className="text-xs text-muted-foreground text-center">
              <p>기본 보상: 10P</p>
              <p>연속 출석 3일마다 +10P 보너스!</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
