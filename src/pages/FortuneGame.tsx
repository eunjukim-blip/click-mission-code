import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";

type Zodiac = "쥐" | "소" | "호랑이" | "토끼" | "용" | "뱀" | "말" | "양" | "원숭이" | "닭" | "개" | "돼지";

const zodiacFortunes: Record<Zodiac, {
  summary: string;
  score: number;
  luckyNumber: number;
  luckyColor: string;
  emoji: string;
}> = {
  "쥐": {
    summary: "오늘은 새로운 기회가 찾아올 수 있는 날입니다. 예상치 못한 행운이 함께하니 적극적으로 도전해보세요. 재물운도 좋은 편이니 투자나 사업 관련 결정을 내리기 좋은 시기입니다.",
    score: 85,
    luckyNumber: 1,
    luckyColor: "파란색",
    emoji: "🐭"
  },
  "소": {
    summary: "차분하고 성실한 태도가 빛을 발하는 날입니다. 묵묵히 자신의 일에 집중하면 좋은 결과를 얻을 수 있습니다. 건강에 유의하고 충분한 휴식을 취하세요.",
    score: 75,
    luckyNumber: 2,
    luckyColor: "갈색",
    emoji: "🐮"
  },
  "호랑이": {
    summary: "활력이 넘치는 하루가 될 것입니다. 리더십을 발휘할 기회가 많아지니 자신감을 가지고 앞장서세요. 단, 지나친 독단은 피하고 주변의 의견도 경청하세요.",
    score: 90,
    luckyNumber: 3,
    luckyColor: "주황색",
    emoji: "🐯"
  },
  "토끼": {
    summary: "평화롭고 안정적인 하루가 예상됩니다. 주변 사람들과의 관계가 원만하며, 협력을 통해 좋은 성과를 낼 수 있습니다. 예술이나 창작 활동에도 좋은 날입니다.",
    score: 80,
    luckyNumber: 4,
    luckyColor: "분홍색",
    emoji: "🐰"
  },
  "용": {
    summary: "큰 성공을 거둘 수 있는 날입니다! 야심찬 계획을 실행에 옮기기 좋은 시기이며, 주변의 도움도 많이 받을 수 있습니다. 자신감을 가지고 도전하세요.",
    score: 95,
    luckyNumber: 5,
    luckyColor: "금색",
    emoji: "🐲"
  },
  "뱀": {
    summary: "직관력이 뛰어난 하루입니다. 중요한 결정을 내려야 한다면 자신의 감을 믿어보세요. 다만 비밀이 누설되지 않도록 조심하고, 신중한 행동이 필요합니다.",
    score: 70,
    luckyNumber: 6,
    luckyColor: "초록색",
    emoji: "🐍"
  },
  "말": {
    summary: "활동적이고 역동적인 하루가 될 것입니다. 여행이나 새로운 장소 방문이 행운을 가져다줄 수 있습니다. 에너지가 넘치니 운동이나 야외 활동을 즐겨보세요.",
    score: 88,
    luckyNumber: 7,
    luckyColor: "빨간색",
    emoji: "🐴"
  },
  "양": {
    summary: "따뜻한 마음이 복을 부르는 날입니다. 가족이나 친구들과 좋은 시간을 보내세요. 예술적 감각이 빛을 발하니 창작 활동에도 좋은 날입니다.",
    score: 78,
    luckyNumber: 8,
    luckyColor: "연두색",
    emoji: "🐑"
  },
  "원숭이": {
    summary: "재치와 유머가 빛나는 하루입니다. 사교 활동이나 네트워킹에 좋은 날이니 적극적으로 사람들을 만나보세요. 새로운 아이디어가 떠오를 수 있습니다.",
    score: 82,
    luckyNumber: 9,
    luckyColor: "노란색",
    emoji: "🐵"
  },
  "닭": {
    summary: "계획적이고 체계적인 하루를 보내세요. 일찍 일어나서 하루를 시작하면 더 많은 것을 성취할 수 있습니다. 시간 관리를 잘하면 모든 일이 순조롭게 풀립니다.",
    score: 77,
    luckyNumber: 10,
    luckyColor: "흰색",
    emoji: "🐔"
  },
  "개": {
    summary: "충성심과 정직함이 인정받는 날입니다. 진실된 마음으로 사람들을 대하면 좋은 관계를 맺을 수 있습니다. 도움이 필요한 사람을 돕는 것도 복이 됩니다.",
    score: 84,
    luckyNumber: 11,
    luckyColor: "갈색",
    emoji: "🐕"
  },
  "돼지": {
    summary: "풍요와 행운이 가득한 하루입니다. 재물운이 특히 좋으니 금전 관련 일에 좋은 결과를 기대할 수 있습니다. 여유로운 마음으로 하루를 즐기세요.",
    score: 92,
    luckyNumber: 12,
    luckyColor: "보라색",
    emoji: "🐷"
  }
};

const zodiacList: Zodiac[] = ["쥐", "소", "호랑이", "토끼", "용", "뱀", "말", "양", "원숭이", "닭", "개", "돼지"];

const FortuneGame = () => {
  const navigate = useNavigate();
  const [selectedZodiac, setSelectedZodiac] = useState<Zodiac | null>(null);

  const handleZodiacSelect = (zodiac: Zodiac) => {
    setSelectedZodiac(zodiac);
  };

  const resetForm = () => {
    setSelectedZodiac(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-4 pb-16">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl md:text-4xl font-black text-orange-600 flex items-center gap-2">
            <Sparkles className="h-8 w-8" />
            오늘의 운세
          </h1>
        </div>

        {!selectedZodiac ? (
          <Card className="shadow-xl border-2 border-orange-200">
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl text-center">띠를 선택하세요</CardTitle>
              <CardDescription className="text-center text-base">
                나의 띠를 선택하고 오늘의 운세를 확인하세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {zodiacList.map((zodiac) => (
                  <button
                    key={zodiac}
                    onClick={() => handleZodiacSelect(zodiac)}
                    className="flex flex-col items-center justify-center p-4 rounded-lg border-2 border-orange-200 hover:border-orange-400 hover:bg-orange-50 transition-all hover:scale-105 active:scale-95"
                  >
                    <span className="text-4xl mb-2">{zodiacFortunes[zodiac].emoji}</span>
                    <span className="text-base font-bold text-foreground">{zodiac}띠</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-xl border-2 border-orange-200 bg-gradient-to-br from-yellow-50 to-orange-50">
            <CardHeader>
              <CardTitle className="text-2xl text-center text-orange-700 flex items-center justify-center gap-3">
                <span className="text-5xl">{zodiacFortunes[selectedZodiac].emoji}</span>
                {selectedZodiac}띠 오늘의 운세
              </CardTitle>
              <CardDescription className="text-center text-base">
                {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="bg-white/70 rounded-lg p-4 shadow-sm">
                  <h3 className="text-lg font-bold text-orange-600 mb-2 flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    오늘의 운세
                  </h3>
                  <p className="text-base leading-relaxed text-foreground">
                    {zodiacFortunes[selectedZodiac].summary}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white/70 rounded-lg p-4 shadow-sm">
                    <h3 className="text-base font-bold text-orange-600 mb-2">운세 점수</h3>
                    <p className="text-3xl font-black text-orange-700">{zodiacFortunes[selectedZodiac].score} / 100</p>
                  </div>

                  <div className="bg-white/70 rounded-lg p-4 shadow-sm">
                    <h3 className="text-base font-bold text-orange-600 mb-2">행운의 숫자</h3>
                    <p className="text-3xl font-black text-orange-700">{zodiacFortunes[selectedZodiac].luckyNumber}</p>
                  </div>
                </div>

                <div className="bg-white/70 rounded-lg p-4 shadow-sm">
                  <h3 className="text-base font-bold text-orange-600 mb-2">행운의 컬러</h3>
                  <p className="text-xl font-bold text-orange-700">{zodiacFortunes[selectedZodiac].luckyColor}</p>
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <Button 
                  onClick={resetForm} 
                  variant="outline" 
                  className="w-full text-base border-2 border-orange-300" 
                  size="lg"
                >
                  다시 보기
                </Button>
                <Button 
                  onClick={() => navigate("/")} 
                  className="w-full text-base" 
                  size="lg"
                >
                  홈으로 돌아가기
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default FortuneGame;
