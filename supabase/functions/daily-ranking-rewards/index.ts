import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RankingResult {
  user_identifier: string;
  level: number;
  time_taken: number;
  rank: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting daily ranking rewards process...');

    // Get yesterday's date
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const startOfDay = `${yesterdayStr}T00:00:00Z`;
    const endOfDay = `${yesterdayStr}T23:59:59Z`;

    console.log(`Processing rankings for date: ${yesterdayStr}`);

    // Reward amounts by rank
    const rewardAmounts = [1000, 500, 300, 200, 100]; // 1st to 5th place

    // Process each level (1-10)
    const levels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    let totalRewardsGiven = 0;

    for (const level of levels) {
      console.log(`Processing level ${level}...`);

      // Get top 5 users for this level on yesterday
      const { data: topUsers, error: queryError } = await supabase
        .from('number_sequence_results')
        .select('user_identifier, time_taken')
        .eq('level', level)
        .gte('created_at', startOfDay)
        .lte('created_at', endOfDay)
        .order('time_taken', { ascending: true })
        .limit(5);

      if (queryError) {
        console.error(`Error querying level ${level}:`, queryError);
        continue;
      }

      if (!topUsers || topUsers.length === 0) {
        console.log(`No results found for level ${level}`);
        continue;
      }

      console.log(`Found ${topUsers.length} top users for level ${level}`);

      // Award rewards to top 5
      const rewardsToInsert = topUsers.map((user, index) => ({
        user_identifier: user.user_identifier,
        ranking_date: yesterdayStr,
        rank: index + 1,
        level: level,
        time_taken: user.time_taken,
        reward_amount: rewardAmounts[index],
      }));

      const { data: inserted, error: insertError } = await supabase
        .from('daily_ranking_rewards')
        .insert(rewardsToInsert)
        .select();

      if (insertError) {
        // Log error but continue - might be duplicate entries
        console.error(`Error inserting rewards for level ${level}:`, insertError);
      } else {
        totalRewardsGiven += inserted?.length || 0;
        console.log(`Successfully awarded ${inserted?.length} rewards for level ${level}`);
      }
    }

    console.log(`Daily ranking rewards process completed. Total rewards given: ${totalRewardsGiven}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Daily ranking rewards processed for ${yesterdayStr}`,
        totalRewardsGiven,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in daily-ranking-rewards function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});