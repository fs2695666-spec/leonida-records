-- =============================================================================
-- Leonida Records — Supabase schema (v2)
-- Run this whole file once in Supabase → SQL Editor on a NEW project.
-- It is idempotent: running it again is safe (tables are created if missing,
-- functions/policies/triggers are replaced).
--
-- Upgrading an existing v8 project? Run supabase/upgrade_from_v8.sql FIRST.
--
-- Content model
--   * Every user-facing text field is "localized jsonb": {"es": "...", "en": "...",
--     "pt": "...", "fr": "..."}. Spanish (es) is the base language and is required
--     for titles; the site falls back to es when a translation is missing.
--   * Rich text (article bodies, entity descriptions) is stored as ProseMirror /
--     Tiptap JSON per language — never as raw HTML.
--
-- Roles (public.profiles.role)
--   admin   → everything: content, delete, settings, users
--   editor  → create / edit / publish content, manage media, facts, relations
--   pending → signed up but no access (default for every new auth user)
-- =============================================================================

create extension if not exists pgcrypto;

-- -----------------------------------------------------------------------------
-- Helpers
-- -----------------------------------------------------------------------------
create or replace function public.lr_is_localized(v jsonb)
returns boolean language sql immutable as $$
  select v is null
      or (jsonb_typeof(v) = 'object'
          and not exists (select 1 from jsonb_object_keys(v) k where k not in ('es','en','pt','fr')));
$$;

-- Accent/case folding for search without requiring the unaccent extension.
create or replace function public.lr_fold(v text)
returns text language sql immutable as $$
  select translate(lower(coalesce(v, '')),
    'áàäâãåéèëêíìïîóòöôõúùüûçñý',
    'aaaaaaeeeeiiiiooooouuuucny');
$$;

-- Concatenate every language value of a localized jsonb (plain-text fields).
create or replace function public.lr_all_text(v jsonb)
returns text language sql immutable as $$
  select coalesce((select string_agg(value, ' ') from jsonb_each_text(coalesce(v, '{}'::jsonb))), '');
$$;

create or replace function public.lr_pick(v jsonb, lang text)
returns text language sql immutable as $$
  select coalesce(nullif(v ->> lang, ''), nullif(v ->> 'es', ''), '');
$$;

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- Profiles & roles
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text,
  display_name text,
  role         text not null default 'pending' check (role in ('admin','editor','pending')),
  active       boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create or replace function public.current_user_role()
returns text language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid() and active;
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.current_user_role() = 'admin', false);
$$;

create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.current_user_role() in ('admin','editor'), false);
$$;

-- New auth users get a profile with NO access (role = pending).
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)))
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Guard: only admins can change role/active; there must always be one active admin.
create or replace function public.guard_profile_update()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'UPDATE' then
    if (new.role is distinct from old.role or new.active is distinct from old.active or new.email is distinct from old.email)
       and not public.is_admin()
       and auth.uid() is not null then
      raise exception 'Only admins can change roles, status or email';
    end if;
  end if;
  if old.role = 'admin' and old.active
     and (tg_op = 'DELETE' or new.role <> 'admin' or not new.active) then
    if not exists (select 1 from public.profiles
                   where role = 'admin' and active and id <> old.id) then
      raise exception 'At least one active admin is required';
    end if;
  end if;
  return coalesce(new, old);
end;
$$;

drop trigger if exists guard_profile on public.profiles;
create trigger guard_profile before update or delete on public.profiles
  for each row execute procedure public.guard_profile_update();

drop trigger if exists touch_profiles on public.profiles;
create trigger touch_profiles before update on public.profiles
  for each row execute procedure public.touch_updated_at();

-- Run from the SQL editor to bootstrap your first admin:
--   select public.promote_to_admin('you@example.com');
create or replace function public.promote_to_admin(user_email text)
returns text language plpgsql security definer set search_path = public as $$
declare uid uuid;
begin
  select id into uid from auth.users where lower(email) = lower(user_email);
  if uid is null then
    raise exception 'No auth user with email %', user_email;
  end if;
  insert into public.profiles (id, email, display_name, role, active)
  values (uid, user_email, split_part(user_email, '@', 1), 'admin', true)
  on conflict (id) do update set role = 'admin', active = true;
  return 'OK: ' || user_email || ' is now admin';
end;
$$;
revoke all on function public.promote_to_admin(text) from public, anon, authenticated;

-- -----------------------------------------------------------------------------
-- Content tables
-- -----------------------------------------------------------------------------
create table if not exists public.sources (
  id           uuid primary key default gen_random_uuid(),
  name         text not null check (length(trim(name)) > 0),
  publisher    text,
  kind         text not null default 'Official website',
  url          text not null check (url ~* '^https?://'),
  published_at date,
  notes        text,
  created_by   uuid references auth.users(id) on delete set null,
  updated_by   uuid references auth.users(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists public.media (
  id           uuid primary key default gen_random_uuid(),
  bucket       text not null default 'media',
  storage_path text unique,               -- null for external URLs
  url          text not null check (url ~* '^https?://'),
  kind         text not null default 'image' check (kind in ('image','video','file')),
  mime_type    text,
  size_bytes   bigint check (size_bytes is null or size_bytes >= 0),
  width        integer,
  height       integer,
  alt_text     text,
  caption      text,
  credit       text,
  created_by   uuid references auth.users(id) on delete set null,
  updated_by   uuid references auth.users(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists public.entities (
  id                uuid primary key default gen_random_uuid(),
  type              text not null check (type in ('characters','locations','vehicles','facts','trailers','theories')),
  slug              text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  status            text not null default 'OBSERVED'
                    check (status in ('CONFIRMED','OBSERVED','REPORTED','SPECULATION','DEBUNKED')),
  title             jsonb not null check (public.lr_is_localized(title) and length(coalesce(title ->> 'es', '')) > 0),
  eyebrow           jsonb not null default '{}' check (public.lr_is_localized(eyebrow)),
  short_description jsonb not null default '{}' check (public.lr_is_localized(short_description)),
  description       jsonb not null default '{}' check (public.lr_is_localized(description)),
  quote             jsonb not null default '{}' check (public.lr_is_localized(quote)),
  hero_image        text check (hero_image is null or hero_image ~* '^https?://'),
  hero_alt          text,
  video_url         text check (video_url is null or video_url ~* '^https?://'),
  tags              text[] not null default '{}',
  primary_source_id uuid references public.sources(id) on delete set null,
  published         boolean not null default false,
  published_at      timestamptz,
  featured          boolean not null default false,
  sort_order        integer not null default 0,
  metadata          jsonb not null default '{}',   -- e.g. {"map": {"x": 62, "y": 58}}
  created_by        uuid references auth.users(id) on delete set null,
  updated_by        uuid references auth.users(id) on delete set null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (type, slug)
);

create table if not exists public.facts (
  id             uuid primary key default gen_random_uuid(),
  entity_id      uuid not null references public.entities(id) on delete cascade,
  title          jsonb not null check (public.lr_is_localized(title) and length(coalesce(title ->> 'es', '')) > 0),
  body           jsonb not null default '{}' check (public.lr_is_localized(body)),
  status         text not null default 'OBSERVED'
                 check (status in ('CONFIRMED','OBSERVED','REPORTED','SPECULATION','DEBUNKED')),
  source_id      uuid references public.sources(id) on delete set null,
  timestamp_text text,
  sort_order     integer not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table if not exists public.relations (
  id             uuid primary key default gen_random_uuid(),
  from_entity_id uuid not null references public.entities(id) on delete cascade,
  to_entity_id   uuid not null references public.entities(id) on delete cascade,
  relation_type  text not null check (relation_type ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  note           text,
  created_at     timestamptz not null default now(),
  unique (from_entity_id, to_entity_id, relation_type),
  check (from_entity_id <> to_entity_id)
);

create table if not exists public.entity_media (
  entity_id  uuid not null references public.entities(id) on delete cascade,
  media_id   uuid not null references public.media(id) on delete cascade,
  sort_order integer not null default 0,
  primary key (entity_id, media_id)
);

create table if not exists public.categories (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name       jsonb not null check (public.lr_is_localized(name) and length(coalesce(name ->> 'es', '')) > 0),
  color      text not null default 'flamingo',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.articles (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title           jsonb not null check (public.lr_is_localized(title) and length(coalesce(title ->> 'es', '')) > 0),
  excerpt         jsonb not null default '{}' check (public.lr_is_localized(excerpt)),
  body            jsonb not null default '{}' check (public.lr_is_localized(body)),
  seo_title       jsonb not null default '{}' check (public.lr_is_localized(seo_title)),
  seo_description jsonb not null default '{}' check (public.lr_is_localized(seo_description)),
  category_id     uuid references public.categories(id) on delete set null,
  tags            text[] not null default '{}',
  cover_image     text check (cover_image is null or cover_image ~* '^https?://'),
  cover_alt       text,
  cover_caption   text,
  author_name     text,
  source_id       uuid references public.sources(id) on delete set null,
  evidence        text not null default 'REPORTED'
                  check (evidence in ('CONFIRMED','OBSERVED','REPORTED','SPECULATION','DEBUNKED')),
  published       boolean not null default false,
  published_at    timestamptz,
  featured        boolean not null default false,
  created_by      uuid references auth.users(id) on delete set null,
  updated_by      uuid references auth.users(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table if not exists public.article_entities (
  article_id uuid not null references public.articles(id) on delete cascade,
  entity_id  uuid not null references public.entities(id) on delete cascade,
  primary key (article_id, entity_id)
);

create table if not exists public.timeline_events (
  id         uuid primary key default gen_random_uuid(),
  event_date date not null,
  title      jsonb not null check (public.lr_is_localized(title) and length(coalesce(title ->> 'es', '')) > 0),
  detail     jsonb not null default '{}' check (public.lr_is_localized(detail)),
  kind       text not null default 'news' check (kind in ('video','news','music','launch','reveal','other')),
  entity_id  uuid references public.entities(id) on delete set null,
  article_id uuid references public.articles(id) on delete set null,
  published  boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  key        text primary key check (key ~ '^[a-z0-9_]+$'),
  value      jsonb not null default 'null',
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table if not exists public.activity_log (
  id         bigint generated always as identity primary key,
  actor_id   uuid references auth.users(id) on delete set null,
  actor_name text,
  action     text not null,
  table_name text not null,
  record_id  uuid,
  label      text,
  created_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Indexes
-- -----------------------------------------------------------------------------
create index if not exists entities_type_pub_idx      on public.entities (type, published);
create index if not exists entities_pub_updated_idx   on public.entities (published, updated_at desc);
create index if not exists entities_featured_idx      on public.entities (featured) where featured;
create index if not exists entities_tags_idx          on public.entities using gin (tags);
create index if not exists entities_source_idx        on public.entities (primary_source_id);
create index if not exists facts_entity_idx           on public.facts (entity_id, sort_order);
create index if not exists facts_source_idx           on public.facts (source_id);
create index if not exists relations_from_idx         on public.relations (from_entity_id);
create index if not exists relations_to_idx           on public.relations (to_entity_id);
create index if not exists entity_media_media_idx     on public.entity_media (media_id);
create index if not exists media_created_idx          on public.media (created_at desc);
create index if not exists articles_pub_idx           on public.articles (published, published_at desc);
create index if not exists articles_category_idx      on public.articles (category_id);
create index if not exists articles_source_idx        on public.articles (source_id);
create index if not exists articles_tags_idx          on public.articles using gin (tags);
create index if not exists article_entities_entity_idx on public.article_entities (entity_id);
create index if not exists timeline_date_idx          on public.timeline_events (event_date);
create index if not exists activity_created_idx       on public.activity_log (created_at desc);

-- -----------------------------------------------------------------------------
-- Triggers: timestamps, authorship, publish date, activity log
-- -----------------------------------------------------------------------------
create or replace function public.set_authorship()
returns trigger language plpgsql as $$
begin
  if tg_op = 'INSERT' then
    new.created_by = coalesce(new.created_by, auth.uid());
  end if;
  new.updated_by = coalesce(auth.uid(), new.updated_by);
  return new;
end;
$$;

create or replace function public.set_published_at()
returns trigger language plpgsql as $$
begin
  if new.published and new.published_at is null then
    new.published_at = now();
  end if;
  return new;
end;
$$;

create or replace function public.log_activity()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  rec jsonb := to_jsonb(coalesce(new, old));
  lbl text;
  who text;
begin
  if auth.uid() is null then
    return coalesce(new, old);
  end if;
  lbl := coalesce(rec -> 'title' ->> 'es', rec ->> 'name', rec -> 'name' ->> 'es', rec ->> 'alt_text', rec ->> 'storage_path', rec ->> 'key');
  select coalesce(display_name, email) into who from public.profiles where id = auth.uid();
  insert into public.activity_log (actor_id, actor_name, action, table_name, record_id, label)
  values (
    auth.uid(), who,
    case
      when tg_op = 'UPDATE' and (rec ? 'published')
           and (to_jsonb(old) ->> 'published') is distinct from (to_jsonb(new) ->> 'published')
        then case when (to_jsonb(new) ->> 'published')::boolean then 'publish' else 'unpublish' end
      else lower(tg_op)
    end,
    tg_table_name,
    case when rec ? 'id' and jsonb_typeof(rec -> 'id') = 'string' then (rec ->> 'id')::uuid else null end,
    left(lbl, 200)
  );
  return coalesce(new, old);
end;
$$;

do $$
declare t text;
begin
  foreach t in array array['sources','media','entities','facts','categories','articles','timeline_events'] loop
    execute format('drop trigger if exists touch_%1$s on public.%1$s', t);
    execute format('create trigger touch_%1$s before update on public.%1$s for each row execute procedure public.touch_updated_at()', t);
  end loop;
  foreach t in array array['sources','media','entities','articles'] loop
    execute format('drop trigger if exists author_%1$s on public.%1$s', t);
    execute format('create trigger author_%1$s before insert or update on public.%1$s for each row execute procedure public.set_authorship()', t);
  end loop;
  foreach t in array array['entities','articles'] loop
    execute format('drop trigger if exists pubdate_%1$s on public.%1$s', t);
    execute format('create trigger pubdate_%1$s before insert or update on public.%1$s for each row execute procedure public.set_published_at()', t);
  end loop;
  foreach t in array array['sources','media','entities','articles','timeline_events','site_settings'] loop
    execute format('drop trigger if exists activity_%1$s on public.%1$s', t);
    execute format('create trigger activity_%1$s after insert or update or delete on public.%1$s for each row execute procedure public.log_activity()', t);
  end loop;
end $$;

-- -----------------------------------------------------------------------------
-- Search (published content only; runs with the caller's permissions)
-- -----------------------------------------------------------------------------
create or replace function public.search_archive(q text, lang text default 'es', max_results integer default 40)
returns table (kind text, id uuid, type text, slug text, title text, excerpt text, status text, image text, rank integer)
language sql stable security invoker set search_path = public as $$
  with term as (select '%' || public.lr_fold(trim(q)) || '%' as t)
  select * from (
    select 'entity'::text, e.id, e.type, e.slug,
           public.lr_pick(e.title, lang), public.lr_pick(e.short_description, lang),
           e.status, e.hero_image,
           case
             when public.lr_fold(public.lr_all_text(e.title)) like (select t from term) then 3
             when public.lr_fold(array_to_string(e.tags, ' ')) like (select t from term) then 2
             else 1
           end
    from public.entities e
    where e.published
      and (   public.lr_fold(public.lr_all_text(e.title)) like (select t from term)
           or public.lr_fold(public.lr_all_text(e.short_description)) like (select t from term)
           or public.lr_fold(array_to_string(e.tags, ' ')) like (select t from term)
           or e.slug like (select t from term))
    union all
    select 'article'::text, a.id, 'news'::text, a.slug,
           public.lr_pick(a.title, lang), public.lr_pick(a.excerpt, lang),
           a.evidence, a.cover_image,
           case
             when public.lr_fold(public.lr_all_text(a.title)) like (select t from term) then 3
             when public.lr_fold(array_to_string(a.tags, ' ')) like (select t from term) then 2
             else 1
           end
    from public.articles a
    where a.published and a.published_at <= now()
      and (   public.lr_fold(public.lr_all_text(a.title)) like (select t from term)
           or public.lr_fold(public.lr_all_text(a.excerpt)) like (select t from term)
           or public.lr_fold(array_to_string(a.tags, ' ')) like (select t from term))
  ) r (kind, id, type, slug, title, excerpt, status, image, rank)
  where length(trim(coalesce(q, ''))) >= 2
  order by rank desc, title
  limit least(greatest(max_results, 1), 100);
$$;

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------
alter table public.profiles         enable row level security;
alter table public.sources          enable row level security;
alter table public.media            enable row level security;
alter table public.entities         enable row level security;
alter table public.facts            enable row level security;
alter table public.relations        enable row level security;
alter table public.entity_media     enable row level security;
alter table public.categories       enable row level security;
alter table public.articles         enable row level security;
alter table public.article_entities enable row level security;
alter table public.timeline_events  enable row level security;
alter table public.site_settings    enable row level security;
alter table public.activity_log     enable row level security;

-- Drop every existing policy on our tables so this file is the single source of truth.
do $$
declare p record;
begin
  for p in
    select policyname, tablename from pg_policies
    where schemaname = 'public'
      and tablename in ('profiles','sources','media','entities','facts','relations','entity_media',
                        'categories','articles','article_entities','timeline_events','site_settings','activity_log')
  loop
    execute format('drop policy if exists %I on public.%I', p.policyname, p.tablename);
  end loop;
end $$;

-- profiles
create policy "profiles: read own or admin" on public.profiles for select
  using (id = auth.uid() or public.is_admin());
create policy "profiles: update own or admin" on public.profiles for update to authenticated
  using (id = auth.uid() or public.is_admin()) with check (id = auth.uid() or public.is_admin());

-- sources (public read)
create policy "sources: public read" on public.sources for select using (true);
create policy "sources: staff insert" on public.sources for insert to authenticated with check (public.is_staff());
create policy "sources: staff update" on public.sources for update to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "sources: admin delete" on public.sources for delete to authenticated using (public.is_admin());

-- media library (public read — files live in a public bucket)
create policy "media: public read" on public.media for select using (true);
create policy "media: staff insert" on public.media for insert to authenticated with check (public.is_staff());
create policy "media: staff update" on public.media for update to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "media: staff delete" on public.media for delete to authenticated using (public.is_staff());

-- entities
create policy "entities: read published or staff" on public.entities for select using (published or public.is_staff());
create policy "entities: staff insert" on public.entities for insert to authenticated with check (public.is_staff());
create policy "entities: staff update" on public.entities for update to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "entities: admin delete" on public.entities for delete to authenticated using (public.is_admin());

-- facts
create policy "facts: read if entity visible" on public.facts for select using (
  public.is_staff() or exists (select 1 from public.entities e where e.id = entity_id and e.published));
create policy "facts: staff write" on public.facts for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- relations
create policy "relations: read if both visible" on public.relations for select using (
  public.is_staff() or (
        exists (select 1 from public.entities e where e.id = from_entity_id and e.published)
    and exists (select 1 from public.entities e where e.id = to_entity_id and e.published)));
create policy "relations: staff write" on public.relations for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- entity_media
create policy "entity_media: read if entity visible" on public.entity_media for select using (
  public.is_staff() or exists (select 1 from public.entities e where e.id = entity_id and e.published));
create policy "entity_media: staff write" on public.entity_media for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- categories
create policy "categories: public read" on public.categories for select using (true);
create policy "categories: staff insert" on public.categories for insert to authenticated with check (public.is_staff());
create policy "categories: staff update" on public.categories for update to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "categories: admin delete" on public.categories for delete to authenticated using (public.is_admin());

-- articles (scheduled articles stay hidden until published_at)
create policy "articles: read published or staff" on public.articles for select using (
  (published and published_at <= now()) or public.is_staff());
create policy "articles: staff insert" on public.articles for insert to authenticated with check (public.is_staff());
create policy "articles: staff update" on public.articles for update to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "articles: admin delete" on public.articles for delete to authenticated using (public.is_admin());

-- article_entities
create policy "article_entities: read if article visible" on public.article_entities for select using (
  public.is_staff() or exists (select 1 from public.articles a where a.id = article_id and a.published and a.published_at <= now()));
create policy "article_entities: staff write" on public.article_entities for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- timeline
create policy "timeline: read published or staff" on public.timeline_events for select using (published or public.is_staff());
create policy "timeline: staff insert" on public.timeline_events for insert to authenticated with check (public.is_staff());
create policy "timeline: staff update" on public.timeline_events for update to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "timeline: admin delete" on public.timeline_events for delete to authenticated using (public.is_admin());

-- settings: public read, admin write
create policy "settings: public read" on public.site_settings for select using (true);
create policy "settings: admin write" on public.site_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- activity log: staff read only (rows are written by triggers)
create policy "activity: staff read" on public.activity_log for select to authenticated using (public.is_staff());

-- -----------------------------------------------------------------------------
-- Grants (RLS above still decides which rows are visible / writable)
-- -----------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;
grant select on public.sources, public.media, public.entities, public.facts, public.relations,
               public.entity_media, public.categories, public.articles, public.article_entities,
               public.timeline_events, public.site_settings
      to anon, authenticated;
grant insert, update, delete on public.sources, public.media, public.entities, public.facts,
               public.relations, public.entity_media, public.categories, public.articles,
               public.article_entities, public.timeline_events, public.site_settings
      to authenticated;
grant select, update on public.profiles to authenticated;
grant select on public.activity_log to authenticated;
revoke insert, update, delete on public.activity_log from anon, authenticated;
grant execute on function public.is_admin(), public.is_staff(), public.current_user_role() to anon, authenticated;
grant execute on function public.search_archive(text, text, integer) to anon, authenticated;

-- -----------------------------------------------------------------------------
-- Storage: public "media" bucket (read by anyone, written by staff only)
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 15728640,
        array['image/jpeg','image/png','image/webp','image/avif','image/gif','video/mp4','video/webm'])
on conflict (id) do update
  set public = true,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public media storage read"  on storage.objects;
drop policy if exists "admin media storage insert" on storage.objects;
drop policy if exists "admin media storage update" on storage.objects;
drop policy if exists "admin media storage delete" on storage.objects;
drop policy if exists "lr media: public read"  on storage.objects;
drop policy if exists "lr media: staff insert" on storage.objects;
drop policy if exists "lr media: staff update" on storage.objects;
drop policy if exists "lr media: staff delete" on storage.objects;

create policy "lr media: public read"  on storage.objects for select using (bucket_id = 'media');
create policy "lr media: staff insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and public.is_staff());
create policy "lr media: staff update" on storage.objects for update to authenticated
  using (bucket_id = 'media' and public.is_staff()) with check (bucket_id = 'media' and public.is_staff());
create policy "lr media: staff delete" on storage.objects for delete to authenticated
  using (bucket_id = 'media' and public.is_staff());

-- -----------------------------------------------------------------------------
-- Default settings (only inserted if missing)
-- -----------------------------------------------------------------------------
insert into public.site_settings (key, value) values
  ('hero_image', 'null'),
  ('hero_video', 'null'),
  ('release_date', '"2026-11-19"'),
  ('announcement', '{}'),
  ('contact_email', 'null')
on conflict (key) do nothing;

-- =============================================================================
-- Next step: create your user in Authentication → Users, then run
--   select public.promote_to_admin('you@example.com');
-- =============================================================================
