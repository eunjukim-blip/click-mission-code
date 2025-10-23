import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import MissionCenter from "./pages/MissionCenter";
import AdminDashboard from "./pages/AdminDashboard";
import ReactionGame from "./pages/ReactionGame";
import GemGame from "./pages/GemGame";
import FortuneGame from "./pages/FortuneGame";
import MemoryGame from "./pages/MemoryGame";
import QuizGame from "./pages/QuizGame";
import QuizGameResult from "./pages/QuizGameResult";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/missions" element={<MissionCenter />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/reaction" element={<ReactionGame />} />
          <Route path="/gem" element={<GemGame />} />
          <Route path="/fortune" element={<FortuneGame />} />
          <Route path="/memory" element={<MemoryGame />} />
          <Route path="/quiz" element={<QuizGame />} />
          <Route path="/quiz/result" element={<QuizGameResult />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
