-- AI DM HUB – backend schema (ADR-001). All data is fictional (SEC-004).
-- No table, function or column represents a machine control channel (SEC-001).

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Reference data (shared, read-only for clients)
-- ---------------------------------------------------------------------------
create table public.machines (
    machine_id    text primary key,
    name          text not null,
    machine_group text not null,
    status        text not null default 'active',
    owner_roles   text[] not null default '{}'
);

create table public.users (
    user_id    text primary key,
    name       text not null,
    role       text not null,
    role_level int  not null,
    type       text not null default 'human'
);

create table public.bots (
    bot_id       text primary key,
    name         text not null,
    type         text not null default 'bot',
    machine_id   text not null references public.machines,
    capabilities text[] not null default '{}'
);

insert into public.machines (machine_id, name, machine_group, owner_roles) values
    ('HPM-2400', 'Hydraulisk pump HPM-2400', 'Hydraulik', array['maskinansvarig','maskingruppsansvarig']),
    ('TRK-500',  'Tork-enhet TRK-500',       'Tork',      array['maskinansvarig']),
    ('VX-1200',  'Värmesystem VX-1200',      'Värmning',  array['maskingruppsansvarig']);

insert into public.users (user_id, name, role, role_level) values
    ('usr_001', 'Anna Bergström', 'Maskinansvarig',       1),
    ('usr_002', 'Erik Svensson',  'Maskingruppsansvarig', 2),
    ('usr_003', 'Maria Holm',     'Maskinparkansvarig',   3),
    ('usr_004', 'Lars Nyström',   'Underhållstekniker',   1);

insert into public.bots (bot_id, name, machine_id, capabilities) values
    ('bot_hpm', 'HPM-2400 Sensor Bot', 'HPM-2400', array['alert','status','diagnostics','recommendations']),
    ('bot_trk', 'Tork-enhet Monitor',  'TRK-500',  array['temperature','humidity','diagnostics']),
    ('bot_vx',  'Värmesystem Advisor', 'VX-1200',  array['temperature','pressure','efficiency']);

-- ---------------------------------------------------------------------------
-- Session data (one isolated demo scenario per anonymous auth user)
-- ---------------------------------------------------------------------------
create table public.conversations (
    owner           uuid not null default auth.uid() references auth.users on delete cascade,
    conversation_id text not null,
    participant_ids text[] not null,
    type            text not null check (type in ('colleague','alarm','status')),
    title           text not null,
    last_message    text,
    last_activity   timestamptz not null default now(),
    unread_count    int  not null default 0,
    priority        text not null default 'normal' check (priority in ('normal','critical')),
    status          text not null default 'active',
    alarm_id        text,
    case_id         text,
    primary key (owner, conversation_id)
);

create table public.messages (
    owner           uuid not null default auth.uid() references auth.users on delete cascade,
    message_id      text not null default gen_random_uuid()::text,
    conversation_id text not null,
    sender_id       text not null,
    type            text not null check (type in ('text','alarm','decision','delegation','action','bot_response','acknowledgment')),
    text            text not null check (char_length(text) <= 4000),
    metadata        jsonb not null default '{}',
    created_at      timestamptz not null default now(),
    primary key (owner, message_id),
    foreign key (owner, conversation_id) references public.conversations (owner, conversation_id) on delete cascade
);
create index messages_conversation_idx on public.messages (owner, conversation_id, created_at);

create table public.alarms (
    owner             uuid not null default auth.uid() references auth.users on delete cascade,
    alarm_id          text not null,
    machine_id        text not null references public.machines,
    alarm_type        text not null,
    level             int  not null check (level between 1 and 5),
    rule_source       text not null,
    created_at        timestamptz not null default now(),
    ack_deadline      timestamptz not null,
    status            text not null check (status in ('pending','escalated','acknowledged')),
    escalated_to      text,
    escalation_reason text,
    escalated_at      timestamptz,
    acknowledged_at   timestamptz,
    acknowledged_by   text,
    original_message  text not null,
    sensor            text not null,
    sensor_value      numeric not null,
    sensor_unit       text not null,
    normal_value      numeric not null,
    primary key (owner, alarm_id)
);

create table public.cases (
    owner           uuid not null default auth.uid() references auth.users on delete cascade,
    case_id         text not null,
    title           text not null,
    description     text,
    machine_id      text not null references public.machines,
    status          text not null check (status in ('open','resolved')),
    priority        text not null,
    created_at      timestamptz not null default now(),
    closed_at       timestamptz,
    assigned_to     text,
    alarm_ids       text[] not null default '{}',
    conversation_id text,
    primary key (owner, case_id)
);

-- Beslut / Delegering / Åtgärd. Human-recorded, non-binding entries (SEC-005).
create table public.case_events (
    owner       uuid not null default auth.uid() references auth.users on delete cascade,
    event_id    uuid not null default gen_random_uuid(),
    case_id     text not null,
    kind        text not null check (kind in ('decision','delegation','action')),
    actor_id    text not null,
    assignee_id text,
    text        text not null check (char_length(text) <= 4000),
    status      text,
    created_at  timestamptz not null default now(),
    primary key (owner, event_id),
    foreign key (owner, case_id) references public.cases (owner, case_id) on delete cascade
);

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------
alter table public.machines      enable row level security;
alter table public.users         enable row level security;
alter table public.bots          enable row level security;
alter table public.conversations enable row level security;
alter table public.messages      enable row level security;
alter table public.alarms        enable row level security;
alter table public.cases         enable row level security;
alter table public.case_events   enable row level security;

create policy "read reference" on public.machines for select to anon, authenticated using (true);
create policy "read reference" on public.users    for select to anon, authenticated using (true);
create policy "read reference" on public.bots     for select to anon, authenticated using (true);
revoke insert, update, delete on public.machines, public.users, public.bots from anon, authenticated;

create policy "own rows" on public.conversations for all to authenticated using (owner = auth.uid()) with check (owner = auth.uid());
create policy "own rows" on public.messages      for all to authenticated using (owner = auth.uid()) with check (owner = auth.uid());
create policy "own rows" on public.alarms        for all to authenticated using (owner = auth.uid()) with check (owner = auth.uid());
create policy "own rows" on public.cases         for all to authenticated using (owner = auth.uid()) with check (owner = auth.uid());
create policy "own rows" on public.case_events   for all to authenticated using (owner = auth.uid()) with check (owner = auth.uid());
revoke all on public.conversations, public.messages, public.alarms, public.cases, public.case_events from anon;

-- ---------------------------------------------------------------------------
-- Scenario functions (security invoker: RLS applies)
-- ---------------------------------------------------------------------------
create or replace function public.start_scenario() returns void
language plpgsql set search_path = public as $$
declare
    uid uuid := auth.uid();
begin
    if uid is null then raise exception 'not authenticated'; end if;
    if exists (select 1 from conversations where owner = uid) then return; end if;

    insert into conversations (owner, conversation_id, participant_ids, type, title, last_message, last_activity) values
        (uid, 'conv_anna_001', array['usr_001'], 'colleague', 'Anna Bergström',      'Kan du checka HPM-2400 senare?', now() - interval '300 seconds'),
        (uid, 'conv_lars_001', array['usr_004'], 'colleague', 'Lars Nyström',        'TRK-500 är nu servicerad',       now() - interval '420 seconds'),
        (uid, 'conv_hpm_001',  array['bot_hpm'], 'alarm',     'HPM-2400 Sensor Bot', 'Väntar på instruktioner',        now() - interval '60 seconds'),
        (uid, 'conv_trk_001',  array['bot_trk'], 'status',    'Tork-enhet Monitor',  'Systemet fungerar normalt',      now() - interval '120 seconds'),
        (uid, 'conv_vx_001',   array['bot_vx'],  'status',    'Värmesystem Advisor', 'Temperaturen är stabil',         now() - interval '180 seconds');

    insert into messages (owner, message_id, conversation_id, sender_id, type, text, created_at) values
        (uid, 'msg_anna_001',    'conv_anna_001', 'usr_001', 'text', 'Hej! Kan du checka HPM-2400 senare? Den har varit lite instabil denna veckan.', now() - interval '300 seconds'),
        (uid, 'msg_anna_002',    'conv_anna_001', 'usr_001', 'text', 'Trycknivåerna varierar mellan 45 och 52 bar. Normalt bör det vara 50±2.', now() - interval '290 seconds'),
        (uid, 'msg_anna_003',    'conv_anna_001', 'usr_001', 'text', 'Låt mig veta när du hinner. Tack!', now() - interval '280 seconds'),
        (uid, 'msg_lars_001',    'conv_lars_001', 'usr_004', 'text', 'Uppdatering: TRK-500 är nu färdig efter service. Testade värmecykeln - allt ser bra ut.', now() - interval '420 seconds'),
        (uid, 'msg_lars_002',    'conv_lars_001', 'usr_004', 'text', 'Temperaturkurvan är nu stabil 80-85°C under drift. Filtren var kraftigt igensatta - det var problemet.', now() - interval '410 seconds'),
        (uid, 'msg_lars_003',    'conv_lars_001', 'usr_004', 'text', 'Maskinen är tillbaka i produktion. Nästa service: om 3 månader enligt schema.', now() - interval '400 seconds'),
        (uid, 'msg_bot_hpm_001', 'conv_hpm_001',  'bot_hpm', 'text', 'Status: HPM-2400 operativ. Tryck: 50 bar, Temperatur: 82°C. Allt normalt.', now() - interval '600 seconds'),
        (uid, 'msg_bot_hpm_002', 'conv_hpm_001',  'bot_hpm', 'text', 'Senaste timmen: Genomsnittligt tryck 49.8 bar. En kortvarig avvikelse vid 14:23 (48.2 bar) - möjligt pump-brus.', now() - interval '180 seconds'),
        (uid, 'msg_bot_hpm_003', 'conv_hpm_001',  'bot_hpm', 'text', 'Rekommendation: Kontrollera pumpskruv och försörjningsventil imorgon. Ingenting brådskande.', now() - interval '170 seconds'),
        (uid, 'msg_bot_trk_001', 'conv_trk_001',  'bot_trk', 'text', 'TRK-500 status: Systemet fungerar normalt. Temperatur: 85°C, Fuktighet: 15%, Filterövervakning: OK.', now() - interval '540 seconds'),
        (uid, 'msg_bot_trk_002', 'conv_trk_001',  'bot_trk', 'text', 'Efterservice: Filterbyte genomfört 2024-10-10. Nästa planerat: 2025-01-10.', now() - interval '360 seconds'),
        (uid, 'msg_bot_trk_003', 'conv_trk_001',  'bot_trk', 'text', 'Systemet körs utan avvikelser denna vecka. Produktionsvolym: 480 ton torkat material.', now() - interval '120 seconds'),
        (uid, 'msg_bot_vx_001',  'conv_vx_001',   'bot_vx',  'text', 'VX-1200 värmesystem: Bränsleförbrukning normal. Temperaturkurva: 72-78°C under 6h drift.', now() - interval '480 seconds'),
        (uid, 'msg_bot_vx_002',  'conv_vx_001',   'bot_vx',  'text', 'Effektivitet: 94.2% (normalt: 92-96%). Ingen anomali detekterad.', now() - interval '240 seconds'),
        (uid, 'msg_bot_vx_003',  'conv_vx_001',   'bot_vx',  'text', 'Temperaturreglering är stabil. Rekommendation: Rutinunderhåll av värmeelement planeras för nästa månad.', now() - interval '180 seconds');

    insert into cases (owner, case_id, title, description, machine_id, status, priority, created_at, closed_at, assigned_to) values
        (uid, 'CASE-001', 'HPM-2400 vibrationer', 'Ökad vibrationsnivå uppmätt',  'HPM-2400', 'resolved', 'normal', now() - interval '1 day', now() - interval '12 hours', 'usr_004'),
        (uid, 'CASE-002', 'TRK-500 filterbyte',   'Planerat filterbyte genomfört', 'TRK-500',  'resolved', 'normal', now() - interval '2 days', now() - interval '1 day',    'usr_004');
end;
$$;

create or replace function public.reset_scenario() returns void
language plpgsql set search_path = public as $$
declare
    uid uuid := auth.uid();
begin
    if uid is null then raise exception 'not authenticated'; end if;
    delete from case_events   where owner = uid;
    delete from messages      where owner = uid;
    delete from alarms        where owner = uid;
    delete from cases         where owner = uid;
    delete from conversations where owner = uid;
    perform start_scenario();
end;
$$;

-- Idempotent: a reload after the alarm fired returns the existing alarm instead of creating a new one.
create or replace function public.trigger_alarm() returns jsonb
language plpgsql set search_path = public as $$
declare
    uid     uuid := auth.uid();
    v_now   timestamptz := now();
    v_case  text;
begin
    if uid is null then raise exception 'not authenticated'; end if;

    if exists (select 1 from alarms where owner = uid and alarm_id = 'alarm_critical_001') then
        select case_id into v_case from conversations where owner = uid and conversation_id = 'conv_hpm_001';
        return jsonb_build_object('alarmId', 'alarm_critical_001', 'caseId', v_case, 'alreadyTriggered', true);
    end if;

    select 'CASE-' || lpad((count(*) + 1)::text, 3, '0') into v_case from cases where owner = uid;

    insert into alarms (owner, alarm_id, machine_id, alarm_type, level, rule_source, created_at, ack_deadline, status,
                        escalated_to, escalation_reason, escalated_at, original_message, sensor, sensor_value, sensor_unit, normal_value)
    values (uid, 'alarm_critical_001', 'HPM-2400', 'TemperatureOverrun', 5, 'machine_rules_v1', v_now, v_now + interval '30 seconds', 'escalated',
            'usr_002', 'no_ack_timeout', v_now, 'Temperaturöverskridning detekterad på HPM-2400', 'TEMP_01', 127, '°C', 85);

    insert into cases (owner, case_id, title, description, machine_id, status, priority, created_at, alarm_ids, conversation_id)
    values (uid, v_case, 'KRITISK: Temperaturöverskridning HPM-2400', 'Automatisk eskalering - Maskinansvarig svarade inte i tid',
            'HPM-2400', 'open', 'critical', v_now, array['alarm_critical_001'], 'conv_hpm_001');

    update conversations
       set alarm_id = 'alarm_critical_001', case_id = v_case, priority = 'critical', status = 'escalated',
           last_activity = v_now, last_message = 'Temperaturöverskridning detekterad på HPM-2400', unread_count = 1
     where owner = uid and conversation_id = 'conv_hpm_001';

    insert into messages (owner, conversation_id, sender_id, type, text, metadata, created_at)
    values (uid, 'conv_hpm_001', 'bot_hpm', 'alarm',
            format(E'🚨 KRITISKT LARM: Temperaturöverskridning detekterad på HPM-2400.\n\nÄrende: %s\n\nSensor TEMP_01 rapporterar: 127°C (normal: 85°C)\nAvvikelse: +42°C\n\nORSAK: Maskinansvarig (Anna Bergström) kvitterade inte larmet inom 30 sekunder. Larmet har eskalerat till Maskingruppsansvarig.', v_case),
            jsonb_build_object('alarmType', 'TemperatureOverrun', 'level', 5, 'sensor', 'TEMP_01', 'value', 127, 'unit', '°C',
                               'threshold', 85, 'escalatedBecause', 'no_ack_timeout', 'escalatedFromRole', 'Maskinansvarig',
                               'escalatedToRole', 'Maskingruppsansvarig', 'caseId', v_case),
            v_now);

    return jsonb_build_object('alarmId', 'alarm_critical_001', 'caseId', v_case, 'alreadyTriggered', false);
end;
$$;

create or replace function public.acknowledge_alarm(p_user_id text) returns void
language plpgsql set search_path = public as $$
declare
    uid    uuid := auth.uid();
    v_name text;
begin
    if uid is null then raise exception 'not authenticated'; end if;
    select name into v_name from users where user_id = p_user_id;
    if v_name is null then raise exception 'unknown user %', p_user_id; end if;

    update alarms set status = 'acknowledged', acknowledged_at = now(), acknowledged_by = p_user_id
     where owner = uid and alarm_id = 'alarm_critical_001' and status <> 'acknowledged';
    if not found then return; end if;

    update conversations set priority = 'normal', status = 'acknowledged'
     where owner = uid and conversation_id = 'conv_hpm_001';

    insert into messages (owner, conversation_id, sender_id, type, text, metadata)
    values (uid, 'conv_hpm_001', p_user_id, 'acknowledgment', 'Larmet har mottagits och uppmärksammats.',
            jsonb_build_object('acknowledgedAt', now(), 'acknowledgedBy', v_name));
end;
$$;

revoke execute on function public.start_scenario(), public.reset_scenario(), public.trigger_alarm(), public.acknowledge_alarm(text) from public, anon;
grant  execute on function public.start_scenario(), public.reset_scenario(), public.trigger_alarm(), public.acknowledge_alarm(text) to authenticated;

create or replace function public.touch_conversation() returns trigger
language plpgsql set search_path = public as $$
begin
    update conversations
       set last_activity = new.created_at,
           last_message  = left(case when new.type = 'bot_response' then coalesce(new.metadata->>'recommendation', new.text) else new.text end, 140)
     where owner = new.owner and conversation_id = new.conversation_id;
    return new;
end;
$$;

create trigger messages_touch_conversation after insert on public.messages
for each row execute function public.touch_conversation();
