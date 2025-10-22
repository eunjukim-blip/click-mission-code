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
      setGameFinished(true);
      const finalScore = score + (userAnswer === questions[currentIndex].answer ? 1 : 0);
      if (finalScore === 5) {
        toast.success("🎉 완벽합니다! 모든 문제를 맞추셨어요!");
      } else {
        toast.info(`게임 종료! ${finalScore}/5 정답`);
      }
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
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-3xl text-center">게임 종료!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-6xl mb-4">
                {score === 5 ? "🎉" : score >= 3 ? "😊" : "💪"}
              </p>
              <p className="text-2xl font-bold mb-2">
                최종 점수: {score}/5
              </p>
              <p className="text-muted-foreground">
                {score === 5 && "완벽합니다!"}
                {score === 4 && "훌륭해요!"}
                {score === 3 && "좋아요!"}
                {score < 3 && "다음엔 더 잘하실 거예요!"}
              </p>
            </div>
            <Button onClick={handleRestart} className="w-full" size="lg">
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
              <CardTitle className="text-2xl">OX 퀴즈</CardTitle>
              <div className="text-lg font-bold">
                {currentIndex + 1}/5
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <div className="text-sm text-muted-foreground">
                점수: {score}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-secondary/50 p-6 rounded-lg">
              <p className="text-xl text-center font-medium">
                {currentQuestion?.question}
              </p>
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
