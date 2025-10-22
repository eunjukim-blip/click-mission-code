import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Check, X } from "lucide-react";

interface Question {
  question: string;
  answer: boolean;
  explanation: string;
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
  const [retryCount, setRetryCount] = useState(0);
  const [canRetry, setCanRetry] = useState(true);

  useEffect(() => {
    checkRetryLimit();
  }, []);

  const checkRetryLimit = () => {
    const today = new Date().toDateString();
    const savedDate = localStorage.getItem('quiz_retry_date');
    const savedCount = localStorage.getItem('quiz_retry_count');

    if (savedDate !== today) {
      localStorage.setItem('quiz_retry_date', today);
      localStorage.setItem('quiz_retry_count', '0');
      setRetryCount(0);
      setCanRetry(true);
    } else {
      const count = parseInt(savedCount || '0');
      setRetryCount(count);
      setCanRetry(count < 3);
    }
  };

  const handleRetry = () => {
    const count = retryCount + 1;
    localStorage.setItem('quiz_retry_count', count.toString());
    setRetryCount(count);
    window.location.reload();
  };

  useEffect(() => {
    loadQuiz();
  }, []);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      const today = new Date().toDateString();
      const uniqueId = Date.now();
      
      // 이전에 풀었던 문제들 조회
      const userIdentifier = localStorage.getItem('user_id') || crypto.randomUUID();
      localStorage.setItem('user_id', userIdentifier);
      
      const { data: previousData } = await supabase
        .from('quiz_completions')
        .select('question')
        .eq('user_identifier', userIdentifier)
        .not('question', 'is', null);
      
      const previousQuestions = previousData?.map(item => item.question) || [];
      
      const { data, error } = await supabase.functions.invoke('generate-quiz', {
        body: { 
          date: `${today}-${uniqueId}`,
          previousQuestions 
        }
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
    const finalScore = score + (userAnswer === questions[currentIndex].answer ? 1 : 0);
    
    // 퀴즈 완료 저장
    try {
      const userIdentifier = localStorage.getItem('user_id') || crypto.randomUUID();
      localStorage.setItem('user_id', userIdentifier);
      
      await supabase.from('quiz_completions').insert({
        user_identifier: userIdentifier,
        score: finalScore,
        completion_date: new Date().toISOString().split('T')[0],
        question: questions[currentIndex].question
      });
    } catch (error) {
      console.error('Error saving completion:', error);
    }

    // 결과 페이지로 이동
    navigate('/quiz/result', { 
      state: { 
        score: finalScore, 
        totalQuestions: questions.length,
        question: questions[currentIndex].question,
        correctAnswer: questions[currentIndex].answer,
        userAnswer: userAnswer,
        explanation: questions[currentIndex].explanation
      } 
    });
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
              <CardTitle className="text-2xl">경제상식 OX퀴즈</CardTitle>
              <div className="text-lg font-bold">
                1/1
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <div className="text-sm text-muted-foreground">
                최신 금융/보험 및 경제 뉴스 기반 상식
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
                <Button onClick={handleNext} className="w-full" size="lg">
                  결과 보기
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
