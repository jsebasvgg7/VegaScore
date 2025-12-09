-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.available_achievements (
  id text NOT NULL,
  name text NOT NULL,
  description text,
  icon text,
  category text,
  requirement_type text,
  requirement_value integer,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT available_achievements_pkey PRIMARY KEY (id)
);
CREATE TABLE public.available_titles (
  id text NOT NULL,
  name text NOT NULL,
  description text,
  color text,
  requirement_achievement_id text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT available_titles_pkey PRIMARY KEY (id),
  CONSTRAINT available_titles_requirement_achievement_id_fkey FOREIGN KEY (requirement_achievement_id) REFERENCES public.available_achievements(id)
);
CREATE TABLE public.award_predictions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  award_id text,
  user_id uuid,
  predicted_winner text NOT NULL,
  points_earned integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT award_predictions_pkey PRIMARY KEY (id),
  CONSTRAINT award_predictions_award_id_fkey FOREIGN KEY (award_id) REFERENCES public.awards(id),
  CONSTRAINT award_predictions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.awards (
  id text NOT NULL,
  name text NOT NULL,
  season text NOT NULL,
  logo text DEFAULT '🏆'::text,
  category text NOT NULL,
  deadline timestamp with time zone NOT NULL,
  status text DEFAULT 'active'::text,
  winner text,
  created_at timestamp with time zone DEFAULT now(),
  logo_url text,
  CONSTRAINT awards_pkey PRIMARY KEY (id)
);
CREATE TABLE public.league_predictions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  league_id text,
  user_id uuid,
  predicted_champion text NOT NULL,
  predicted_top_scorer text NOT NULL,
  predicted_top_assist text NOT NULL,
  predicted_mvp text NOT NULL,
  points_earned integer DEFAULT 0,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT league_predictions_pkey PRIMARY KEY (id),
  CONSTRAINT league_predictions_league_id_fkey FOREIGN KEY (league_id) REFERENCES public.leagues(id),
  CONSTRAINT league_predictions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.leagues (
  id text NOT NULL,
  name text NOT NULL,
  season text NOT NULL,
  logo text DEFAULT '🏆'::text,
  status text DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active'::text, 'finished'::text])),
  champion text,
  top_scorer text,
  top_scorer_goals integer,
  top_assist text,
  top_assist_count integer,
  mvp_player text,
  deadline timestamp without time zone,
  created_at timestamp without time zone DEFAULT now(),
  logo_url text,
  CONSTRAINT leagues_pkey PRIMARY KEY (id)
);
CREATE TABLE public.matches (
  id text NOT NULL,
  league text NOT NULL,
  home_team text NOT NULL,
  away_team text NOT NULL,
  home_team_logo text DEFAULT '🏠'::text,
  away_team_logo text DEFAULT '✈️'::text,
  date text NOT NULL,
  time text NOT NULL,
  status text DEFAULT 'pending'::text,
  result_home integer,
  result_away integer,
  created_at timestamp with time zone DEFAULT now(),
  deadline timestamp with time zone,
  home_team_logo_url text,
  away_team_logo_url text,
  CONSTRAINT matches_pkey PRIMARY KEY (id)
);
CREATE TABLE public.predictions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  match_id text,
  user_id uuid,
  home_score integer NOT NULL,
  away_score integer NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  result_type text,
  points_earned integer DEFAULT 0,
  CONSTRAINT predictions_pkey PRIMARY KEY (id),
  CONSTRAINT predictions_match_id_fkey FOREIGN KEY (match_id) REFERENCES public.matches(id),
  CONSTRAINT predictions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  points integer DEFAULT 0,
  predictions integer DEFAULT 0,
  correct integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  auth_id uuid NOT NULL,
  is_admin boolean DEFAULT false,
  bio text,
  favorite_team character varying,
  email character varying,
  avatar_url text,
  gender text CHECK (gender = ANY (ARRAY['Masculino'::text, 'Femenino'::text, 'Otro'::text, 'Prefiero no decir'::text])),
  nationality text,
  favorite_player text,
  level integer DEFAULT 1,
  achievements jsonb DEFAULT '[]'::jsonb,
  titles jsonb DEFAULT '[]'::jsonb,
  current_streak integer DEFAULT 0,
  best_streak integer DEFAULT 0,
  weekly_points integer DEFAULT 0,
  weekly_correct integer DEFAULT 0,
  weekly_predictions integer DEFAULT 0,
  last_weekly_reset timestamp with time zone DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_auth_id_fkey FOREIGN KEY (auth_id) REFERENCES auth.users(id)
);
CREATE TABLE public.worldcup_predictions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  groups_predictions jsonb DEFAULT '{}'::jsonb,
  knockout_predictions jsonb DEFAULT '{"final": {}, "semis": {}, "round16": {}, "quarters": {}, "thirdPlace": {}}'::jsonb,
  awards_predictions jsonb DEFAULT '{"topAssist": "", "topScorer": "", "surpriseTeam": "", "breakoutPlayer": "", "disappointmentTeam": "", "disappointmentPlayer": ""}'::jsonb,
  points_earned integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT worldcup_predictions_pkey PRIMARY KEY (id),
  CONSTRAINT worldcup_predictions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);