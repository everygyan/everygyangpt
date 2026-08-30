-- Allow readers to comment without creating an account.
-- Guest comments are created through the validated server endpoint; the service-role key stays server-only.

alter table public.comments
  alter column user_id drop not null;

alter table public.comments
  add column if not exists guest_name text;

alter table public.comments
  drop constraint if exists comments_author_required;

alter table public.comments
  add constraint comments_author_required
  check (
    user_id is not null
    or char_length(trim(coalesce(guest_name, ''))) between 2 and 80
  );

create index if not exists comments_article_visible_created_idx
  on public.comments (article_id, is_hidden, created_at desc);

grant select on public.comments to anon, authenticated;
