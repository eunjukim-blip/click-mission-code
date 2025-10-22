import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const QuizGameResult = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [retryCount, setRetryCount] = useState(0);
  const [canRetry, setCanRetry] = useState(true);

  const { 
    score, 
    totalQuestions, 
    question, 
    correctAnswer, 
    userAnswer, 
    explanation 
  } = location.state || { 
    score: 0, 
    totalQuestions: 1, 
    question: '', 
    correctAnswer: false, 
    userAnswer: null, 
    explanation: '' 
  };
  
  const isPerfect = score === totalQuestions;
  const isCorrect = userAnswer === correctAnswer;

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
    navigate('/quiz');
    window.location.reload();
  };

  const handleRestart = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-3xl text-center">
            {isPerfect ? "🎉 완벽합니다!" : "😢 아쉽네요!"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 문제와 정답 표시 */}
          <div className="space-y-4">
            <div className="bg-secondary/50 p-6 rounded-lg">
              <p className="text-lg font-medium mb-4">
                {question}
              </p>
              <div className="flex items-center gap-2 mb-4">
                <span className="font-semibold">내 답변:</span>
                <span className={isCorrect ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                  {userAnswer === true ? "O" : "X"}
                </span>
                {isCorrect ? "✅" : "❌"}
              </div>
              <div className="bg-primary/10 p-4 rounded-lg">
                <p className="font-semibold mb-2">해설</p>
                <p className="text-sm text-muted-foreground">
                  {explanation}
                </p>
              </div>
            </div>
          </div>

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
                <Button 
                  onClick={handleRetry} 
                  className="w-full"
                  disabled={!canRetry}
                >
                  {canRetry ? `광고 보고 다시 풀기 (${3 - retryCount}회 남음)` : '오늘 재시도 횟수를 모두 사용했습니다'}
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

          {/* 오퍼월 광고 영역 */}
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">추천 상품</h3>
              <p className="text-sm text-primary font-bold">
                💰 여기서 적립받으면 10% 추가적립!
              </p>
            </div>
            <div className="w-full bg-secondary/30 p-6 rounded-lg text-center">
              <div className="h-48 flex items-center justify-center bg-background/50 rounded">
                <p className="text-sm text-muted-foreground">오퍼월 광고 영역</p>
              </div>
            </div>
          </div>

          <Button onClick={handleRestart} className="w-full" size="lg" variant="outline">
            홈으로 돌아가기
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizGameResult;
