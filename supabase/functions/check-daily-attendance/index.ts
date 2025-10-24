import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { userIdentifier } = await req.json();

    if (!userIdentifier || !/^([0-9]{4}|[A-Z0-9]{24})$/.test(userIdentifier)) {
      throw new Error("Invalid user identifier");
    }

    const today = new Date().toISOString().split("T")[0];

    // 오늘 출석 체크 여부 확인
    const { data: existingAttendance } = await supabase
      .from("daily_attendance")
      .select("*")
      .eq("user_identifier", userIdentifier)
      .eq("attendance_date", today)
      .single();

    if (existingAttendance) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Already checked in today",
          attendance: existingAttendance,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 어제 날짜
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    // 어제 출석 확인
    const { data: yesterdayAttendance } = await supabase
      .from("daily_attendance")
      .select("*")
      .eq("user_identifier", userIdentifier)
      .eq("attendance_date", yesterdayStr)
      .single();

    // 연속 출석일 계산
    let consecutiveDays = 1;
    if (yesterdayAttendance) {
      consecutiveDays = (yesterdayAttendance.consecutive_days || 0) + 1;
    }

    // 연속 출석 보너스 계산 (3일마다 보너스 +10P)
    const baseReward = 10;
    const bonusReward = Math.floor(consecutiveDays / 3) * 10;
    const totalReward = baseReward + bonusReward;

    // 출석 체크 기록
    const { data: newAttendance, error: attendanceError } = await supabase
      .from("daily_attendance")
      .insert({
        user_identifier: userIdentifier,
        attendance_date: today,
        consecutive_days: consecutiveDays,
        reward_points: totalReward,
      })
      .select()
      .single();

    if (attendanceError) throw attendanceError;

    // 포인트 지급
    const { data: profile } = await supabase
      .from("profiles")
      .select("total_points")
      .eq("user_identifier", userIdentifier)
      .single();

    if (profile) {
      await supabase
        .from("profiles")
        .update({
          total_points: (profile.total_points || 0) + totalReward,
        })
        .eq("user_identifier", userIdentifier);
    } else {
      // 프로필이 없으면 생성
      await supabase
        .from("profiles")
        .insert({
          user_identifier: userIdentifier,
          total_points: totalReward,
          display_name: `User ${userIdentifier.slice(0, 6)}`,
        });
    }

    // 경험치 지급
    const expReward = totalReward;
    const { data: stats } = await supabase
      .from("user_stats")
      .select("experience")
      .eq("user_identifier", userIdentifier)
      .single();

    if (stats) {
      await supabase
        .from("user_stats")
        .update({
          experience: (stats.experience || 0) + expReward,
        })
        .eq("user_identifier", userIdentifier);
    }

    return new Response(
      JSON.stringify({
        success: true,
        attendance: newAttendance,
        consecutiveDays,
        reward: totalReward,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error checking attendance:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
