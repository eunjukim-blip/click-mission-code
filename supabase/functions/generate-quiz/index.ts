import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { date } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Generating quiz for date:", date);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `당신은 한국 금융/보험 및 경제 상식을 다루는 OX 퀴즈 전문가입니다. 
최신 경제 뉴스와 금융 트렌드를 반영한 한국 시장에 특화된 퀴즈를 생성합니다.
퀴즈는 다음 주제를 중심으로 구성해주세요:
- 최근 금융 정책 및 제도 변화 (예: 금리 인상/인하, 부동산 대출 규제 등)
- 최신 보험 상품 트렌드 및 보장 내용 (예: 실손보험 개편, 자동차보험 변경사항 등)
- 최근 경제 이슈 (예: 물가 상승, 환율 변동, 주식시장 동향 등)
- 한국의 최신 경제 정책 및 금융 규제
- 최신 재테크 및 개인 재무 관리 트렌드 (예: 디지털 자산, 연금 개편 등)

매번 다른 주제의 퀴즈를 생성하고, 최신 뉴스와 시장 동향을 반영해주세요.
실생활에 유용하고 일반인이 알아두면 좋을 최신 금융/경제 정보 위주로 작성해주세요.`
          },
          {
            role: "user",
            content: `최신 경제 뉴스나 금융 트렌드를 반영한 한국 시장 금융/보험 및 경제 상식 OX 퀴즈 1개를 생성해주세요. 
매번 다른 주제로 다양한 문제를 만들어주세요. JSON 형식으로만 응답해주세요.`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_quiz",
              description: "Generate 1 OX quiz question about Korean financial/insurance basics",
              parameters: {
                type: "object",
                properties: {
                  questions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        question: { type: "string" },
                        answer: { type: "boolean" },
                        explanation: { type: "string" }
                      },
                      required: ["question", "answer", "explanation"],
                      additionalProperties: false
                    },
                    minItems: 1,
                    maxItems: 1
                  }
                },
                required: ["questions"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "generate_quiz" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI 사용량이 초과되었습니다." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI response:", JSON.stringify(data));

    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error("No tool call in response");
    }

    const quizData = JSON.parse(toolCall.function.arguments);
    
    return new Response(
      JSON.stringify(quizData),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-quiz function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
