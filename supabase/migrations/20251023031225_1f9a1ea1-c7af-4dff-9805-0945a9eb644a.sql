-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table for role management
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Create mission status enum
CREATE TYPE public.mission_status AS ENUM ('pending', 'in_progress', 'completed', 'rewarded');

-- Create mission_participations table
CREATE TABLE public.mission_participations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES public.offerwall_products(id) ON DELETE CASCADE NOT NULL,
  status mission_status DEFAULT 'pending' NOT NULL,
  started_at timestamp with time zone DEFAULT now() NOT NULL,
  completed_at timestamp with time zone,
  rewarded_at timestamp with time zone,
  verification_data jsonb,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.mission_participations ENABLE ROW LEVEL SECURITY;

-- RLS policies for mission_participations
CREATE POLICY "Users can view their own participations"
  ON public.mission_participations
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own participations"
  ON public.mission_participations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own participations"
  ON public.mission_participations
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all participations"
  ON public.mission_participations
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all participations"
  ON public.mission_participations
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Create user_rewards table
CREATE TABLE public.user_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  participation_id uuid REFERENCES public.mission_participations(id) ON DELETE SET NULL,
  amount integer NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.user_rewards ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_rewards
CREATE POLICY "Users can view their own rewards"
  ON public.user_rewards
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all rewards"
  ON public.user_rewards
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  display_name text,
  total_points integer DEFAULT 0 NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger function for profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'display_name', ''));
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'user');
  
  RETURN new;
END;
$$;

-- Create trigger for auto profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Add trigger for updated_at on profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add trigger for updated_at on mission_participations
CREATE TRIGGER update_mission_participations_updated_at
  BEFORE UPDATE ON public.mission_participations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update offerwall_products RLS to allow authenticated users
CREATE POLICY "Authenticated users can view active products"
  ON public.offerwall_products
  FOR SELECT
  USING (is_active = true AND auth.role() = 'authenticated');

CREATE POLICY "Admins can manage products"
  ON public.offerwall_products
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));