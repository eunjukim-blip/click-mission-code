-- 오퍼월 상품 테이블 생성
CREATE TABLE public.offerwall_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  link TEXT NOT NULL,
  reward_amount INTEGER NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  keywords TEXT[], -- 퀴즈 주제 매칭용
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS 정책 설정 (누구나 볼 수 있음)
ALTER TABLE public.offerwall_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active products"
  ON public.offerwall_products
  FOR SELECT
  USING (is_active = true);

-- 업데이트 시간 자동 갱신 트리거
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_offerwall_products_updated_at
  BEFORE UPDATE ON public.offerwall_products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 퀴즈 완료 기록 테이블
CREATE TABLE public.quiz_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_identifier TEXT NOT NULL, -- IP나 기기 식별자
  completion_date DATE NOT NULL DEFAULT CURRENT_DATE,
  score INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_identifier, completion_date)
);

ALTER TABLE public.quiz_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert quiz completions"
  ON public.quiz_completions
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view quiz completions"
  ON public.quiz_completions
  FOR SELECT
  USING (true);