import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { UserLevelCard } from "@/components/rewards/UserLevelCard";
import { AttendanceCheck } from "@/components/rewards/AttendanceCheck";
import { DailyMissions } from "@/components/rewards/DailyMissions";

const RewardsHub = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">리워드 센터</h1>
            <p className="text-muted-foreground">
              레벨, 출석, 미션을 확인하세요
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <UserLevelCard />
          <AttendanceCheck />
        </div>

        <DailyMissions />
      </div>
    </div>
  );
};

export default RewardsHub;
