import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Check, X, ExternalLink } from "lucide-react";

interface Question {
  question: string;
  answer: boolean;
  explanation: string;
}

interface Product {
  id: string;
  name: string;
  link: string;
  reward_amount: number;
  category: string;
  description: string;
  image_url?: string;
}

const QuizGame = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [userAnswer, setUserAnswer] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [gameFinished, setGameFinished] = useState(false);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    loadQuiz();
  }, []);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      const today = new Date().toDateString();
      
      const { data, error } = await supabase.functions.invoke('generate-quiz', {
        body: { date: today }
      });

      if (error) {
        console.error('Error loading quiz:', error);
        toast.error("퀴즈를 불러오는데 실패했습니다");
        return;
      }

      console.log('Quiz data:', data);
      setQuestions(data.questions);
    } catch (error) {
      console.error('Error:', error);
      toast.error("퀴즈를 불러오는데 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (answer: boolean) => {
    if (answered) return;

    setUserAnswer(answer);
    setAnswered(true);

    const correct = answer === questions[currentIndex].answer;
    if (correct) {
      setScore(score + 1);
      toast.success("정답입니다! 🎉");
    } else {
      toast.error("오답입니다 😢");
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setAnswered(false);
      setUserAnswer(null);
    } else {
      finishGame();
    }
  };

  const finishGame = async () => {
    setGameFinished(true);
    const finalScore = score + (userAnswer === questions[currentIndex].answer ? 1 : 0);
    
    // 퀴즈 완료 저장
    try {
      const userIdentifier = localStorage.getItem('user_id') || crypto.randomUUID();
      localStorage.setItem('user_id', userIdentifier);
      
      await supabase.from('quiz_completions').insert({
        user_identifier: userIdentifier,
        score: finalScore,
        completion_date: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      console.error('Error saving completion:', error);
    }

    // 상품 추천 받기
    setLoadingProducts(true);
    try {
      const quizTopics = questions.map(q => q.question);
      const { data, error } = await supabase.functions.invoke('recommend-products', {
        body: { quizTopics }
      });

      if (error) {
        console.error('Error loading products:', error);
      } else if (data?.products) {
        setRecommendedProducts(data.products);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoadingProducts(false);
    }

    if (finalScore === 3) {
      toast.success("🎉 완벽합니다! 모든 문제를 맞추셨어요!");
    } else {
      toast.info(`게임 종료! ${finalScore}/3 정답`);
    }
  };

  const handleRestart = () => {
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-lg">오늘의 퀴즈를 준비하고 있어요...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (gameFinished) {
    const finalScore = score + (userAnswer === questions[currentIndex].answer ? 1 : 0);
    const isPerfect = finalScore === questions.length;
    
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-3xl text-center">
              {isPerfect ? "🎉 완벽합니다!" : "😢 아쉽네요!"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {!isPerfect && (
              <>
                <div className="text-center">
                  <p className="text-lg text-muted-foreground mb-4">
                    다시 도전해보세요!
                  </p>
                </div>

                {/* 광고 보고 다시풀기 */}
                <div className="w-full bg-secondary/30 p-4 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground mb-2">광고를 시청하고 다시 풀기</p>
                  <div className="h-32 flex items-center justify-center bg-background/50 rounded mb-3">
                    <p className="text-xs text-muted-foreground">AdSense 배너 영역</p>
                  </div>
                  <Button onClick={() => window.location.reload()} className="w-full">
                    광고 보고 다시 풀기
                  </Button>
                </div>
              </>
            )}

            {isPerfect && (
              <div className="text-center">
                <p className="text-6xl mb-4">🎉</p>
                <p className="text-lg text-muted-foreground">
                  모든 문제를 맞추셨습니다!
                </p>
              </div>
            )}

            {/* Google AdSense 배너 */}
            <div className="w-full bg-secondary/30 p-4 rounded-lg text-center">
              <p className="text-sm text-muted-foreground mb-2">광고</p>
              <div className="h-24 flex items-center justify-center bg-background/50 rounded">
                <p className="text-xs text-muted-foreground">AdSense 배너 영역</p>
              </div>
            </div>

            {/* 오퍼월 상품 추천 */}
            {loadingProducts ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">추천 상품을 불러오는 중...</p>
              </div>
            ) : recommendedProducts.length > 0 && (
              <div className="space-y-4">
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold">추천 상품</h3>
                  <p className="text-sm text-primary font-bold">
                    💰 리워드 받으면 100원 추가 적립!
                  </p>
                </div>
                <div className="space-y-3">
                  {recommendedProducts.map((product) => (
                    <Card key={product.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          {product.image_url && (
                            <img 
                              src={product.image_url} 
                              alt={product.name}
                              className="w-16 h-16 object-cover rounded"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm mb-1">{product.name}</h4>
                            {product.description && (
                              <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                                {product.description}
                              </p>
                            )}
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-sm font-bold text-primary">
                                {product.reward_amount.toLocaleString()}원 + 100원 적립
                              </span>
                              <Button
                                size="sm"
                                onClick={() => window.open(product.link, '_blank')}
                                className="gap-1"
                              >
                                적립받기
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <Button onClick={handleRestart} className="w-full" size="lg" variant="outline">
              홈으로 돌아가기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-4">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          돌아가기
        </Button>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center mb-2">
              <CardTitle className="text-2xl">금융/경제 상식 퀴즈</CardTitle>
              <div className="text-lg font-bold">
                1/1
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <div className="text-sm text-muted-foreground">
                한국 시장 금융/보험 기초 상식
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-secondary/50 p-6 rounded-lg">
              <p className="text-xl text-center font-medium">
                {currentQuestion?.question}
              </p>
            </div>

            {/* Google AdSense 배너 */}
            <div className="w-full bg-secondary/30 p-4 rounded-lg text-center">
              <p className="text-xs text-muted-foreground mb-2">광고</p>
              {/* Google AdSense 코드를 여기에 추가하세요 */}
              <div className="h-24 flex items-center justify-center bg-background/50 rounded">
                <p className="text-xs text-muted-foreground">AdSense 배너 영역</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                size="lg"
                variant={answered ? (userAnswer === true ? (questions[currentIndex].answer === true ? "default" : "destructive") : "outline") : "outline"}
                className="h-24 text-2xl"
                onClick={() => handleAnswer(true)}
                disabled={answered}
              >
                <div className="flex flex-col items-center gap-2">
                  <Check className="h-8 w-8" />
                  <span>O</span>
                </div>
              </Button>
              <Button
                size="lg"
                variant={answered ? (userAnswer === false ? (questions[currentIndex].answer === false ? "default" : "destructive") : "outline") : "outline"}
                className="h-24 text-2xl"
                onClick={() => handleAnswer(false)}
                disabled={answered}
              >
                <div className="flex flex-col items-center gap-2">
                  <X className="h-8 w-8" />
                  <span>X</span>
                </div>
              </Button>
            </div>

            {answered && (
              <div className="space-y-4">
                <div className="bg-primary/10 p-4 rounded-lg">
                  <p className="font-semibold mb-2">
                    정답: {questions[currentIndex].answer ? "O" : "X"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {currentQuestion?.explanation}
                  </p>
                </div>
                <Button onClick={handleNext} className="w-full" size="lg">
                  {currentIndex < questions.length - 1 ? "다음 문제" : "결과 보기"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuizGame;
