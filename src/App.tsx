import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";

// 메인 페이지는 즉시 로드
import Index from "./pages/Index";

// 나머지 페이지들은 lazy loading으로 코드 스플리팅
const Auth = lazy(() => import("./pages/Auth"));
const MissionCenter = lazy(() => import("./pages/MissionCenter"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const ReactionGame = lazy(() => import("./pages/ReactionGame"));
const GemGame = lazy(() => import("./pages/GemGame"));
const FortuneGame = lazy(() => import("./pages/FortuneGame"));
const MemoryGame = lazy(() => import("./pages/MemoryGame"));
const QuizGame = lazy(() => import("./pages/QuizGame"));
const QuizGameResult = lazy(() => import("./pages/QuizGameResult"));
const NumberSequenceGame = lazy(() => import("./pages/NumberSequenceGame"));
const LadderGame = lazy(() => import("./pages/LadderGame"));
const RockPaperScissorsGame = lazy(() => import("./pages/RockPaperScissorsGame"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

// 로딩 컴포넌트
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-secondary/20">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-muted-foreground">로딩 중...</p>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/missions" element={<MissionCenter />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/reaction" element={<ReactionGame />} />
            <Route path="/gem" element={<GemGame />} />
            <Route path="/fortune" element={<FortuneGame />} />
            <Route path="/memory" element={<MemoryGame />} />
            <Route path="/quiz" element={<QuizGame />} />
            <Route path="/quiz/result" element={<QuizGameResult />} />
            <Route path="/number-sequence" element={<NumberSequenceGame />} />
            <Route path="/ladder" element={<LadderGame />} />
            <Route path="/rock-paper-scissors" element={<RockPaperScissorsGame />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
