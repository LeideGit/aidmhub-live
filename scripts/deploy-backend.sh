#!/bin/bash
# Deploys schema + Edge Function to a linked Supabase project.
# Prereq: supabase CLI, `supabase login`, `supabase link --project-ref <ref>`,
#         `supabase secrets set --env-file supabase/functions/.env`
set -euo pipefail
cd "$(dirname "$0")/.."
supabase db push
supabase functions deploy bot-reply
echo "Klart. Fyll i src/config.js med projektets URL och anon-nyckel och pusha till main."
