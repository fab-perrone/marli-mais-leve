import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SupabaseConfig, WeightEntry } from '../types';

let cachedClient: SupabaseClient | null = null;
let currentConfig: SupabaseConfig | null = null;

const STORAGE_KEY = 'marlimaisleve_supabase_config';

export function getStoredSupabaseConfig(): SupabaseConfig {
  const envUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
  const envAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

  if (typeof window === 'undefined') {
    return {
      url: envUrl,
      anonKey: envAnonKey,
      isConnected: Boolean(envUrl && envAnonKey),
      tableName: 'pesagens_semanais',
    };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.url || parsed.anonKey) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return {
    url: envUrl,
    anonKey: envAnonKey,
    isConnected: Boolean(envUrl && envAnonKey),
    tableName: 'pesagens_semanais',
  };
}

export function saveStoredSupabaseConfig(config: SupabaseConfig) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  cachedClient = null; // reset cached client
}

export function getSupabaseClient(): SupabaseClient | null {
  const config = getStoredSupabaseConfig();
  if (!config.url || !config.anonKey) {
    return null;
  }

  if (cachedClient && currentConfig?.url === config.url && currentConfig?.anonKey === config.anonKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(config.url.trim(), config.anonKey.trim());
    currentConfig = config;
    return cachedClient;
  } catch (err) {
    console.error('Erro ao inicializar Supabase:', err);
    return null;
  }
}

export async function testSupabaseConnection(url: string, anonKey: string): Promise<{ success: boolean; message: string }> {
  try {
    if (!url.startsWith('https://')) {
      return { success: false, message: 'A URL do Supabase deve iniciar com https:// (ex: https://xyz.supabase.co)' };
    }
    const testClient = createClient(url.trim(), anonKey.trim());
    const { error } = await testClient.from('pesagens_semanais').select('count', { count: 'exact', head: true });
    
    if (error) {
      // If table doesn't exist yet, it's still connected to the project!
      if (error.code === '42P01' || error.message?.includes('relation "pesagens_semanais" does not exist')) {
        return { 
          success: true, 
          message: 'Conectado ao Supabase! Mas a tabela "pesagens_semanais" ainda não foi criada. Copie o script SQL abaixo e execute no editor do Supabase.' 
        };
      }
      return { success: false, message: `Erro ao testar conexão: ${error.message}` };
    }
    return { success: true, message: 'Conexão com o Supabase estabelecida com sucesso!' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, message: `Falha na conexão: ${msg}` };
  }
}

export async function syncEntryToSupabase(entry: WeightEntry): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const { error } = await client.from('pesagens_semanais').upsert({
      id: entry.id,
      date: entry.date,
      weight: entry.weight,
      note: entry.note || '',
      feeling: entry.feeling || 'bem',
      is_sunday: entry.isSunday,
      created_at: entry.created_at,
    });
    if (error) {
      console.warn('Erro ao sincronizar com Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Exceção ao sincronizar:', err);
    return false;
  }
}

export async function fetchEntriesFromSupabase(): Promise<WeightEntry[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  try {
    const { data, error } = await client
      .from('pesagens_semanais')
      .select('*')
      .order('date', { ascending: true });

    if (error) {
      console.warn('Erro ao buscar do Supabase:', error);
      return null;
    }

    if (data && Array.isArray(data)) {
      return data.map((row) => ({
        id: String(row.id),
        date: row.date,
        weight: Number(row.weight),
        note: row.note || '',
        feeling: row.feeling || 'bem',
        isSunday: Boolean(row.is_sunday ?? true),
        created_at: row.created_at || new Date().toISOString(),
      }));
    }
    return null;
  } catch (err) {
    console.warn('Falha na busca:', err);
    return null;
  }
}

export async function deleteEntryFromSupabase(id: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const { error } = await client.from('pesagens_semanais').delete().eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

export const SUPABASE_SQL_SCHEMA = `-- ========================================================
-- SISTEMA: EM FORMA
-- SCRIPT SQL COMPLETO COM POLÍTICAS DE ARMAZENAMENTO ATIVADAS (STORAGE + RLS)
-- Execute este script no SQL Editor do seu projeto Supabase
-- ========================================================

-- 1. TABELA DE PESAGENS SEMANAIS
create table if not exists public.pesagens_semanais (
  id text primary key,
  date date not null,
  weight numeric(5,2) not null,
  note text default '',
  feeling text default 'bem',
  photo_url text default null,
  is_sunday boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS (Row Level Security) na tabela
alter table public.pesagens_semanais enable row level security;

-- Políticas granulares para a tabela de pesagens
drop policy if exists "Permitir leitura de pesagens" on public.pesagens_semanais;
create policy "Permitir leitura de pesagens" 
on public.pesagens_semanais
for select 
using (true);

drop policy if exists "Permitir insercao de pesagens" on public.pesagens_semanais;
create policy "Permitir insercao de pesagens" 
on public.pesagens_semanais
for insert 
with check (true);

drop policy if exists "Permitir atualizacao de pesagens" on public.pesagens_semanais;
create policy "Permitir atualizacao de pesagens" 
on public.pesagens_semanais
for update 
using (true)
with check (true);

drop policy if exists "Permitir exclusao de pesagens" on public.pesagens_semanais;
create policy "Permitir exclusao de pesagens" 
on public.pesagens_semanais
for delete 
using (true);

-- Índice para consultas rápidas por data
create index if not exists idx_pesagens_data on public.pesagens_semanais(date desc);


-- ========================================================
-- 2. SUPABASE STORAGE (BUCKET E POLÍTICAS DE ARMAZENAMENTO)
-- ========================================================

-- Criar o bucket de armazenamento para fotos das pesagens (ex: balança, prato saudável)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'fotos_pesagens',
  'fotos_pesagens',
  true,
  5242880, -- Limite de 5MB por arquivo
  array['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

-- Ativar políticas de segurança no Storage Objects
-- Política 1: LEITURA PÚBLICA (Download e visualização das fotos)
drop policy if exists "Visualizacao publica de fotos_pesagens" on storage.objects;
create policy "Visualizacao publica de fotos_pesagens"
on storage.objects
for select
using (bucket_id = 'fotos_pesagens');

-- Política 2: UPLOAD (Inserção de novas fotos no bucket)
drop policy if exists "Upload permitido em fotos_pesagens" on storage.objects;
create policy "Upload permitido em fotos_pesagens"
on storage.objects
for insert
with check (
  bucket_id = 'fotos_pesagens' 
  and (storage.extension(name) ilike 'jpg' 
    or storage.extension(name) ilike 'jpeg' 
    or storage.extension(name) ilike 'png' 
    or storage.extension(name) ilike 'webp')
);

-- Política 3: ATUALIZAÇÃO (Substituição de fotos existentes)
drop policy if exists "Atualizacao de fotos em fotos_pesagens" on storage.objects;
create policy "Atualizacao de fotos em fotos_pesagens"
on storage.objects
for update
using (bucket_id = 'fotos_pesagens')
with check (bucket_id = 'fotos_pesagens');

-- Política 4: EXCLUSÃO (Deleção de fotos)
drop policy if exists "Exclusao de fotos em fotos_pesagens" on storage.objects;
create policy "Exclusao de fotos em fotos_pesagens"
on storage.objects
for delete
using (bucket_id = 'fotos_pesagens');
`;
