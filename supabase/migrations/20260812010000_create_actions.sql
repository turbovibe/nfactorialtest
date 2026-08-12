create table public.action_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  calendar_provider text check (calendar_provider in ('google', 'outlook')),
  calendar_url text,
  human_handoff_enabled boolean not null default false,
  handoff_email text,
  updated_at timestamptz not null default now(),
  unique (organization_id)
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 100),
  price numeric(12, 2) not null check (price >= 0),
  description text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 100),
  email text not null,
  status text not null default 'new' check (status in ('new', 'qualified', 'won', 'lost')),
  source text not null default 'manual',
  created_at timestamptz not null default now()
);

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  customer_name text not null,
  customer_email text not null,
  starts_at timestamptz not null,
  status text not null default 'booked' check (status in ('booked', 'completed', 'cancelled')),
  created_at timestamptz not null default now()
);

create table public.action_permissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  action_key text not null check (action_key in ('create_lead', 'book_appointment', 'share_product', 'human_handoff')),
  mode text not null default 'approval' check (mode in ('automatic', 'approval', 'disabled')),
  updated_at timestamptz not null default now(),
  unique (organization_id, action_key)
);

create table public.action_audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.action_settings enable row level security;
alter table public.products enable row level security;
alter table public.leads enable row level security;
alter table public.appointments enable row level security;
alter table public.action_permissions enable row level security;
alter table public.action_audit_logs enable row level security;

do $$
declare table_name text;
begin
  foreach table_name in array array['action_settings', 'products', 'leads', 'appointments', 'action_permissions'] loop
    execute format('create policy "read own %1$s" on public.%1$I for select using (auth.uid() = user_id)', table_name);
    execute format('create policy "insert own %1$s" on public.%1$I for insert with check (auth.uid() = user_id)', table_name);
    execute format('create policy "update own %1$s" on public.%1$I for update using (auth.uid() = user_id) with check (auth.uid() = user_id)', table_name);
    execute format('create policy "delete own %1$s" on public.%1$I for delete using (auth.uid() = user_id)', table_name);
  end loop;
end $$;

create policy "read own action audit logs"
  on public.action_audit_logs for select
  using (auth.uid() = user_id);

create or replace function public.write_action_audit_log()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    insert into public.action_audit_logs (user_id, organization_id, action, entity_type, entity_id)
    values (old.user_id, old.organization_id, lower(tg_op), tg_table_name, old.id);
    return old;
  end if;

  insert into public.action_audit_logs (user_id, organization_id, action, entity_type, entity_id)
  values (new.user_id, new.organization_id, lower(tg_op), tg_table_name, new.id);
  return new;
end;
$$;

do $$
declare table_name text;
begin
  foreach table_name in array array['action_settings', 'products', 'leads', 'appointments', 'action_permissions'] loop
    execute format('create trigger audit_%1$s after insert or update or delete on public.%1$I for each row execute function public.write_action_audit_log()', table_name);
  end loop;
end $$;
