-- Planeringstavla (skrivskyddad). Rader seedas från project/implementation-plan.md.
-- Kolumn (now/next/later) är satt efter fas: Fas 1–2 = now, Fas 3 = next, Fas 4–5 = later.
-- Ändra kolumn med SQL i Supabase-dashboarden; sidan har ingen skrivåtkomst.

create table public.planning_tasks (
    task_id    text primary key,
    phase      int  not null check (phase between 1 and 5),
    feature_id text not null,
    title      text not null,
    estimate   text not null,
    owner      text not null,
    blocker    text not null,
    column_id  text not null check (column_id in ('now','next','later')),
    position   int  not null
);

alter table public.planning_tasks enable row level security;

-- Läsbar för anon och inloggade; inga insert/update/delete-policys = ingen skrivåtkomst från klienten.
create policy "read planning" on public.planning_tasks for select to anon, authenticated using (true);
grant select on public.planning_tasks to anon, authenticated;

insert into public.planning_tasks (task_id, phase, feature_id, title, estimate, owner, blocker, column_id, position) values
    ('t001', 1, 'Setup', 'Skapa `src/index.html` grundstruktur', '1d', 'Dev', 'Ingen', 'now', 1),
    ('t002', 1, 'Setup', 'Skapa `src/styles.css` layout-grund (desktop-first)', '1d', 'Design', 'Ingen', 'now', 2),
    ('t003', 1, 'Setup', 'Skapa `src/mockData.js` med användare, botar, konversationer', '2d', 'Product', 'Mockdata-godkännande (OQ-002)', 'now', 3),
    ('t004', 1, 'FEAT-responsive', 'Media queries för tablet (768px), mobil (375px)', '1d', 'Dev', 'Ingen', 'now', 4),
    ('t005', 1, 'FEAT-DM-list', 'Rendera DM-lista från mockData', '1d', 'Dev', 'mockData', 'now', 5),
    ('t006', 1, 'FEAT-DM-list', 'Styling för typ-märkningar (👤, 🤖), oläst-indikatorer', '1d', 'Design', 'Ingen', 'now', 6),
    ('t007', 1, 'FEAT-accessibility', 'ARIA-labels och semantik på DM-listan', '1d', 'QA', 'FEAT-DM-list klar', 'now', 7),
    ('t008', 2, 'FEAT-critical-alert', 'Implementera `setTimeout(10000)` för larmutlösning', '1d', 'Dev', 'Ingen', 'now', 8),
    ('t009', 2, 'FEAT-critical-alert', 'Larmöbjekt skapas, status → "escalated"', '1d', 'Dev', 'mockData', 'now', 9),
    ('t010', 2, 'FEAT-critical-alert', 'Märking: röd bakgrund, ⚠️-ikon, "KRITISK ESCALERING"-text', '1d', 'Design', 'Ingen', 'now', 10),
    ('t011', 2, 'FEAT-critical-alert', 'Larmdetaljer-vyn (ursprungligt larm, maskin, prioritet, eskaleringsorsak)', '1d', 'Dev', 'FEAT-DM-list', 'now', 11),
    ('t012', 2, 'FEAT-conversation', 'Konversations-komponent rendering från mockData', '1d', 'Dev', 'mockData', 'now', 12),
    ('t013', 2, 'FEAT-conversation', 'Botsvar: skilj data, tolkning, rekommendation visuellt', '1d', 'Design', 'Ingen', 'now', 13),
    ('t014', 2, 'FEAT-conversation', 'Q&A-flöde: Användaren kan ställa följdfrågor, få mockade svar', '2d', 'Dev', 'FEAT-conversation', 'now', 14),
    ('t015', 3, 'FEAT-actions', 'Tre knappar: Beslut, Delegering, Åtgärd', '1d', 'Dev', 'FEAT-conversation', 'next', 15),
    ('t016', 3, 'FEAT-actions', 'Modals för inmatning', '1d', 'Design', 'Ingen', 'next', 16),
    ('t017', 3, 'FEAT-actions', 'Spara actions till konversation med metadata', '2d', 'Dev', 'FEAT-actions buttons', 'next', 17),
    ('t018', 3, 'FEAT-mentions', '@-sökning implementering', '1d', 'Dev', 'mockData', 'next', 18),
    ('t019', 3, 'FEAT-mentions', 'Infogning av @-omnämnanden i chatfält', '1d', 'Dev', 'FEAT-mentions search', 'next', 19),
    ('t020', 3, 'FEAT-slashcommands', '/-sökning implementering', '1d', 'Dev', 'mockData', 'next', 20),
    ('t021', 3, 'FEAT-slashcommands', 'Infogning av /-referenser i chatfält', '1d', 'Dev', 'FEAT-slashcommands search', 'next', 21),
    ('t022', 4, 'FEAT-history', 'Historik-komponent rendering', '1d', 'Dev', 'FEAT-actions', 'later', 22),
    ('t023', 4, 'FEAT-history', 'Kronologisk sortering av alla händelser', '1d', 'Dev', 'mockData', 'later', 23),
    ('t024', 4, 'FEAT-history', 'Visning av aktör, typ, tidsstämpel, text', '1d', 'Dev', 'FEAT-history render', 'later', 24),
    ('t025', 5, 'FEAT-demo-reset', 'Reset-knapp implementering', '1d', 'Dev', 'FEAT-critical-alert', 'later', 25),
    ('t026', 5, 'FEAT-demo-reset', 'Återställ demo-state, möjliggör upprepad körning', '1d', 'Dev', 'FEAT-demo-reset button', 'later', 26),
    ('t027', 5, 'FEAT-accessibility', 'Keyboard-navigation överallt (Tab, Enter, Escape)', '2d', 'QA', 'Alla FEAT', 'later', 27),
    ('t028', 5, 'FEAT-accessibility', 'Fokus-indikatorer synliga', '1d', 'Design', 'Ingen', 'later', 28),
    ('t029', 5, 'FEAT-accessibility', 'Skärmläsare-test (ARIA, semantik)', '1d', 'QA', 'Alla FEAT', 'later', 29),
    ('t030', 5, 'FEAT-security-barriers', 'Verifiera: ingen maskinstyrning i UI', '1d', 'Security', 'Alla FEAT', 'later', 30),
    ('t031', 5, 'FEAT-security-barriers', 'Verifiera: all data är fiktiv', '1d', 'QA', 'Alla FEAT', 'later', 31);
