import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const processGameReward = async (
  gameType: string,
  result: any,
  pointsEarned: number
): Promise<{
  success: boolean;
  leveledUp?: boolean;
  newLevel?: number;
}> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.log("No session, skipping reward");
      return { success: false };
    }

    const { data, error } = await supabase.functions.invoke(
      "process-game-reward",
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: {
          gameType,
          result,
          pointsEarned,
        },
      }
    );

    if (error) {
      console.error("Reward processing error:", error);
      return { success: false };
    }

    if (data.leveledUp) {
      toast.success(
        `🎉 레벨업! Level ${data.newLevel}\n${pointsEarned}P + ${data.expEarned} EXP 획득! (Lv${data.newLevel} 보너스 적용)`,
        { duration: 5000 }
      );
    } else {
      toast.success(
        `✨ ${pointsEarned}P + ${data.expEarned} EXP 획득!`,
        { duration: 3000 }
      );
    }

    return {
      success: true,
      leveledUp: data.leveledUp,
      newLevel: data.newLevel,
    };
  } catch (error) {
    console.error("Error processing reward:", error);
    return { success: false };
  }
};
