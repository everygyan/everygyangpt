-- EveryGyan initial publishing schema
-- Apply with the Supabase CLI after linking a project: supabase db push

create extension if not exists pgcrypto;

create type public.app_role as enum ('reader', 'editor', 'moderator', 'admin');
create type public.article_status as enum ('draft', 'review', 'scheduled', 'published', 'archived');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'EveryGyan reader',
  avatar_url text,
  bio text,
  role public.app_role not null default 'reader',
  preferred_locale text not null default 'en',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.sections (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  color text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.sections(id) on delete cascade,
  parent_id uuid references public.categories(id) on delete set null,
  name text not null,
  slug text not null,
  description text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  unique(section_id, slug)
);

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table public.articles (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete restrict,
  section_id uuid not null references public.sections(id) on delete restrict,
  title text not null,
  slug text not null unique,
  excerpt text,
  content jsonb not null default '{"type":"doc","content":[]}'::jsonb,
  content_html text,
  featured_image_url text,
  featured_image_alt text,
  status public.article_status not null default 'draft',
  locale text not null default 'en',
  source_locale text not null default 'en',
  is_featured boolean not null default false,
  is_breaking boolean not null default false,
  allow_comments boolean not null default true,
  seo_title text,
  seo_description text,
  canonical_url text,
  scheduled_for timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index articles_published_idx on public.articles(status, published_at desc);
create index articles_section_idx on public.articles(section_id, published_at desc);
create index articles_search_idx on public.articles using gin (
  to_tsvector('english', coalesce(title, '') || ' ' || coalesce(excerpt, '') || ' ' || coalesce(content_html, ''))
);

create table public.article_categories (
  article_id uuid not null references public.articles(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  is_primary boolean not null default false,
  primary key(article_id, category_id)
);

create table public.article_tags (
  article_id uuid not null references public.articles(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key(article_id, tag_id)
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.articles(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  parent_id uuid references public.comments(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 4000),
  is_hidden boolean not null default false,
  hidden_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  locale text not null default 'en',
  status text not null default 'pending' check (status in ('pending', 'active', 'unsubscribed')),
  consent_source text,
  consented_at timestamptz,
  unsubscribed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.media (
  id uuid primary key default gen_random_uuid(),
  uploaded_by uuid not null references public.profiles(id) on delete restrict,
  storage_path text not null unique,
  file_name text not null,
  mime_type text not null,
  width integer,
  height integer,
  alt_text text,
  caption text,
  credit text,
  created_at timestamptz not null default now()
);

create table public.menus (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  location text not null unique,
  created_at timestamptz not null default now()
);

create table public.menu_items (
  id uuid primary key default gen_random_uuid(),
  menu_id uuid not null references public.menus(id) on delete cascade,
  parent_id uuid references public.menu_items(id) on delete cascade,
  label text not null,
  url text,
  section_id uuid references public.sections(id) on delete set null,
  category_id uuid references public.categories(id) on delete set null,
  sort_order integer not null default 0,
  is_active boolean not null default true
);

create or replace function public.is_staff(required_roles public.app_role[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = any(required_roles)
  );
$$;

create or replace function public.get_my_role()
returns public.app_role
language sql
stable
security definer
set search_path = ''
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', 'EveryGyan reader'));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.sections enable row level security;
alter table public.categories enable row level security;
alter table public.tags enable row level security;
alter table public.articles enable row level security;
alter table public.article_categories enable row level security;
alter table public.article_tags enable row level security;
alter table public.comments enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.media enable row level security;
alter table public.menus enable row level security;
alter table public.menu_items enable row level security;

create policy "Profiles are publicly readable" on public.profiles for select using (true);
create policy "Users update their own profile" on public.profiles
  for update using (id = auth.uid())
  with check (id = auth.uid() and role = public.get_my_role());
create policy "Admins manage profiles" on public.profiles for all using (public.is_staff(array['admin']::public.app_role[]));

create policy "Sections are publicly readable" on public.sections for select using (is_active);
create policy "Categories are publicly readable" on public.categories for select using (is_active);
create policy "Tags are publicly readable" on public.tags for select using (true);
create policy "Menus are publicly readable" on public.menus for select using (true);
create policy "Active menu items are publicly readable" on public.menu_items for select using (is_active);

create policy "Published articles are publicly readable" on public.articles
  for select using (status = 'published' or author_id = auth.uid() or public.is_staff(array['editor','moderator','admin']::public.app_role[]));
create policy "Editors create articles" on public.articles
  for insert with check (author_id = auth.uid() and public.is_staff(array['editor','admin']::public.app_role[]));
create policy "Editors update their articles" on public.articles
  for update using (author_id = auth.uid() or public.is_staff(array['admin']::public.app_role[]));
create policy "Admins delete articles" on public.articles
  for delete using (public.is_staff(array['admin']::public.app_role[]));

create policy "Article categories are publicly readable" on public.article_categories for select using (true);
create policy "Article tags are publicly readable" on public.article_tags for select using (true);
create policy "Staff manage article categories" on public.article_categories for all using (public.is_staff(array['editor','admin']::public.app_role[]));
create policy "Staff manage article tags" on public.article_tags for all using (public.is_staff(array['editor','admin']::public.app_role[]));

create policy "Visible comments are publicly readable" on public.comments for select using (not is_hidden or user_id = auth.uid());
create policy "Signed-in users create comments" on public.comments for insert to authenticated with check (user_id = auth.uid());
create policy "Users edit their own comments" on public.comments
  for update to authenticated
  using (user_id = auth.uid() and not is_hidden)
  with check (user_id = auth.uid() and not is_hidden and hidden_reason is null);
create policy "Users delete their own comments" on public.comments for delete to authenticated using (user_id = auth.uid() or public.is_staff(array['moderator','admin']::public.app_role[]));
create policy "Moderators manage comments" on public.comments for all using (public.is_staff(array['moderator','admin']::public.app_role[]));

create policy "Staff manage taxonomy" on public.sections for all using (public.is_staff(array['admin']::public.app_role[]));
create policy "Staff manage categories" on public.categories for all using (public.is_staff(array['editor','admin']::public.app_role[]));
create policy "Staff manage tags" on public.tags for all using (public.is_staff(array['editor','admin']::public.app_role[]));
create policy "Admins manage menus" on public.menus for all using (public.is_staff(array['admin']::public.app_role[]));
create policy "Admins manage menu items" on public.menu_items for all using (public.is_staff(array['admin']::public.app_role[]));
create policy "Staff manage media" on public.media for all using (public.is_staff(array['editor','admin']::public.app_role[]));
create policy "Admins manage subscribers" on public.newsletter_subscribers for all using (public.is_staff(array['admin']::public.app_role[]));

insert into public.sections (name, slug, description, color, sort_order) values
  ('News', 'news', 'World, technology and ideas that matter', '#146ef5', 1),
  ('Travel', 'travel', 'Places, people and practical guides', '#0d9488', 2),
  ('Entertainment', 'entertainment', 'Movies, series, music and culture', '#7c4dff', 3),
  ('Health', 'health', 'Nutrition, fitness and balanced living', '#15965d', 4),
  ('Learn', 'learn', 'SAP, technology and creative skills', '#ff5a2f', 5);

