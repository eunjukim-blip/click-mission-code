-- 1. user_stats 테이블에 user_identifier 컬럼 추가 및 user_id NULL 허용
ALTER TABLE public.user_stats 
  ALTER COLUMN user_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS user_identifier TEXT;

-- 2. game_activity_log 테이블 수정
ALTER TABLE public.game_activity_log
  ALTER COLUMN user_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS user_identifier TEXT;

-- 3. daily_attendance 테이블 수정
ALTER TABLE public.daily_attendance
  ALTER COLUMN user_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS user_identifier TEXT;

-- 4. user_mission_progress 테이블 수정
ALTER TABLE public.user_mission_progress
  ALTER COLUMN user_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS user_identifier TEXT;

-- 5. weekly_rankings 테이블 수정
ALTER TABLE public.weekly_rankings
  ALTER COLUMN user_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS user_identifier TEXT;

-- 6. rock_paper_scissors_games 테이블 수정
ALTER TABLE public.rock_paper_scissors_games
  ALTER COLUMN user_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS user_identifier TEXT;

-- 7. profiles 테이블에 user_identifier 추가
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS user_identifier TEXT UNIQUE;

-- 8. RLS 정책 업데이트 - user_stats
DROP POLICY IF EXISTS "Users can view their own stats" ON public.user_stats;
DROP POLICY IF EXISTS "Users can insert their own stats" ON public.user_stats;
DROP POLICY IF EXISTS "Users can update their own stats" ON public.user_stats;

CREATE POLICY "Anyone can view stats by identifier"
  ON public.user_stats FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert stats by identifier"
  ON public.user_stats FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update stats by identifier"
  ON public.user_stats FOR UPDATE
  USING (true);

-- 9. RLS 정책 업데이트 - game_activity_log
DROP POLICY IF EXISTS "Users can view their own activity" ON public.game_activity_log;
DROP POLICY IF EXISTS "Users can insert their own activity" ON public.game_activity_log;

CREATE POLICY "Anyone can view activity"
  ON public.game_activity_log FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert activity"
  ON public.game_activity_log FOR INSERT
  WITH CHECK (true);

-- 10. RLS 정책 업데이트 - daily_attendance
DROP POLICY IF EXISTS "Users can view their own attendance" ON public.daily_attendance;
DROP POLICY IF EXISTS "Users can insert their own attendance" ON public.daily_attendance;

CREATE POLICY "Anyone can view attendance"
  ON public.daily_attendance FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert attendance"
  ON public.daily_attendance FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update attendance"
  ON public.daily_attendance FOR UPDATE
  USING (true);

-- 11. RLS 정책 업데이트 - user_mission_progress
DROP POLICY IF EXISTS "Users can view their own progress" ON public.user_mission_progress;
DROP POLICY IF EXISTS "Users can insert their own progress" ON public.user_mission_progress;
DROP POLICY IF EXISTS "Users can update their own progress" ON public.user_mission_progress;

CREATE POLICY "Anyone can view mission progress"
  ON public.user_mission_progress FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert mission progress"
  ON public.user_mission_progress FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update mission progress"
  ON public.user_mission_progress FOR UPDATE
  USING (true);

-- 12. RLS 정책 업데이트 - weekly_rankings
DROP POLICY IF EXISTS "Users can insert their own ranking" ON public.weekly_rankings;
DROP POLICY IF EXISTS "Users can update their own ranking" ON public.weekly_rankings;

CREATE POLICY "Anyone can insert rankings"
  ON public.weekly_rankings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update rankings"
  ON public.weekly_rankings FOR UPDATE
  USING (true);

-- 13. RLS 정책 업데이트 - rock_paper_scissors_games
DROP POLICY IF EXISTS "Users can view their own games" ON public.rock_paper_scissors_games;
DROP POLICY IF EXISTS "Users can insert their own games" ON public.rock_paper_scissors_games;

CREATE POLICY "Anyone can view games"
  ON public.rock_paper_scissors_games FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert games"
  ON public.rock_paper_scissors_games FOR INSERT
  WITH CHECK (true);

-- 14. profiles 테이블 RLS 정책 수정
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Anyone can view profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update profiles"
  ON public.profiles FOR UPDATE
  USING (true);

-- 15. 인덱스 추가 (성능 향상)
CREATE INDEX IF NOT EXISTS idx_user_stats_identifier ON public.user_stats(user_identifier);
CREATE INDEX IF NOT EXISTS idx_game_activity_identifier ON public.game_activity_log(user_identifier);
CREATE INDEX IF NOT EXISTS idx_daily_attendance_identifier ON public.daily_attendance(user_identifier);
CREATE INDEX IF NOT EXISTS idx_mission_progress_identifier ON public.user_mission_progress(user_identifier);
CREATE INDEX IF NOT EXISTS idx_weekly_rankings_identifier ON public.weekly_rankings(user_identifier);
CREATE INDEX IF NOT EXISTS idx_rps_games_identifier ON public.rock_paper_scissors_games(user_identifier);