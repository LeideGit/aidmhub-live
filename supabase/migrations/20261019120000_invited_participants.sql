-- FR-021 / AC-004 / AC-009: participants coupled into a conversation via @-mention.
alter table public.conversations
    add column if not exists invited_ids text[] not null default '{}';

-- reset_scenario deletes and re-creates conversations, so invited_ids is cleared on reset.
