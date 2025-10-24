-- 사용자 통계 및 레벨 시스템 테이블
CREATE TABLE IF NOT EXISTS public.user_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  level INTEGER NOT NULL DEFAULT 1,
  experience INTEGER NOT NULL DEFAULT 0,
  total_games_played INTEGER NOT NULL DEFAULT 0,
  login_streak INTEGER NOT NULL DEFAULT 0,
  last_login_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- 데일리 미션 정의 테이블
CREATE TABLE IF NOT EXISTS public.daily_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_type TEXT NOT NULL, -- 'play_quiz', 'play_rps', 'play_ladder', 'complete_offerwall' 등
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  target_count INTEGER NOT NULL DEFAULT 1,
  reward_points INTEGER NOT NULL,
  reward_exp INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 사용자 미션 진행 상황 테이블
CREATE TABLE IF NOT EXISTS public.user_mission_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mission_id UUID NOT NULL REFERENCES public.daily_missions(id) ON DELETE CASCADE,
  current_count INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  mission_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, mission_id, mission_date)
);

-- 출석 체크 테이블
CREATE TABLE IF NOT EXISTS public.daily_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  attendance_date DATE NOT NULL DEFAULT CURRENT_DATE,
  reward_points INTEGER NOT NULL DEFAULT 0,
  consecutive_days INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, attendance_date)
);

-- 게임 활동 로그 테이블
CREATE TABLE IF NOT EXISTS public.game_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_type TEXT NOT NULL, -- 'quiz', 'rps', 'ladder', 'memory', 'reaction' 등
  points_earned INTEGER NOT NULL DEFAULT 0,
  exp_earned INTEGER NOT NULL DEFAULT 0,
  result JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 주간 랭킹 테이블
CREATE TABLE IF NOT EXISTS public.weekly_rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL,
  total_points INTEGER NOT NULL DEFAULT 0,
  total_games INTEGER NOT NULL DEFAULT 0,
  rank INTEGER,
  reward_claimed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, week_start_date)
);

-- RLS 활성화
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_mission_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_rankings ENABLE ROW LEVEL SECURITY;

-- RLS 정책: user_stats
CREATE POLICY "Users can view their own stats"
  ON public.user_stats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats"
  ON public.user_stats FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stats"
  ON public.user_stats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS 정책: daily_missions (모두 볼 수 있음)
CREATE POLICY "Anyone can view active missions"
  ON public.daily_missions FOR SELECT
  USING (is_active = true);

-- RLS 정책: user_mission_progress
CREATE POLICY "Users can view their own progress"
  ON public.user_mission_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
  ON public.user_mission_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON public.user_mission_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS 정책: daily_attendance
CREATE POLICY "Users can view their own attendance"
  ON public.daily_attendance FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own attendance"
  ON public.daily_attendance FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS 정책: game_activity_log
CREATE POLICY "Users can view their own activity"
  ON public.game_activity_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activity"
  ON public.game_activity_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS 정책: weekly_rankings
CREATE POLICY "Anyone can view rankings"
  ON public.weekly_rankings FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own ranking"
  ON public.weekly_rankings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ranking"
  ON public.weekly_rankings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 트리거: updated_at 자동 업데이트
CREATE TRIGGER update_user_stats_updated_at
  BEFORE UPDATE ON public.user_stats
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_mission_progress_updated_at
  BEFORE UPDATE ON public.user_mission_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_weekly_rankings_updated_at
  BEFORE UPDATE ON public.weekly_rankings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 기본 데일리 미션 데이터 삽입
INSERT INTO public.daily_missions (mission_type, title, description, target_count, reward_points, reward_exp) VALUES
  ('play_quiz', 'OX 퀴즈 도전', 'OX 퀴즈를 3회 플레이하세요', 3, 30, 50),
  ('play_rps', '가위바위보 승리', '가위바위보에서 2회 승리하세요', 2, 40, 60),
  ('play_ladder', '사다리 타기 참여', '사다리 타기를 2회 플레이하세요', 2, 30, 50),
  ('play_any_game', '게임 마스터', '어떤 게임이든 5회 플레이하세요', 5, 50, 100),
  ('complete_offerwall', '오퍼월 도전', '오퍼월 미션 1개를 완료하세요', 1, 100, 150);

-- 레벨업 경험치 계산 함수
CREATE OR REPLACE FUNCTION public.calculate_level_from_exp(exp INTEGER)
RETURNS INTEGER AS $$
BEGIN
  -- 레벨 = sqrt(경험치 / 100) + 1
  RETURN FLOOR(SQRT(exp / 100.0)) + 1;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 다음 레벨까지 필요한 경험치 계산 함수
CREATE OR REPLACE FUNCTION public.exp_needed_for_next_level(current_level INTEGER)
RETURNS INTEGER AS $$
BEGIN
  -- 다음 레벨 경험치 = (레벨)^2 * 100
  RETURN (current_level * current_level * 100);
END;
$$ LANGUAGE plpgsql IMMUTABLE;