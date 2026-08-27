-- Secure newsletter sign-up with double opt-in.
-- Subscriber rows remain protected by RLS; anonymous visitors can only call
-- the narrowly scoped functions granted at the bottom of this migration.

alter table public.newsletter_subscribers
  add column if not exists manage_token uuid not null default gen_random_uuid(),
  add column if not exists confirmation_sent_at timestamptz;

create unique index if not exists newsletter_subscribers_manage_token_idx
  on public.newsletter_subscribers (manage_token);

create or replace function public.request_newsletter_subscription(
  p_email text,
  p_locale text default 'en',
  p_source text default 'website'
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_email text := lower(trim(p_email));
  v_locale text := case
    when p_locale ~ '^[a-z]{2}(-[A-Z]{2})?$' then p_locale
    else 'en'
  end;
  v_token uuid;
begin
  if char_length(v_email) > 254
    or v_email !~* '^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}$' then
    raise exception 'invalid_email' using errcode = '22023';
  end if;

  insert into public.newsletter_subscribers (
    email,
    locale,
    status,
    consent_source,
    manage_token,
    confirmation_sent_at
  ) values (
    v_email,
    v_locale,
    'pending',
    left(coalesce(p_source, 'website'), 80),
    gen_random_uuid(),
    now()
  )
  on conflict (email) do update
    set locale = excluded.locale,
        status = 'pending',
        consent_source = excluded.consent_source,
        consented_at = null,
        unsubscribed_at = null,
        manage_token = gen_random_uuid(),
        confirmation_sent_at = now()
    where public.newsletter_subscribers.status <> 'active'
      and (
        public.newsletter_subscribers.confirmation_sent_at is null
        or public.newsletter_subscribers.confirmation_sent_at < now() - interval '5 minutes'
      )
  returning manage_token into v_token;

  -- A null token means the address is already active or was requested recently.
  -- The API still returns a generic success response to prevent email enumeration.
  return v_token;
end;
$$;

create or replace function public.confirm_newsletter_subscription(p_token uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.newsletter_subscribers
    set status = 'active',
        consented_at = coalesce(consented_at, now()),
        unsubscribed_at = null
  where manage_token = p_token
    and status in ('pending', 'active');

  return found;
end;
$$;

create or replace function public.unsubscribe_newsletter(p_token uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.newsletter_subscribers
    set status = 'unsubscribed',
        unsubscribed_at = coalesce(unsubscribed_at, now())
  where manage_token = p_token;

  return found;
end;
$$;

revoke all on function public.request_newsletter_subscription(text, text, text) from public;
revoke all on function public.confirm_newsletter_subscription(uuid) from public;
revoke all on function public.unsubscribe_newsletter(uuid) from public;

grant execute on function public.request_newsletter_subscription(text, text, text) to anon, authenticated;
grant execute on function public.confirm_newsletter_subscription(uuid) to anon, authenticated;
grant execute on function public.unsubscribe_newsletter(uuid) to anon, authenticated;

