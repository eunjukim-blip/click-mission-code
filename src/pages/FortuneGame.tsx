import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";


type Zodiac = "쥐" | "소" | "호랑이" | "토끼" | "용" | "뱀" | "말" | "양" | "원숭이" | "닭" | "개" | "돼지";

// 띠별 기준 연도 (쥐띠 = 0, 소띠 = 1, ..., 돼지띠 = 11)
const zodiacBaseYears: Record<Zodiac, number> = {
  "쥐": 0, "소": 1, "호랑이": 2, "토끼": 3, "용": 4, "뱀": 5,
  "말": 6, "양": 7, "원숭이": 8, "닭": 9, "개": 10, "돼지": 11
};

// 띠별 이모지
const zodiacEmojis: Record<Zodiac, string> = {
  "쥐": "🐭", "소": "🐮", "호랑이": "🐯", "토끼": "🐰",
  "용": "🐲", "뱀": "🐍", "말": "🐴", "양": "🐑",
  "원숭이": "🐵", "닭": "🐔", "개": "🐕", "돼지": "🐷"
};

// 연도별로 다른 운세를 생성하기 위한 운세 패턴들
const fortunePatterns = [
  {
    summary: "오늘은 새로운 기회가 찾아올 수 있는 날입니다. 예상치 못한 행운이 함께하니 적극적으로 도전해보세요. 재물운도 좋은 편이니 투자나 사업 관련 결정을 내리기 좋은 시기입니다.",
    score: 85,
    luckyColor: "파란색"
  },
  {
    summary: "차분하고 성실한 태도가 빛을 발하는 날입니다. 묵묵히 자신의 일에 집중하면 좋은 결과를 얻을 수 있습니다. 건강에 유의하고 충분한 휴식을 취하세요.",
    score: 75,
    luckyColor: "갈색"
  },
  {
    summary: "활력이 넘치는 하루가 될 것입니다. 리더십을 발휘할 기회가 많아지니 자신감을 가지고 앞장서세요. 단, 지나친 독단은 피하고 주변의 의견도 경청하세요.",
    score: 90,
    luckyColor: "주황색"
  },
  {
    summary: "평화롭고 안정적인 하루가 예상됩니다. 주변 사람들과의 관계가 원만하며, 협력을 통해 좋은 성과를 낼 수 있습니다. 예술이나 창작 활동에도 좋은 날입니다.",
    score: 80,
    luckyColor: "분홍색"
  },
  {
    summary: "큰 성공을 거둘 수 있는 날입니다! 야심찬 계획을 실행에 옮기기 좋은 시기이며, 주변의 도움도 많이 받을 수 있습니다. 자신감을 가지고 도전하세요.",
    score: 95,
    luckyColor: "금색"
  },
  {
    summary: "직관력이 뛰어난 하루입니다. 중요한 결정을 내려야 한다면 자신의 감을 믿어보세요. 다만 비밀이 누설되지 않도록 조심하고, 신중한 행동이 필요합니다.",
    score: 70,
    luckyColor: "초록색"
  },
  {
    summary: "활동적이고 역동적인 하루가 될 것입니다. 여행이나 새로운 장소 방문이 행운을 가져다줄 수 있습니다. 에너지가 넘치니 운동이나 야외 활동을 즐겨보세요.",
    score: 88,
    luckyColor: "빨간색"
  },
  {
    summary: "따뜻한 마음이 복을 부르는 날입니다. 가족이나 친구들과 좋은 시간을 보내세요. 예술적 감각이 빛을 발하니 창작 활동에도 좋은 날입니다.",
    score: 78,
    luckyColor: "연두색"
  },
  {
    summary: "재치와 유머가 빛나는 하루입니다. 사교 활동이나 네트워킹에 좋은 날이니 적극적으로 사람들을 만나보세요. 새로운 아이디어가 떠오를 수 있습니다.",
    score: 82,
    luckyColor: "노란색"
  },
  {
    summary: "계획적이고 체계적인 하루를 보내세요. 일찍 일어나서 하루를 시작하면 더 많은 것을 성취할 수 있습니다. 시간 관리를 잘하면 모든 일이 순조롭게 풀립니다.",
    score: 77,
    luckyColor: "흰색"
  },
  {
    summary: "충성심과 정직함이 인정받는 날입니다. 진실된 마음으로 사람들을 대하면 좋은 관계를 맺을 수 있습니다. 도움이 필요한 사람을 돕는 것도 복이 됩니다.",
    score: 84,
    luckyColor: "회색"
  },
  {
    summary: "풍요와 행운이 가득한 하루입니다. 재물운이 특히 좋으니 금전 관련 일에 좋은 결과를 기대할 수 있습니다. 여유로운 마음으로 하루를 즐기세요.",
    score: 92,
    luckyColor: "보라색"
  },
  {
    summary: "오늘은 인내심이 필요한 날입니다. 급하게 서두르기보다는 차근차근 진행하는 것이 좋습니다. 작은 성취들이 모여 큰 성공을 만들어낼 것입니다.",
    score: 68,
    luckyColor: "베이지색"
  },
  {
    summary: "창의력이 샘솟는 날입니다. 평소 생각하지 못했던 아이디어들이 떠오를 수 있으니 메모를 잘 해두세요. 새로운 시도가 좋은 결과를 가져올 것입니다.",
    score: 86,
    luckyColor: "민트색"
  },
  {
    summary: "사랑과 우정의 운이 좋은 날입니다. 소중한 사람들에게 마음을 전하기 좋은 시기입니다. 따뜻한 대화와 소통이 관계를 더욱 돈독하게 만들어줄 것입니다.",
    score: 89,
    luckyColor: "핑크색"
  }
];

// 띠, 연도, 날짜를 모두 조합해서 매일/띠별/연도별로 다른 운세 생성
const getFortuneForYear = (zodiac: Zodiac, year: number) => {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
  
  // 띠별 고유값
  const zodiacValue = zodiacBaseYears[zodiac];
  
  // 띠 + 연도 + 날짜를 조합하여 고유한 인덱스 생성
  const combinedValue = (zodiacValue * 1000) + year + (dayOfYear * 17);
  const index = Math.abs(combinedValue) % fortunePatterns.length;
  const fortune = fortunePatterns[index];
  
  // 띠, 연도, 날짜 기반으로 행운의 숫자도 매번 다르게
  const luckyNumber = ((zodiacValue * 5 + year * 7 + dayOfYear * 3) % 12) + 1;
  return { ...fortune, luckyNumber };
};

// 현재 연도 기준으로 10세~100세에 해당하는 출생연도 계산
const getZodiacYears = (zodiac: Zodiac): number[] => {
  const currentYear = 2025;
  const minAge = 10;
  const maxAge = 100;
  const years: number[] = [];
  
  const baseOffset = zodiacBaseYears[zodiac];
  
  for (let age = minAge; age <= maxAge; age++) {
    const birthYear = currentYear - age;
    // 12년 주기로 체크
    if ((birthYear - 1924 - baseOffset) % 12 === 0) {
      years.push(birthYear);
    }
  }
  
  return years.sort((a, b) => b - a); // 최신순 정렬
};

const zodiacList: Zodiac[] = ["쥐", "소", "호랑이", "토끼", "용", "뱀", "말", "양", "원숭이", "닭", "개", "돼지"];

const FortuneGame = () => {
  const navigate = useNavigate();
  const [selectedZodiac, setSelectedZodiac] = useState<Zodiac | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const handleZodiacSelect = (zodiac: Zodiac) => {
    setSelectedZodiac(zodiac);
    setSelectedYear(null);
  };

  const handleYearSelect = (year: number) => {
    setSelectedYear(year);
  };

  const resetForm = () => {
    setSelectedZodiac(null);
    setSelectedYear(null);
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
              <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                {zodiacList.map((zodiac) => (
                  <button
                    key={zodiac}
                    onClick={() => handleZodiacSelect(zodiac)}
                    className="flex flex-col items-center justify-center p-6 rounded-lg border-2 border-orange-200 hover:border-orange-400 hover:bg-orange-50 transition-all hover:scale-105 active:scale-95"
                  >
                    <span className="text-5xl mb-2">{zodiacEmojis[zodiac]}</span>
                    <span className="text-base font-bold text-foreground">{zodiac}띠</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : !selectedYear ? (
          <Card className="shadow-xl border-2 border-orange-200">
            <CardHeader className="space-y-2">
              <div className="flex items-center justify-center gap-3 mb-2">
                <span className="text-5xl">{zodiacEmojis[selectedZodiac]}</span>
                <CardTitle className="text-2xl">{selectedZodiac}띠</CardTitle>
              </div>
              <CardDescription className="text-center text-base">
                태어난 연도를 선택하세요
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                {getZodiacYears(selectedZodiac).map((year) => (
                  <button
                    key={year}
                    onClick={() => handleYearSelect(year)}
                    className="p-4 rounded-lg border-2 border-orange-200 hover:border-orange-400 hover:bg-orange-50 transition-all hover:scale-105 active:scale-95 text-lg font-semibold"
                  >
                    {year}년
                  </button>
                ))}
              </div>
              <Button
                onClick={() => setSelectedZodiac(null)}
                variant="outline"
                className="w-full"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                띠 다시 선택
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-xl border-2 border-orange-200 bg-gradient-to-br from-yellow-50 to-orange-50">
            <CardHeader>
              <CardTitle className="text-2xl text-center text-orange-700 flex items-center justify-center gap-3">
                <span className="text-5xl">{zodiacEmojis[selectedZodiac]}</span>
                {selectedZodiac}띠 ({selectedYear}년생) 오늘의 운세
              </CardTitle>
              <CardDescription className="text-center text-base">
                {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })} · {2025 - selectedYear}세
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
                    {getFortuneForYear(selectedZodiac, selectedYear).summary}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white/70 rounded-lg p-4 shadow-sm">
                    <h3 className="text-base font-bold text-orange-600 mb-2">운세 점수</h3>
                    <p className="text-3xl font-black text-orange-700">{getFortuneForYear(selectedZodiac, selectedYear).score} / 100</p>
                  </div>

                  <div className="bg-white/70 rounded-lg p-4 shadow-sm">
                    <h3 className="text-base font-bold text-orange-600 mb-2">행운의 숫자</h3>
                    <p className="text-3xl font-black text-orange-700">{getFortuneForYear(selectedZodiac, selectedYear).luckyNumber}</p>
                  </div>
                </div>

                <div className="bg-white/70 rounded-lg p-4 shadow-sm">
                  <h3 className="text-base font-bold text-orange-600 mb-2">행운의 컬러</h3>
                  <p className="text-xl font-bold text-orange-700">{getFortuneForYear(selectedZodiac, selectedYear).luckyColor}</p>
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
