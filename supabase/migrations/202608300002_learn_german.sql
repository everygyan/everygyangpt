-- EveryGyan Learn German curriculum and learner progress
-- Apply after the earlier EveryGyan migrations.

create table if not exists public.german_levels (
  code text primary key check (code in ('A1','A2','B1','B2','C1')),
  title text not null,
  description text not null,
  outcome text not null,
  color text not null default '#1cb0f6',
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.german_lessons (
  slug text primary key,
  level text not null references public.german_levels(code) on update cascade on delete restrict,
  unit_title text not null,
  unit_order integer not null default 0,
  lesson_order integer not null default 0,
  title text not null,
  description text not null,
  icon text not null default '📘',
  estimated_minutes integer not null default 5 check (estimated_minutes between 1 and 120),
  xp_reward integer not null default 10 check (xp_reward between 0 and 1000),
  content jsonb not null default '{}'::jsonb,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (level, unit_order, lesson_order)
);

create table if not exists public.german_resources (
  id uuid primary key default gen_random_uuid(),
  level text not null default 'ALL' check (level in ('ALL','A1','A2','B1','B2','C1')),
  title text not null,
  provider text not null,
  description text not null,
  url text not null check (url ~ '^https://'),
  resource_type text not null default 'Practice',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, title)
);

create table if not exists public.german_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_slug text not null references public.german_lessons(slug) on update cascade on delete cascade,
  status text not null default 'started' check (status in ('started','completed')),
  score integer not null default 0 check (score between 0 and 100),
  xp_earned integer not null default 0 check (xp_earned >= 0),
  attempts integer not null default 1 check (attempts >= 0),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, lesson_slug)
);

create index if not exists german_lessons_level_order_idx on public.german_lessons(level, unit_order, lesson_order);
create index if not exists german_progress_user_idx on public.german_progress(user_id, updated_at desc);

drop trigger if exists set_german_levels_updated_at on public.german_levels;
create trigger set_german_levels_updated_at before update on public.german_levels
for each row execute procedure public.set_updated_at();
drop trigger if exists set_german_lessons_updated_at on public.german_lessons;
create trigger set_german_lessons_updated_at before update on public.german_lessons
for each row execute procedure public.set_updated_at();
drop trigger if exists set_german_resources_updated_at on public.german_resources;
create trigger set_german_resources_updated_at before update on public.german_resources
for each row execute procedure public.set_updated_at();
drop trigger if exists set_german_progress_updated_at on public.german_progress;
create trigger set_german_progress_updated_at before update on public.german_progress
for each row execute procedure public.set_updated_at();

alter table public.german_levels enable row level security;
alter table public.german_lessons enable row level security;
alter table public.german_resources enable row level security;
alter table public.german_progress enable row level security;

drop policy if exists "Published German levels are public" on public.german_levels;
create policy "Published German levels are public" on public.german_levels for select using (is_published);
drop policy if exists "Published German lessons are public" on public.german_lessons;
create policy "Published German lessons are public" on public.german_lessons for select using (is_published);
drop policy if exists "Active German resources are public" on public.german_resources;
create policy "Active German resources are public" on public.german_resources for select using (is_active);

drop policy if exists "Admins manage German levels" on public.german_levels;
create policy "Admins manage German levels" on public.german_levels for all to authenticated
using (public.is_staff(array['admin']::public.app_role[]))
with check (public.is_staff(array['admin']::public.app_role[]));
drop policy if exists "Admins manage German lessons" on public.german_lessons;
create policy "Admins manage German lessons" on public.german_lessons for all to authenticated
using (public.is_staff(array['admin']::public.app_role[]))
with check (public.is_staff(array['admin']::public.app_role[]));
drop policy if exists "Admins manage German resources" on public.german_resources;
create policy "Admins manage German resources" on public.german_resources for all to authenticated
using (public.is_staff(array['admin']::public.app_role[]))
with check (public.is_staff(array['admin']::public.app_role[]));

drop policy if exists "Learners read their German progress" on public.german_progress;
create policy "Learners read their German progress" on public.german_progress for select to authenticated
using (user_id = auth.uid() or public.is_staff(array['admin']::public.app_role[]));
drop policy if exists "Learners create their German progress" on public.german_progress;
create policy "Learners create their German progress" on public.german_progress for insert to authenticated
with check (user_id = auth.uid());
drop policy if exists "Learners update their German progress" on public.german_progress;
create policy "Learners update their German progress" on public.german_progress for update to authenticated
using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "Learners delete their German progress" on public.german_progress;
create policy "Learners delete their German progress" on public.german_progress for delete to authenticated
using (user_id = auth.uid() or public.is_staff(array['admin']::public.app_role[]));

grant select on public.german_levels, public.german_lessons, public.german_resources to anon, authenticated;
grant insert, update, delete on public.german_levels, public.german_lessons, public.german_resources to authenticated;
grant select, insert, update, delete on public.german_progress to authenticated;

insert into public.german_levels (code, title, description, outcome, color, sort_order) values
  ('A1', 'First steps', 'Meet people, introduce yourself and handle simple daily situations.', 'Understand and use familiar everyday expressions.', '#1cb0f6', 1),
  ('A2', 'Everyday German', 'Talk about routines, travel, shopping and the world around you.', 'Communicate in common, predictable situations.', '#58cc02', 2),
  ('B1', 'Independent speaker', 'Tell stories, explain plans and deal with life in a German-speaking country.', 'Handle most situations while travelling or living independently.', '#ffb020', 3),
  ('B2', 'Confident conversation', 'Discuss ideas, understand detailed texts and express clear viewpoints.', 'Interact fluently and argue a position with detail.', '#ff6b35', 4),
  ('C1', 'Advanced expression', 'Use flexible, precise German for study, work and complex topics.', 'Understand demanding content and communicate spontaneously.', '#8b5cf6', 5)
on conflict (code) do update set title = excluded.title, description = excluded.description, outcome = excluded.outcome, color = excluded.color, sort_order = excluded.sort_order, is_published = true;

insert into public.german_lessons (slug, level, unit_title, unit_order, lesson_order, title, description, icon, estimated_minutes, xp_reward, content) values
('a1-greetings','A1','Meet and greet',1,1,'Hello, Germany!','Greet someone and say goodbye.','👋',5,10,'{"phrases":[{"german":"Guten Morgen!","english":"Good morning!"},{"german":"Wie geht es dir?","english":"How are you?"},{"german":"Auf Wiedersehen!","english":"Goodbye!"}],"exercise":{"prompt":"Which phrase means ‘Good morning’?","choices":["Gute Nacht","Guten Morgen","Bis später"],"answer":1,"explanation":"‘Guten Morgen’ is used in the morning; later in the day you can say ‘Guten Tag’."}}'::jsonb),
('a1-introductions','A1','Meet and greet',1,2,'Introduce yourself','Share your name and where you come from.','🙂',6,10,'{"phrases":[{"german":"Ich heiße Sandeep.","english":"My name is Sandeep."},{"german":"Ich komme aus Indien.","english":"I come from India."},{"german":"Freut mich!","english":"Nice to meet you!"}],"exercise":{"prompt":"Complete: Ich ___ aus Indien.","choices":["komme","heiße","wohne"],"answer":0,"explanation":"‘kommen aus’ expresses where somebody comes from."}}'::jsonb),
('a1-cafe','A1','Daily essentials',2,1,'At the café','Order politely and ask for the bill.','☕',7,12,'{"phrases":[{"german":"Ich möchte einen Kaffee, bitte.","english":"I would like a coffee, please."},{"german":"Sonst noch etwas?","english":"Anything else?"},{"german":"Die Rechnung, bitte.","english":"The bill, please."}],"exercise":{"prompt":"How do you politely ask for the bill?","choices":["Die Rechnung, bitte.","Wo ist der Bahnhof?","Ich bin müde."],"answer":0,"explanation":"‘bitte’ makes the request polite."}}'::jsonb),
('a2-routine','A2','My day',1,1,'Daily routine','Describe what happens during your day.','⏰',7,14,'{"phrases":[{"german":"Ich stehe um sieben Uhr auf.","english":"I get up at seven o’clock."},{"german":"Danach fahre ich zur Arbeit.","english":"After that I travel to work."},{"german":"Abends koche ich gern.","english":"In the evening I like cooking."}],"exercise":{"prompt":"Which word means ‘after that’?","choices":["zuerst","danach","gestern"],"answer":1,"explanation":"‘danach’ connects events in sequence."}}'::jsonb),
('a2-directions','A2','Out and about',2,1,'Find your way','Ask for and understand simple directions.','🗺️',8,14,'{"phrases":[{"german":"Wie komme ich zum Bahnhof?","english":"How do I get to the station?"},{"german":"Gehen Sie geradeaus.","english":"Go straight ahead."},{"german":"Dann links an der Ampel.","english":"Then left at the traffic light."}],"exercise":{"prompt":"What does ‘geradeaus’ mean?","choices":["to the right","straight ahead","behind"],"answer":1,"explanation":"‘geradeaus gehen’ means to continue straight ahead."}}'::jsonb),
('a2-shopping','A2','Out and about',2,2,'Shopping smart','Ask about sizes, prices and preferences.','🛍️',7,14,'{"phrases":[{"german":"Wie viel kostet das?","english":"How much does that cost?"},{"german":"Haben Sie das in Größe M?","english":"Do you have that in size M?"},{"german":"Das gefällt mir.","english":"I like that."}],"exercise":{"prompt":"Choose the question about price.","choices":["Wie viel kostet das?","Welche Größe tragen Sie?","Kann ich helfen?"],"answer":0,"explanation":"‘wie viel’ asks how much or how many."}}'::jsonb),
('b1-past-events','B1','Tell your story',1,1,'What happened?','Talk about experiences using the conversational past.','📖',9,18,'{"phrases":[{"german":"Ich habe Berlin besucht.","english":"I visited Berlin."},{"german":"Wir sind früh angekommen.","english":"We arrived early."},{"german":"Es hat mir sehr gefallen.","english":"I liked it very much."}],"exercise":{"prompt":"Which auxiliary belongs with ‘angekommen’?","choices":["haben","sein","werden"],"answer":1,"explanation":"Movement and change-of-state verbs commonly form the Perfekt with ‘sein’."}}'::jsonb),
('b1-opinions','B1','Express yourself',2,1,'Give your opinion','Agree, disagree and explain a reason.','💬',9,18,'{"phrases":[{"german":"Meiner Meinung nach …","english":"In my opinion …"},{"german":"Ich stimme dir zu.","english":"I agree with you."},{"german":"Da bin ich anderer Meinung.","english":"I have a different opinion about that."}],"exercise":{"prompt":"Which phrase politely signals disagreement?","choices":["Genau!","Da bin ich anderer Meinung.","Das weiß ich nicht."],"answer":1,"explanation":"It states disagreement neutrally and is useful in discussions."}}'::jsonb),
('b1-plans','B1','Express yourself',2,2,'Plans and possibilities','Discuss goals, wishes and conditions.','🎯',10,20,'{"phrases":[{"german":"Ich würde gern in Deutschland studieren.","english":"I would like to study in Germany."},{"german":"Wenn ich Zeit habe, lerne ich Deutsch.","english":"When I have time, I learn German."},{"german":"Mein Ziel ist, fließend zu sprechen.","english":"My goal is to speak fluently."}],"exercise":{"prompt":"Which form makes a wish sound polite?","choices":["ich werde","ich würde gern","ich musste"],"answer":1,"explanation":"‘würde gern’ is a common polite way to express a wish."}}'::jsonb),
('b2-arguments','B2','Build an argument',1,1,'Pros and cons','Structure a balanced argument clearly.','⚖️',11,22,'{"phrases":[{"german":"Einerseits …, andererseits …","english":"On the one hand …, on the other hand …"},{"german":"Ein wesentlicher Vorteil besteht darin, dass …","english":"A key advantage is that …"},{"german":"Dagegen spricht jedoch, dass …","english":"However, an argument against it is that …"}],"exercise":{"prompt":"Which pair contrasts two sides of an issue?","choices":["weder … noch","einerseits … andererseits","sowohl … als auch"],"answer":1,"explanation":"The paired connector frames contrasting perspectives."}}'::jsonb),
('b2-relative-clauses','B2','Precision',2,1,'Add precise detail','Connect information with relative clauses.','🔗',10,22,'{"phrases":[{"german":"Das ist die Stadt, in der ich lebe.","english":"That is the city in which I live."},{"german":"Der Kurs, den ich besuche, ist anspruchsvoll.","english":"The course I attend is demanding."},{"german":"Menschen, die viel lesen, erweitern ihren Wortschatz.","english":"People who read a lot expand their vocabulary."}],"exercise":{"prompt":"Complete: Das ist die Stadt, in ___ ich lebe.","choices":["den","der","das"],"answer":1,"explanation":"‘in’ describes location here, so it takes dative; ‘die Stadt’ becomes ‘der’."}}'::jsonb),
('b2-workplace','B2','Precision',2,2,'Professional German','Communicate clearly in meetings and email.','💼',12,24,'{"phrases":[{"german":"Könnten Sie das bitte näher erläutern?","english":"Could you please explain that in more detail?"},{"german":"Ich fasse die Ergebnisse kurz zusammen.","english":"I’ll briefly summarise the results."},{"german":"Für Rückfragen stehe ich gern zur Verfügung.","english":"I am happy to answer any questions."}],"exercise":{"prompt":"Which sentence is appropriate at the end of a formal email?","choices":["Bis dann!","Für Rückfragen stehe ich gern zur Verfügung.","Was meinst du?"],"answer":1,"explanation":"It is a conventional, professional offer to answer follow-up questions."}}'::jsonb),
('c1-nuance','C1','Nuance and style',1,1,'Say exactly what you mean','Choose precise language and soften claims.','🎨',13,28,'{"phrases":[{"german":"Es lässt sich kaum bestreiten, dass …","english":"It can hardly be denied that …"},{"german":"Das trifft nur bedingt zu.","english":"That is only partly true."},{"german":"Unter Umständen könnte …","english":"Under certain circumstances … could …"}],"exercise":{"prompt":"Which phrase limits a claim rather than fully rejecting it?","choices":["Das trifft nur bedingt zu.","Das ist völlig falsch.","Das steht außer Frage."],"answer":0,"explanation":"‘nur bedingt’ adds nuance by saying something is true only under limitations."}}'::jsonb),
('c1-nominal-style','C1','Academic and formal German',2,1,'Formal written style','Recognise compact nominal structures in formal texts.','🧠',14,30,'{"phrases":[{"german":"Nach Abschluss der Untersuchung …","english":"After completion of the investigation …"},{"german":"Die Umsetzung der Maßnahmen …","english":"The implementation of the measures …"},{"german":"Unter Berücksichtigung aller Faktoren …","english":"Taking all factors into account …"}],"exercise":{"prompt":"Which option has the most formal nominal style?","choices":["Nachdem wir alles geprüft hatten …","Nach Abschluss der Prüfung …","Als wir mit dem Prüfen fertig waren …"],"answer":1,"explanation":"Formal German often condenses actions into noun phrases such as ‘nach Abschluss’."}}'::jsonb),
('c1-discussion','C1','Academic and formal German',2,2,'Lead a complex discussion','Intervene, clarify and synthesise viewpoints.','🗣️',14,30,'{"phrases":[{"german":"Darf ich an diesem Punkt kurz einhaken?","english":"May I briefly come in at this point?"},{"german":"Wenn ich Sie richtig verstehe, …","english":"If I understand you correctly, …"},{"german":"Zusammenfassend lässt sich feststellen, dass …","english":"In summary, it can be concluded that …"}],"exercise":{"prompt":"Which phrase checks your understanding before responding?","choices":["Wenn ich Sie richtig verstehe …","Das kommt nicht infrage.","Nebenbei bemerkt …"],"answer":0,"explanation":"It paraphrases the other speaker’s position and invites correction."}}'::jsonb)
on conflict (slug) do update set level = excluded.level, unit_title = excluded.unit_title, unit_order = excluded.unit_order, lesson_order = excluded.lesson_order, title = excluded.title, description = excluded.description, icon = excluded.icon, estimated_minutes = excluded.estimated_minutes, xp_reward = excluded.xp_reward, content = excluded.content, is_published = true;

insert into public.german_resources (level, title, provider, description, url, resource_type, sort_order) values
('ALL','Deutsch für dich','Goethe-Institut','Free vocabulary, grammar, reading and listening practice from beginner to advanced.','https://www.goethe.de/prj/dfd/en/home.cfm','Practice',1),
('ALL','Free German exercises','Goethe-Institut','Exercises, apps, films, podcasts and games for independent practice.','https://www.goethe.de/ueben','Mixed media',2),
('ALL','Free online German course','DeutschAkademie','A CEFR-aligned exercise library covering A1 through C1.','https://www.deutschakademie.de/en/online-deutschkurs/','Exercises',3),
('ALL','Official exam training','Goethe-Institut','Free practice materials for Goethe examinations from A1 through C1 and beyond.','https://www.goethe.de/en/spr/prf/ueb.html','Exam practice',4)
on conflict (provider, title) do update set level = excluded.level, description = excluded.description, url = excluded.url, resource_type = excluded.resource_type, sort_order = excluded.sort_order, is_active = true;

-- Point the existing Learn German navigation item at the dedicated course page.
update public.menu_items
set url = '/learn-german', section_id = null, category_id = null
where lower(trim(label)) = 'learn german';
