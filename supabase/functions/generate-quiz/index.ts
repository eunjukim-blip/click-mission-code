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
            content: `당신은 흥미롭고 재미있는 OX 퀴즈를 만드는 전문가입니다. 
주어진 날짜를 기반으로 그 날에 일어난 역사적 사건, 기념일, 유명인 생일 등과 관련된 5개의 OX 퀴즈를 생성합니다.
퀴즈는 해당 날짜와 직접적으로 연관된 내용이어야 하며, 각 퀴즈는 명확하고 흥미로우며, 정답이 분명해야 합니다.
예를 들어:
- 이 날 태어난 유명인
- 이 날 일어난 역사적 사건
- 이 날이 기념일인 것들
- 이 날과 관련된 문화적 사건`
          },
          {
            role: "user",
            content: `${date} 날짜와 관련된 5개의 OX 퀴즈를 생성해주세요. 이 날짜에 실제로 일어난 역사적 사건, 기념일, 유명인 생일 등을 포함해주세요. JSON 형식으로만 응답해주세요.`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_quiz",
              description: "Generate 5 OX quiz questions",
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
                    minItems: 5,
                    maxItems: 5
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
