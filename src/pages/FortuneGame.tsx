import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";

const fortunes = [
  {
    summary: "오늘은 마음의 여유를 갖고 차분하게 하루를 보내는 것이 좋습니다. 무리하지 말고, 자신의 페이스를 유지하세요. 예상치 못한 기회가 찾아올 수 있으며, 긍정적인 태도가 당신을 빛나게 해줄 것입니다. 주변 사람들과의 관계에서도 유쾌한 소통이 이루어지는 날이니, 적극적으로 나서보세요.",
    score: 65,
    luckyNumber: 7,
    luckyColor: "하늘색"
  },
  {
    summary: "오늘은 긍정적인 에너지가 가득한 날로, 활기차게 보내보세요! 활발한 활동이 좋은 결과를 가져다 줄 수 있습니다. 새로운 아이디어나 계획을 실행하기에 적절한 시기이며, 주위 사람들과의 협력이 큰 도움이 될 것입니다.",
    score: 90,
    luckyNumber: 3,
    luckyColor: "연두색"
  },
  {
    summary: "신중함이 필요한 하루입니다. 급하게 결정하기보다는 천천히 생각해보는 시간을 가지세요. 작은 실수가 큰 문제로 이어질 수 있으니 꼼꼼하게 체크하는 것이 중요합니다. 하지만 너무 걱정하지 마세요. 차분한 대처가 좋은 결과를 만들어낼 것입니다.",
    score: 55,
    luckyNumber: 8,
    luckyColor: "회색"
  },
  {
    summary: "행운이 가득한 날입니다! 오늘 하루는 무엇을 하든 순조롭게 풀릴 것입니다. 평소 망설였던 일이 있다면 오늘 시작해보세요. 주변 사람들에게도 좋은 기운을 나눠주면서 함께 즐거운 하루를 보내시기 바랍니다.",
    score: 95,
    luckyNumber: 1,
    luckyColor: "금색"
  }
];

const FortuneGame = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [result, setResult] = useState<typeof fortunes[0] | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !birthdate) {
      return;
    }

    const fortune = fortunes[Math.floor(Math.random() * fortunes.length)];
    setResult(fortune);
  };

  const resetForm = () => {
    setResult(null);
    setName("");
    setBirthdate("");
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

        {!result ? (
          <Card className="shadow-xl border-2 border-orange-200">
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl text-center">나의 운세 보기</CardTitle>
              <CardDescription className="text-center text-base">
                정보를 입력하고 오늘의 운세를 확인하세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">이름</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="이름을 입력하세요"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthdate">생년월일</Label>
                  <Input
                    id="birthdate"
                    type="date"
                    value={birthdate}
                    onChange={(e) => setBirthdate(e.target.value)}
                    required
                    className="text-base"
                  />
                </div>

                <Button type="submit" className="w-full text-base" size="lg">
                  <Sparkles className="mr-2 h-5 w-5" />
                  운세 보기
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-xl border-2 border-orange-200 bg-gradient-to-br from-yellow-50 to-orange-50">
            <CardHeader>
              <CardTitle className="text-2xl text-center text-orange-700">
                {name}님의 오늘의 운세
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="bg-white/70 rounded-lg p-4 shadow-sm">
                  <h3 className="text-lg font-bold text-orange-600 mb-2 flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    오늘의 운세
                  </h3>
                  <p className="text-base leading-relaxed text-foreground">
                    {result.summary}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white/70 rounded-lg p-4 shadow-sm">
                    <h3 className="text-base font-bold text-orange-600 mb-2">운세 점수</h3>
                    <p className="text-3xl font-black text-orange-700">{result.score} / 100</p>
                  </div>

                  <div className="bg-white/70 rounded-lg p-4 shadow-sm">
                    <h3 className="text-base font-bold text-orange-600 mb-2">행운의 숫자</h3>
                    <p className="text-3xl font-black text-orange-700">{result.luckyNumber}</p>
                  </div>
                </div>

                <div className="bg-white/70 rounded-lg p-4 shadow-sm">
                  <h3 className="text-base font-bold text-orange-600 mb-2">행운의 컬러</h3>
                  <p className="text-xl font-bold text-orange-700">{result.luckyColor}</p>
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
