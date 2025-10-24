import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getUserIdentifier } from "./userIdentifier";

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
    const userIdentifier = getUserIdentifier();
    if (!userIdentifier) {
      console.log("No user identifier, skipping reward");
      return { success: false };
    }

    const { data, error } = await supabase.functions.invoke(
      "process-game-reward",
      {
        body: {
          gameType,
          result,
          pointsEarned,
          userIdentifier,
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
