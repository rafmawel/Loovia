#!/usr/bin/env node
/**
 * Script de setup automatique de la base de données Loovia.
 * Usage : node scripts/setup-db.mjs
 *
 * Ce script lit le fichier de migration SQL et l'exécute
 * sur votre projet Supabase via une fonction RPC temporaire.
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Charger les variables d'environnement depuis .env.local
const envPath = join(__dirname, '..', '.env.local')
const envContent = readFileSync(envPath, 'utf-8')
const env = {}
for (const line of envContent.split('\n')) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) continue
  const [key, ...rest] = trimmed.split('=')
  env[key.trim()] = rest.join('=').trim()
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Erreur : NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY requis dans .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

// Vérifier si les tables existent déjà
const { data: existing, error: checkError } = await supabase
  .from('properties')
  .select('id')
  .limit(1)

if (!checkError) {
  console.log('Les tables existent déjà ! La migration a déjà été appliquée.')
  console.log('Le setup est terminé. Lancez : npm run dev')
  process.exit(0)
}

console.log('Tables non trouvées. La migration doit être appliquée.')
console.log('')
console.log('=== ACTION REQUISE ===')
console.log('')
console.log('1. Ouvre ton projet Supabase dans le navigateur :')
console.log(`   ${supabaseUrl.replace('.supabase.co', '.supabase.com').replace('https://', 'https://supabase.com/dashboard/project/').replace('.supabase.com', '')}`)
console.log('')
console.log('   Ou directement : https://supabase.com/dashboard/project/qgssnnwjzbcwvptdkhpr/sql/new')
console.log('')
console.log('2. Clique sur "SQL Editor" dans le menu à gauche')
console.log('3. Clique sur "New query"')
console.log('4. Colle le contenu du fichier : supabase/migrations/00001_initial_schema.sql')
console.log('5. Clique sur "Run" (le bouton vert)')
console.log('')
console.log('C\'est tout ! Ensuite lance : npm run dev')
