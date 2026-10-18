-- Move optional legacy contact columns without logging contact values.
-- Existing deployed baseline has none; support drifted instances without losing data.
do $$
declare col text;
begin
  foreach col in array array['email','phone'] loop
    if exists (select 1 from information_schema.columns where table_schema='public'
      and table_name='artists' and column_name=col) then
      execute format('insert into public.artist_contacts(artist_id, %1$I)
        select id, %1$I from public.artists where %1$I is not null
        on conflict(artist_id) do update set %1$I = coalesce(artist_contacts.%1$I, excluded.%1$I)', col);
      -- No CASCADE: a dependent view must be migrated explicitly rather than silently removed.
      execute format('alter table public.artists drop column %I', col);
    end if;
  end loop;
end;
$$;
