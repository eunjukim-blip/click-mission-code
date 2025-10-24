import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GameRewardRequest {
  gameType: string;
  result: any;
  pointsEarned: number;
  userIdentifier: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { gameType, result, pointsEarned, userIdentifier }: GameRewardRequest = await req.json();

    if (!userIdentifier || !/^[0-9]{4}$/.test(userIdentifier)) {
      throw new Error("Invalid user identifier");
    }

    console.log(`Processing reward for user ${userIdentifier}, game: ${gameType}, points: ${pointsEarned}`);

    // 1. user_stats 가져오기 또는 생성
    let { data: userStats, error: statsError } = await supabase
      .from("user_stats")
      .select("*")
      .eq("user_identifier", userIdentifier)
      .single();

    if (statsError && statsError.code === "PGRST116") {
      // 레코드가 없으면 생성
      const { data: newStats, error: createError } = await supabase
        .from("user_stats")
        .insert({
          user_identifier: userIdentifier,
          level: 1,
          experience: 0,
          total_games_played: 0,
          login_streak: 0,
        })
        .select()
        .single();

      if (createError) throw createError;
      userStats = newStats;
    } else if (statsError) {
      throw statsError;
    }

    // 2. 레벨별 경험치 계산 (레벨이 높을수록 더 많은 경험치)
    const currentLevel = userStats?.level || 1;
    const baseExp = Math.floor(pointsEarned * 1.5);
    const levelBonus = 1 + (currentLevel - 1) * 0.1; // 레벨당 10% 보너스
    const expEarned = Math.floor(baseExp * levelBonus);

    // 3. 레벨 및 경험치 업데이트
    const newExperience = (userStats?.experience || 0) + expEarned;
    const newLevel = Math.floor(Math.sqrt(newExperience / 100)) + 1;
    const leveledUp = newLevel > (userStats?.level || 1);

    await supabase
      .from("user_stats")
      .update({
        experience: newExperience,
        level: newLevel,
        total_games_played: (userStats?.total_games_played || 0) + 1,
      })
      .eq("user_identifier", userIdentifier);

    // 4. 포인트 적립 (profiles 테이블)
    const { data: profile } = await supabase
      .from("profiles")
      .select("total_points")
      .eq("user_identifier", userIdentifier)
      .single();

    if (profile) {
      const newPoints = (profile?.total_points || 0) + pointsEarned;
      await supabase
        .from("profiles")
        .update({ total_points: newPoints })
        .eq("user_identifier", userIdentifier);
    } else {
      // 프로필이 없으면 생성
      await supabase
        .from("profiles")
        .insert({
          user_identifier: userIdentifier,
          total_points: pointsEarned,
          display_name: `User ${userIdentifier.slice(0, 6)}`,
        });
    }

    // 5. 게임 활동 로그 기록
    await supabase
      .from("game_activity_log")
      .insert({
        user_identifier: userIdentifier,
        game_type: gameType,
        points_earned: pointsEarned,
        exp_earned: expEarned,
        result: result,
      });

    // 6. 주간 랭킹 업데이트
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay()); // 이번 주 일요일
    const weekStartStr = weekStart.toISOString().split("T")[0];

    const { data: ranking } = await supabase
      .from("weekly_rankings")
      .select("*")
      .eq("user_identifier", userIdentifier)
      .eq("week_start_date", weekStartStr)
      .single();

    if (ranking) {
      await supabase
        .from("weekly_rankings")
        .update({
          total_points: ranking.total_points + pointsEarned,
          total_games: ranking.total_games + 1,
        })
        .eq("id", ranking.id);
    } else {
      await supabase
        .from("weekly_rankings")
        .insert({
          user_identifier: userIdentifier,
          week_start_date: weekStartStr,
          total_points: pointsEarned,
          total_games: 1,
        });
    }

    // 7. 미션 진행도 업데이트
    await updateMissionProgress(supabase, userIdentifier, gameType);

    console.log(`Reward processed: ${pointsEarned}P, ${expEarned} EXP (Lv${currentLevel} bonus), Level: ${newLevel}`);

    return new Response(
      JSON.stringify({
        success: true,
        pointsEarned,
        expEarned,
        newLevel,
        leveledUp,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing reward:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function updateMissionProgress(supabase: any, userIdentifier: string, gameType: string) {
  const today = new Date().toISOString().split("T")[0];

  // 해당 게임 타입 미션 찾기
  const missionTypeMap: { [key: string]: string } = {
    quiz: "play_quiz",
    rps: "play_rps",
    ladder: "play_ladder",
    memory: "play_memory",
    reaction: "play_reaction",
  };

  const missionTypes = [missionTypeMap[gameType], "play_any_game"].filter(Boolean);

  for (const missionType of missionTypes) {
    const { data: missions } = await supabase
      .from("daily_missions")
      .select("*")
      .eq("mission_type", missionType)
      .eq("is_active", true);

    if (!missions || missions.length === 0) continue;

    for (const mission of missions) {
      // 진행도 가져오기 또는 생성
      const { data: progress } = await supabase
        .from("user_mission_progress")
        .select("*")
        .eq("user_identifier", userIdentifier)
        .eq("mission_id", mission.id)
        .eq("mission_date", today)
        .single();

      if (progress) {
        // 진행도 업데이트
        const newCount = progress.current_count + 1;
        const completed = newCount >= mission.target_count;

        await supabase
          .from("user_mission_progress")
          .update({
            current_count: newCount,
            completed: completed,
            completed_at: completed ? new Date().toISOString() : null,
          })
          .eq("id", progress.id);

        // 완료 시 보상 지급
        if (completed && !progress.completed) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("total_points")
            .eq("user_identifier", userIdentifier)
            .single();

          if (profile) {
            await supabase
              .from("profiles")
              .update({
                total_points: (profile.total_points || 0) + mission.reward_points,
              })
              .eq("user_identifier", userIdentifier);
          }

          const { data: stats } = await supabase
            .from("user_stats")
            .select("experience")
            .eq("user_identifier", userIdentifier)
            .single();

          if (stats) {
            await supabase
              .from("user_stats")
              .update({
                experience: (stats.experience || 0) + mission.reward_exp,
              })
              .eq("user_identifier", userIdentifier);
          }
        }
      } else {
        // 새로운 진행도 생성
        await supabase
          .from("user_mission_progress")
          .insert({
            user_identifier: userIdentifier,
            mission_id: mission.id,
            current_count: 1,
            completed: 1 >= mission.target_count,
            completed_at: 1 >= mission.target_count ? new Date().toISOString() : null,
            mission_date: today,
          });
      }
    }
  }
}
