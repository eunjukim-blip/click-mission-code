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
    const { date, previousQuestions = [] } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Generating quiz for date:", date);
    console.log("Previous questions to exclude:", previousQuestions.length);

    const excludeText = previousQuestions.length > 0 
      ? `\n\n다음 문제들은 이미 출제되었으므로 절대 포함하지 마세요:\n${previousQuestions.map((q: string, i: number) => `${i + 1}. ${q}`).join('\n')}`
      : '';

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
            content: `당신은 초급 수준의 경제 상식 OX 퀴즈 전문가입니다. 
경제를 처음 배우는 일반인도 쉽게 이해할 수 있는 기초적인 경제 개념과 용어 위주로 퀴즈를 생성합니다.

퀴즈는 다음 주제를 중심으로 구성해주세요:
- 기본적인 경제 용어 (예: 인플레이션, 금리, 환율 등의 기초 개념)
- 일상생활에서 자주 접하는 금융 상식 (예: 예금, 적금, 신용카드 등)
- 쉽게 이해할 수 있는 보험 기초 지식 (예: 보험의 종류, 기본 개념)
- 기초적인 저축과 소비 개념
- 누구나 알아야 할 기본적인 경제 원리

**중요**: 
- 전문 용어는 최대한 피하고, 사용할 경우 쉽게 풀어서 설명하세요
- 복잡한 금융 상품이나 최신 트렌드보다는 기본 개념에 집중하세요
- 초등학생도 이해할 수 있을 정도로 쉽고 명확하게 작성하세요
- 실생활에서 바로 적용 가능한 기초 상식 위주로 구성하세요

매번 다른 주제의 기초 퀴즈를 생성해주세요.${excludeText}`
          },
          {
            role: "user",
            content: `초급 수준의 기초 경제 상식 OX 퀴즈 1개를 생성해주세요. 
경제를 처음 배우는 사람도 쉽게 이해할 수 있는 기본 개념 위주로 만들어주세요.
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
