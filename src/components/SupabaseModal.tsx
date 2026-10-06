import { Check, Copy, Database, ExternalLink, RefreshCw, ShieldCheck, X } from 'lucide-react';
import React, { useState } from 'react';
import { SUPABASE_SQL_SCHEMA, saveStoredSupabaseConfig, testSupabaseConnection } from '../services/supabase';
import { SupabaseConfig } from '../types';
import { soundEffects } from '../utils/audio';

interface SupabaseModalProps {
  isOpen: boolean;
  config: SupabaseConfig;
  onClose: () => void;
  onSaveConfig: (newConfig: SupabaseConfig) => void;
  onSyncNow: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({
  isOpen,
  config,
  onClose,
  onSaveConfig,
  onSyncNow,
}) => {
  const [url, setUrl] = useState(config.url);
  const [anonKey, setAnonKey] = useState(config.anonKey);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  if (!isOpen) return null;

  const handleTest = async () => {
    soundEffects.playClick();
    if (!url || !anonKey) {
      setTestResult({
        success: false,
        message: 'Preencha a URL do Projeto e a Anon Key antes de testar.',
      });
      return;
    }
    setTesting(true);
    setTestResult(null);
    const res = await testSupabaseConnection(url, anonKey);
    setTesting(false);
    setTestResult(res);

    if (res.success) {
      soundEffects.playSuccess();
      const updated: SupabaseConfig = {
        url: url.trim(),
        anonKey: anonKey.trim(),
        isConnected: true,
        tableName: 'pesagens_semanais',
      };
      saveStoredSupabaseConfig(updated);
      onSaveConfig(updated);
    }
  };

  const handleSave = () => {
    soundEffects.playSuccess();
    const updated: SupabaseConfig = {
      url: url.trim(),
      anonKey: anonKey.trim(),
      isConnected: Boolean(url && anonKey),
      tableName: 'pesagens_semanais',
    };
    saveStoredSupabaseConfig(updated);
    onSaveConfig(updated);
    onClose();
  };

  const copySqlToClipboard = () => {
    soundEffects.playClick();
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden border-2 border-emerald-500 my-auto">
        {/* Header */}
        <div className="bg-emerald-700 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Database className="w-6 h-6 text-amber-300" />
            <div>
              <h3 className="font-extrabold text-xl leading-tight">Configurar Banco Supabase</h3>
              <p className="text-emerald-100 text-xs">Sincronização em nuvem e armazenamento de fotos</p>
            </div>
          </div>
          <button
            onClick={() => {
              soundEffects.playClick();
              onClose();
            }}
            className="p-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto bg-amber-50/20">
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 leading-relaxed">
            <span className="font-bold">✨ Armazenamento Seguro e Offline:</span> O Marli Mais Leve salva todos os
            dados no seu navegador por padrão. Ao conectar seu Supabase abaixo, suas pesagens ficam salvas na
            nuvem e contam com políticas ativadas de armazenamento!
          </div>

          {/* Form */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                Supabase Project URL
              </label>
              <input
                type="text"
                placeholder="https://xyzcompany.supabase.co"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 text-sm focus:border-emerald-500 focus:outline-none bg-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                Supabase Anon / Public Key
              </label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 text-sm focus:border-emerald-500 focus:outline-none bg-white font-mono"
              />
            </div>
          </div>

          {/* Test Status feedback */}
          {testResult && (
            <div
              className={`p-3 rounded-2xl text-xs font-bold ${
                testResult.success
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  : 'bg-rose-100 text-rose-900 border border-rose-300'
              }`}
            >
              {testResult.message}
            </div>
          )}

          {/* Buttons: Test & Sync */}
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={handleTest}
              disabled={testing}
              className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {testing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4 text-emerald-400" />}
              <span>{testing ? 'Testando Conexão...' : 'Testar Conexão'}</span>
            </button>

            {config.isConnected && (
              <button
                onClick={() => {
                  soundEffects.playClick();
                  onSyncNow();
                }}
                className="py-2.5 px-4 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5 text-emerald-700" />
                <span>Sincronizar Agora</span>
              </button>
            )}
          </div>

          {/* SQL Script Accordion / Box */}
          <div className="pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-700">Script SQL para Criar a Tabela:</span>
              <button
                onClick={copySqlToClipboard}
                className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? 'Copiado!' : 'Copiar Script SQL'}</span>
              </button>
            </div>
            <pre className="p-3 bg-slate-900 text-emerald-400 text-[11px] font-mono rounded-xl overflow-x-auto max-h-36 leading-tight">
              {SUPABASE_SQL_SCHEMA}
            </pre>
            <p className="text-[11px] text-slate-500 mt-1">
              Cole e execute este script no "SQL Editor" do console do Supabase para criar a tabela{' '}
              <code className="text-emerald-800 font-bold">pesagens_semanais</code>.
            </p>
          </div>

          {/* Bottom Save & Close */}
          <div className="pt-2 flex gap-2">
            <button
              onClick={handleSave}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-colors"
            >
              Salvar Configurações
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
