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
    const { quizTopics } = await req.json();
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("Quiz topics:", quizTopics);

    // 퀴즈 주제 키워드 추출
    const keywords = quizTopics.join(" ").toLowerCase();
    
    // 키워드와 매칭되는 상품 찾기
    const { data: products, error } = await supabase
      .from('offerwall_products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Database error:", error);
      throw error;
    }

    // 키워드 매칭 점수 계산
    const scoredProducts = products.map(product => {
      let score = 0;
      if (product.keywords) {
        for (const keyword of product.keywords) {
          if (keywords.includes(keyword.toLowerCase())) {
            score += 10;
          }
        }
      }
      
      // 카테고리 매칭
      if (keywords.includes(product.category.toLowerCase())) {
        score += 5;
      }
      
      return { ...product, score };
    });

    // 점수순으로 정렬하고 상위 3개 선택
    const recommendedProducts = scoredProducts
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    console.log("Recommended products:", recommendedProducts.length);

    return new Response(
      JSON.stringify({ products: recommendedProducts }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in recommend-products function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
