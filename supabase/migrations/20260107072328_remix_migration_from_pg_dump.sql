CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql";
CREATE EXTENSION IF NOT EXISTS "supabase_vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
BEGIN;

--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'admin',
    'moderator',
    'user'
);


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username)
  VALUES (new.id, new.raw_user_meta_data ->> 'username');
  RETURN new;
END;
$$;


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: knowledge_base; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.knowledge_base (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    topic text NOT NULL,
    content text NOT NULL,
    approved boolean DEFAULT false,
    upvotes integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    downvotes integer DEFAULT 0,
    link_url text,
    image_url text,
    category text DEFAULT 'general'::text
);


--
-- Name: knowledge_comments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.knowledge_comments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    entry_id uuid NOT NULL,
    user_id uuid NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: knowledge_votes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.knowledge_votes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    entry_id uuid NOT NULL,
    vote_type text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT knowledge_votes_vote_type_check CHECK ((vote_type = ANY (ARRAY['up'::text, 'down'::text])))
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    username text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    avatar_url text,
    display_name text
);


--
-- Name: topic_progress; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.topic_progress (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    topic_title text NOT NULL,
    explored boolean DEFAULT true NOT NULL,
    last_visited timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: knowledge_base knowledge_base_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.knowledge_base
    ADD CONSTRAINT knowledge_base_pkey PRIMARY KEY (id);


--
-- Name: knowledge_comments knowledge_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.knowledge_comments
    ADD CONSTRAINT knowledge_comments_pkey PRIMARY KEY (id);


--
-- Name: knowledge_votes knowledge_votes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.knowledge_votes
    ADD CONSTRAINT knowledge_votes_pkey PRIMARY KEY (id);


--
-- Name: knowledge_votes knowledge_votes_user_id_entry_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.knowledge_votes
    ADD CONSTRAINT knowledge_votes_user_id_entry_id_key UNIQUE (user_id, entry_id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);


--
-- Name: topic_progress topic_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.topic_progress
    ADD CONSTRAINT topic_progress_pkey PRIMARY KEY (id);


--
-- Name: topic_progress topic_progress_user_id_topic_title_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.topic_progress
    ADD CONSTRAINT topic_progress_user_id_topic_title_key UNIQUE (user_id, topic_title);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: knowledge_base update_knowledge_base_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_knowledge_base_updated_at BEFORE UPDATE ON public.knowledge_base FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: knowledge_comments knowledge_comments_entry_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.knowledge_comments
    ADD CONSTRAINT knowledge_comments_entry_id_fkey FOREIGN KEY (entry_id) REFERENCES public.knowledge_base(id) ON DELETE CASCADE;


--
-- Name: knowledge_votes knowledge_votes_entry_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.knowledge_votes
    ADD CONSTRAINT knowledge_votes_entry_id_fkey FOREIGN KEY (entry_id) REFERENCES public.knowledge_base(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: topic_progress topic_progress_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.topic_progress
    ADD CONSTRAINT topic_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: knowledge_comments Admins can manage all comments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all comments" ON public.knowledge_comments USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: knowledge_base Admins can manage all knowledge; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all knowledge" ON public.knowledge_base USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Admins can manage roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage roles" ON public.user_roles USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Admins can view all roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: knowledge_comments Anyone can view comments on approved entries; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view comments on approved entries" ON public.knowledge_comments FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.knowledge_base
  WHERE ((knowledge_base.id = knowledge_comments.entry_id) AND (knowledge_base.approved = true)))));


--
-- Name: profiles Anyone can view profiles for contributor display; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view profiles for contributor display" ON public.profiles FOR SELECT USING (true);


--
-- Name: knowledge_base Users can delete own contributions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own contributions" ON public.knowledge_base FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: knowledge_comments Users can delete their own comments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own comments" ON public.knowledge_comments FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: topic_progress Users can delete their own topic progress; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own topic progress" ON public.topic_progress FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: knowledge_votes Users can delete their own votes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own votes" ON public.knowledge_votes FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: knowledge_base Users can insert knowledge contributions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert knowledge contributions" ON public.knowledge_base FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: knowledge_comments Users can insert their own comments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own comments" ON public.knowledge_comments FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: profiles Users can insert their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: topic_progress Users can insert their own topic progress; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own topic progress" ON public.topic_progress FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: knowledge_votes Users can insert their own votes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own votes" ON public.knowledge_votes FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: knowledge_base Users can update own contributions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own contributions" ON public.knowledge_base FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: profiles Users can update their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: topic_progress Users can update their own topic progress; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own topic progress" ON public.topic_progress FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: knowledge_votes Users can update their own votes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own votes" ON public.knowledge_votes FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: knowledge_base Users can view approved knowledge or own submissions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view approved knowledge or own submissions" ON public.knowledge_base FOR SELECT USING (((approved = true) OR (auth.uid() = user_id)));


--
-- Name: profiles Users can view their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_roles Users can view their own roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: topic_progress Users can view their own topic progress; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own topic progress" ON public.topic_progress FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: knowledge_votes Users can view their own votes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own votes" ON public.knowledge_votes FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: knowledge_base; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;

--
-- Name: knowledge_comments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.knowledge_comments ENABLE ROW LEVEL SECURITY;

--
-- Name: knowledge_votes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.knowledge_votes ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: topic_progress; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.topic_progress ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--




COMMIT;