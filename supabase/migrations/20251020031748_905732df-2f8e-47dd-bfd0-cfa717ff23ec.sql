-- 반응속도 게임 결과 테이블
CREATE TABLE public.reaction_game_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reaction_time integer NOT NULL, -- milliseconds
  created_at timestamptz DEFAULT now()
);

-- 보석 캐기 게임 결과 테이블
CREATE TABLE public.gem_game_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clicks integer NOT NULL,
  success boolean NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- RLS 활성화 (익명으로 누구나 읽고 쓸 수 있도록)
ALTER TABLE public.reaction_game_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gem_game_results ENABLE ROW LEVEL SECURITY;

-- 누구나 조회 가능
CREATE POLICY "Anyone can view reaction results"
ON public.reaction_game_results
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Anyone can view gem results"
ON public.gem_game_results
FOR SELECT
TO anon, authenticated
USING (true);

-- 누구나 삽입 가능
CREATE POLICY "Anyone can insert reaction results"
ON public.reaction_game_results
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Anyone can insert gem results"
ON public.gem_game_results
FOR INSERT
TO anon, authenticated
WITH CHECK (true);