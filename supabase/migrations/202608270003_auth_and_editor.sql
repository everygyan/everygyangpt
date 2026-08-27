-- EveryGyan authentication and database-backed publishing
-- Apply after 202608270001 and 202608270002.

insert into public.categories (section_id, name, slug, description, sort_order)
select s.id, category.name, category.slug, category.description, category.sort_order
from public.sections s
join (values
  ('news', 'Technology', 'technology', 'Technology companies, products and digital culture', 1),
  ('news', 'World', 'world', 'Important global updates and explainers', 2),
  ('news', 'Business', 'business', 'Business, markets and the economy', 3),
  ('travel', 'Travel Guides', 'travel-guides', 'Practical destination guides and itineraries', 1),
  ('travel', 'Culture', 'culture', 'Local people, food and traditions', 2),
  ('travel', 'Travel Tips', 'travel-tips', 'Planning, saving and travelling well', 3),
  ('entertainment', 'Movies', 'movies', 'Cinema news, reviews and explainers', 1),
  ('entertainment', 'Series', 'series', 'Streaming and television recommendations', 2),
  ('entertainment', 'Music', 'music', 'Artists, releases and music culture', 3),
  ('health', 'Nutrition', 'nutrition', 'Evidence-aware food and nutrition knowledge', 1),
  ('health', 'Fitness', 'fitness', 'Movement, strength and sustainable routines', 2),
  ('health', 'Wellbeing', 'wellbeing', 'Everyday physical and mental wellbeing', 3),
  ('learn', 'SAP', 'sap', 'Practical SAP concepts and learning paths', 1),
  ('learn', 'Creative', 'creative', 'Design, writing and creative skills', 2),
  ('learn', 'New Technology', 'new-technology', 'Emerging tools and technical skills', 3)
) as category(section_slug, name, slug, description, sort_order)
  on s.slug = category.section_slug
on conflict (section_id, slug) do update
set name = excluded.name,
    description = excluded.description,
    sort_order = excluded.sort_order;

drop policy if exists "Editors update their articles" on public.articles;
create policy "Editors update their articles" on public.articles
  for update to authenticated
  using (
    (author_id = auth.uid() and public.is_staff(array['editor','admin']::public.app_role[]))
    or public.is_staff(array['admin']::public.app_role[])
  )
  with check (
    (author_id = auth.uid() and public.is_staff(array['editor','admin']::public.app_role[]))
    or public.is_staff(array['admin']::public.app_role[])
  );

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at before update on public.profiles
for each row execute procedure public.set_updated_at();

drop trigger if exists set_articles_updated_at on public.articles;
create trigger set_articles_updated_at before update on public.articles
for each row execute procedure public.set_updated_at();

drop trigger if exists set_comments_updated_at on public.comments;
create trigger set_comments_updated_at before update on public.comments
for each row execute procedure public.set_updated_at();

-- Run this function manually in the Supabase SQL Editor after registering your account:
-- select public.promote_user_to_admin('your-email@example.com');
-- It is intentionally unavailable through the public API.
create or replace function public.promote_user_to_admin(p_email text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  promoted_user_id uuid;
begin
  select id into promoted_user_id
  from auth.users
  where lower(email) = lower(trim(p_email));

  if promoted_user_id is null then
    raise exception 'No Supabase Auth user exists for that email address';
  end if;

  update public.profiles
  set role = 'admin'::public.app_role,
      updated_at = now()
  where id = promoted_user_id;

  return promoted_user_id;
end;
$$;

revoke all on function public.promote_user_to_admin(text) from public;
revoke all on function public.promote_user_to_admin(text) from anon;
revoke all on function public.promote_user_to_admin(text) from authenticated;

revoke insert, update, delete on public.articles from anon;
grant select on public.articles to anon, authenticated;
grant insert, update, delete on public.articles to authenticated;

grant select on public.sections, public.categories, public.tags to anon, authenticated;
grant insert, update, delete on public.categories, public.tags to authenticated;
grant select on public.article_categories, public.article_tags to anon, authenticated;
grant insert, update, delete on public.article_categories, public.article_tags to authenticated;
grant select on public.profiles to anon, authenticated;
grant update on public.profiles to authenticated;
