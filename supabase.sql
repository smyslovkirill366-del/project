-- Выполните этот SQL в Supabase Dashboard -> SQL Editor,
-- если приложение получает ошибку permission denied for table homework.

grant usage on schema public to anon;
grant select, insert, update, delete on table public.homework to anon;

-- Для таблицы с автоинкрементом id обычно используется эта sequence.
grant usage, select on sequence public.homework_id_seq to anon;

alter table public.homework enable row level security;

drop policy if exists "Anonymous users can read homework" on public.homework;
create policy "Anonymous users can read homework"
on public.homework for select
to anon
using (true);

drop policy if exists "Anonymous users can add homework" on public.homework;
create policy "Anonymous users can add homework"
on public.homework for insert
to anon
with check (true);

drop policy if exists "Anonymous users can update homework" on public.homework;
create policy "Anonymous users can update homework"
on public.homework for update
to anon
using (true)
with check (true);

drop policy if exists "Anonymous users can delete homework" on public.homework;
create policy "Anonymous users can delete homework"
on public.homework for delete
to anon
using (true);
