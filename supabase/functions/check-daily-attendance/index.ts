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

    // 인증 확인
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    const today = new Date().toISOString().split("T")[0];

    // 오늘 출석 체크 여부 확인
    const { data: todayAttendance } = await supabase
      .from("daily_attendance")
      .select("*")
      .eq("user_id", user.id)
      .eq("attendance_date", today)
      .single();

    if (todayAttendance) {
      return new Response(
        JSON.stringify({
          alreadyChecked: true,
          consecutiveDays: todayAttendance.consecutive_days,
          rewardPoints: todayAttendance.reward_points,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 어제 출석 확인
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    const { data: yesterdayAttendance } = await supabase
      .from("daily_attendance")
      .select("*")
      .eq("user_id", user.id)
      .eq("attendance_date", yesterdayStr)
      .single();

    // 연속 일수 계산
    const consecutiveDays = yesterdayAttendance 
      ? yesterdayAttendance.consecutive_days + 1 
      : 1;

    // 보상 포인트 계산 (연속 일수에 따라 증가)
    // 1일: 10P, 2일: 15P, 3일: 20P, ..., 7일 이상: 50P
    let rewardPoints = 10;
    if (consecutiveDays >= 7) {
      rewardPoints = 50;
    } else if (consecutiveDays >= 5) {
      rewardPoints = 35;
    } else if (consecutiveDays >= 3) {
      rewardPoints = 25;
    } else if (consecutiveDays >= 2) {
      rewardPoints = 15;
    }

    // 출석 체크 기록
    await supabase
      .from("daily_attendance")
      .insert({
        user_id: user.id,
        attendance_date: today,
        reward_points: rewardPoints,
        consecutive_days: consecutiveDays,
      });

    // 포인트 지급
    const { data: profile } = await supabase
      .from("profiles")
      .select("total_points")
      .eq("id", user.id)
      .single();

    await supabase
      .from("profiles")
      .update({
        total_points: (profile?.total_points || 0) + rewardPoints,
      })
      .eq("id", user.id);

    // user_stats의 login_streak 업데이트
    await supabase
      .from("user_stats")
      .upsert({
        user_id: user.id,
        login_streak: consecutiveDays,
        last_login_date: today,
      }, {
        onConflict: "user_id",
      });

    console.log(`Attendance checked for user ${user.id}: ${consecutiveDays} days, ${rewardPoints}P`);

    return new Response(
      JSON.stringify({
        success: true,
        consecutiveDays,
        rewardPoints,
        alreadyChecked: false,
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
