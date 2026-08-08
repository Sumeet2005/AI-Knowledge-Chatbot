import { useEffect, useState } from 'react'
import { Zap, Layers, FileText, Eye, Cpu } from 'lucide-react'
import toast from 'react-hot-toast'
import { PanelHeader } from '../components/ui/PanelHeader'

const DEFAULTS = {
  ai: { provider: 'Gemini', temperature: 0.0, max_tokens: 512, top_p: 1.0, streaming: false },
  rag: { top_k: 10, bm25_weight: 0.5, vector_weight: 0.5, similarity_threshold: 0.7, cross_encoder: true, max_chunks: 5 },
  documents: { chunk_size: 500, chunk_overlap: 50, auto_reindex: false },
  ui: { theme: 'system', font_size: 'medium', compact_mode: false },
  telemetry: { enable_telemetry: true, debug_mode: false },
}

export const Settings = () => {
  const [settings, setSettings] = useState<any | null>(null)
  const [originalSettings, setOriginalSettings] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/settings')
        if (!res.ok) throw new Error('Failed to load settings')
        const data = await res.json()
        const remote = data.settings || {}

        const deepMerge = (base: any, override: any) => {
          if (typeof base !== 'object' || base === null) return override
          const out: any = Array.isArray(base) ? [] : { ...base }
          for (const k of Object.keys(base)) out[k] = base[k]
          for (const k of Object.keys(override)) {
            if (override[k] && typeof override[k] === 'object' && !Array.isArray(override[k])) {
              out[k] = deepMerge(out[k] ?? {}, override[k])
            } else {
              out[k] = override[k]
            }
          }
          return out
        }

        const merged = deepMerge(DEFAULTS, remote)
        setSettings(merged)
        setOriginalSettings(JSON.parse(JSON.stringify(merged)))
      } catch (e: any) {
        setError(e?.message || String(e))
        setSettings(DEFAULTS)
        setOriginalSettings(JSON.parse(JSON.stringify(DEFAULTS)))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const update = (path: string[], value: any) => {
    setSettings((s: any) => {
      const copy = JSON.parse(JSON.stringify(s || {}))
      let cur = copy
      for (let i = 0; i < path.length - 1; i++) {
        const p = path[i]
        cur[p] = cur[p] || {}
        cur = cur[p]
      }
      cur[path[path.length - 1]] = value
      return copy
    })
  }

  const onSave = async () => {
    if (!settings) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ settings }) })
      if (!res.ok) {
        const txt = await res.text()
        setError(`Save failed: ${txt}`)
        toast.error('Failed to save settings')
      } else {
        setOriginalSettings(JSON.parse(JSON.stringify(settings)))
        toast.success('Settings saved')
      }
    } catch (e: any) {
      setError(e?.message || String(e))
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const onReset = () => {
    setSettings(originalSettings || DEFAULTS)
    toast('Reverted changes')
  }

  const onRestoreDefaults = async () => {
    setSettings(DEFAULTS)
    await onSave()
  }

  if (loading) {
    return (
      <div className="flex-1 flex flex-col h-full bg-transparent select-none">
        <PanelHeader title="Settings" subtitle="SYSTEM CONFIGURATION" />
        <div className="flex-1 overflow-y-auto px-6 py-8">
          <div className="max-w-[1000px] mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1,2,3,4,5].map((i) => (
              <div key={i} className="p-5 bg-white dark:bg-card-bg-dark/40 border border-slate-200/80 dark:border-border-dark/80 rounded-2xl shadow-sm animate-pulse">
                <div className="h-6 w-40 bg-slate-200 dark:bg-slate-700/40 rounded mb-3" />
                <div className="h-3 w-full bg-slate-200/70 dark:bg-slate-700/30 rounded mb-2" />
                <div className="h-3 w-3/4 bg-slate-200/70 dark:bg-slate-700/30 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-transparent select-none">
      <PanelHeader title="Settings" subtitle="SYSTEM CONFIGURATION" />
      
      <div className="flex-1 overflow-y-auto px-6 py-8 pb-[120px]">
        <div className="max-w-[1000px] mx-auto w-full flex flex-col gap-6">
          
          {error && <div className="text-sm font-semibold text-rose-500 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 p-3.5 rounded-xl">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* AI */}
            <div className="p-5 bg-white dark:bg-card-bg-dark/40 border border-slate-200/80 dark:border-border-dark/80 rounded-2xl shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-lg bg-card-bg-light/50 dark:bg-card-bg-dark/60 flex items-center justify-center border border-border-light/60 dark:border-border-dark shrink-0">
                  <Zap className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <div className="text-base font-bold text-slate-900 dark:text-white">AI</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Model & generation</div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Provider</label>
                  <select value={settings.ai.provider} onChange={(e) => update(['ai','provider'], e.target.value)} className="w-full mt-1.5 h-[42px] px-3.5 border border-slate-200/60 dark:border-border-dark/65 bg-white/60 dark:bg-[#12151e]/30 hover:border-slate-300 dark:hover:border-slate-800 focus:border-cyan-500/40 outline-none text-slate-900 dark:text-white text-xs md:text-sm rounded-xl transition-all duration-200">
                    <option>Gemini</option>
                    <option>Groq</option>
                    <option>Ollama</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Temperature</label>
                  <input type="number" step="0.1" value={settings.ai.temperature} onChange={(e) => update(['ai','temperature'], parseFloat(e.target.value))} className="w-full mt-1.5 h-[42px] px-3.5 border border-slate-200/60 dark:border-border-dark/65 bg-white/60 dark:bg-[#12151e]/30 hover:border-slate-300 dark:hover:border-slate-800 focus:border-cyan-500/40 outline-none text-slate-900 dark:text-white text-xs md:text-sm rounded-xl transition-all duration-200" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Max Tokens</label>
                  <input type="number" value={settings.ai.max_tokens} onChange={(e) => update(['ai','max_tokens'], parseInt(e.target.value||'0'))} className="w-full mt-1.5 h-[42px] px-3.5 border border-slate-200/60 dark:border-border-dark/65 bg-white/60 dark:bg-[#12151e]/30 hover:border-slate-300 dark:hover:border-slate-800 focus:border-cyan-500/40 outline-none text-slate-900 dark:text-white text-xs md:text-sm rounded-xl transition-all duration-200" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Top P</label>
                  <input type="number" step="0.01" value={settings.ai.top_p} onChange={(e) => update(['ai','top_p'], parseFloat(e.target.value))} className="w-full mt-1.5 h-[42px] px-3.5 border border-slate-200/60 dark:border-border-dark/65 bg-white/60 dark:bg-[#12151e]/30 hover:border-slate-300 dark:hover:border-slate-800 focus:border-cyan-500/40 outline-none text-slate-900 dark:text-white text-xs md:text-sm rounded-xl transition-all duration-200" />
                </div>
                <div className="sm:col-span-2 flex items-center gap-3 mt-2">
                  <input id="streaming" type="checkbox" checked={settings.ai.streaming} onChange={(e) => update(['ai','streaming'], e.target.checked)} className="h-4.5 w-4.5 rounded border-slate-200 dark:border-slate-800 text-cyan-500 focus:ring-cyan-500/20" />
                  <label htmlFor="streaming" className="text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-300">Streaming responses</label>
                </div>
              </div>
            </div>

            {/* RAG */}
            <div className="p-5 bg-white dark:bg-card-bg-dark/40 border border-slate-200/80 dark:border-border-dark/80 rounded-2xl shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-lg bg-card-bg-light/50 dark:bg-card-bg-dark/60 flex items-center justify-center border border-border-light/60 dark:border-border-dark shrink-0">
                  <Layers className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <div className="text-base font-bold text-slate-900 dark:text-white">RAG</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Retrieval & reranking</div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Top K</label>
                  <input type="number" value={settings.rag.top_k} onChange={(e) => update(['rag','top_k'], parseInt(e.target.value||'0'))} className="w-full mt-1.5 h-[42px] px-3.5 border border-slate-200/60 dark:border-border-dark/65 bg-white/60 dark:bg-[#12151e]/30 hover:border-slate-300 dark:hover:border-slate-800 focus:border-cyan-500/40 outline-none text-slate-900 dark:text-white text-xs md:text-sm rounded-xl transition-all duration-200" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Similarity Threshold</label>
                  <input type="number" step="0.01" value={settings.rag.similarity_threshold} onChange={(e) => update(['rag','similarity_threshold'], parseFloat(e.target.value))} className="w-full mt-1.5 h-[42px] px-3.5 border border-slate-200/60 dark:border-border-dark/65 bg-white/60 dark:bg-[#12151e]/30 hover:border-slate-300 dark:hover:border-slate-800 focus:border-cyan-500/40 outline-none text-slate-900 dark:text-white text-xs md:text-sm rounded-xl transition-all duration-200" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">BM25 Weight</label>
                  <input type="number" step="0.01" value={settings.rag.bm25_weight} onChange={(e) => update(['rag','bm25_weight'], parseFloat(e.target.value))} className="w-full mt-1.5 h-[42px] px-3.5 border border-slate-200/60 dark:border-border-dark/65 bg-white/60 dark:bg-[#12151e]/30 hover:border-slate-300 dark:hover:border-slate-800 focus:border-cyan-500/40 outline-none text-slate-900 dark:text-white text-xs md:text-sm rounded-xl transition-all duration-200" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Vector Weight</label>
                  <input type="number" step="0.01" value={settings.rag.vector_weight} onChange={(e) => update(['rag','vector_weight'], parseFloat(e.target.value))} className="w-full mt-1.5 h-[42px] px-3.5 border border-slate-200/60 dark:border-border-dark/65 bg-white/60 dark:bg-[#12151e]/30 hover:border-slate-300 dark:hover:border-slate-800 focus:border-cyan-500/40 outline-none text-slate-900 dark:text-white text-xs md:text-sm rounded-xl transition-all duration-200" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Max Chunks</label>
                  <input type="number" value={settings.rag.max_chunks} onChange={(e) => update(['rag','max_chunks'], parseInt(e.target.value||'0'))} className="w-full mt-1.5 h-[42px] px-3.5 border border-slate-200/60 dark:border-border-dark/65 bg-white/60 dark:bg-[#12151e]/30 hover:border-slate-300 dark:hover:border-slate-800 focus:border-cyan-500/40 outline-none text-slate-900 dark:text-white text-xs md:text-sm rounded-xl transition-all duration-200" />
                </div>
                <div className="flex items-center gap-3 mt-6">
                  <input id="cross" type="checkbox" checked={settings.rag.cross_encoder} onChange={(e) => update(['rag','cross_encoder'], e.target.checked)} className="h-4.5 w-4.5 rounded border-slate-200 dark:border-slate-800 text-cyan-500 focus:ring-cyan-500/20" />
                  <label htmlFor="cross" className="text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-300">Cross Encoder</label>
                </div>
              </div>
            </div>

            {/* Documents */}
            <div className="p-5 bg-white dark:bg-card-bg-dark/40 border border-slate-200/80 dark:border-border-dark/80 rounded-2xl shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-lg bg-card-bg-light/50 dark:bg-card-bg-dark/60 flex items-center justify-center border border-border-light/60 dark:border-border-dark shrink-0">
                  <FileText className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <div className="text-base font-bold text-slate-900 dark:text-white">Documents</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Chunking & indexing</div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Chunk Size</label>
                  <input type="number" value={settings.documents.chunk_size} onChange={(e) => update(['documents','chunk_size'], parseInt(e.target.value||'0'))} className="w-full mt-1.5 h-[42px] px-3.5 border border-slate-200/60 dark:border-border-dark/65 bg-white/60 dark:bg-[#12151e]/30 hover:border-slate-300 dark:hover:border-slate-800 focus:border-cyan-500/40 outline-none text-slate-900 dark:text-white text-xs md:text-sm rounded-xl transition-all duration-200" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Chunk Overlap</label>
                  <input type="number" value={settings.documents.chunk_overlap} onChange={(e) => update(['documents','chunk_overlap'], parseInt(e.target.value||'0'))} className="w-full mt-1.5 h-[42px] px-3.5 border border-slate-200/60 dark:border-border-dark/65 bg-white/60 dark:bg-[#12151e]/30 hover:border-slate-300 dark:hover:border-slate-800 focus:border-cyan-500/40 outline-none text-slate-900 dark:text-white text-xs md:text-sm rounded-xl transition-all duration-200" />
                </div>
                <div className="flex items-center gap-3 mt-6">
                  <input id="reindex" type="checkbox" checked={settings.documents.auto_reindex} onChange={(e) => update(['documents','auto_reindex'], e.target.checked)} className="h-4.5 w-4.5 rounded border-slate-200 dark:border-slate-800 text-cyan-500 focus:ring-cyan-500/20" />
                  <label htmlFor="reindex" className="text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-300">Auto Reindex</label>
                </div>
              </div>
            </div>

            {/* UI */}
            <div className="p-5 bg-white dark:bg-card-bg-dark/40 border border-slate-200/80 dark:border-border-dark/80 rounded-2xl shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-lg bg-card-bg-light/50 dark:bg-card-bg-dark/60 flex items-center justify-center border border-border-light/60 dark:border-border-dark shrink-0">
                  <Eye className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <div className="text-base font-bold text-slate-900 dark:text-white">UI</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Theme & layout</div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Theme</label>
                  <select value={settings.ui.theme} onChange={(e) => update(['ui','theme'], e.target.value)} className="w-full mt-1.5 h-[42px] px-3.5 border border-slate-200/60 dark:border-border-dark/65 bg-white/60 dark:bg-[#12151e]/30 hover:border-slate-300 dark:hover:border-slate-800 focus:border-cyan-500/40 outline-none text-slate-900 dark:text-white text-xs md:text-sm rounded-xl transition-all duration-200">
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Font Size</label>
                  <select value={settings.ui.font_size} onChange={(e) => update(['ui','font_size'], e.target.value)} className="w-full mt-1.5 h-[42px] px-3.5 border border-slate-200/60 dark:border-border-dark/65 bg-white/60 dark:bg-[#12151e]/30 hover:border-slate-300 dark:hover:border-slate-800 focus:border-cyan-500/40 outline-none text-slate-900 dark:text-white text-xs md:text-sm rounded-xl transition-all duration-200">
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>
                <div className="flex items-center gap-3 mt-6">
                  <input id="compact" type="checkbox" checked={settings.ui.compact_mode} onChange={(e) => update(['ui','compact_mode'], e.target.checked)} className="h-4.5 w-4.5 rounded border-slate-200 dark:border-slate-800 text-cyan-500 focus:ring-cyan-500/20" />
                  <label htmlFor="compact" className="text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-300">Compact Mode</label>
                </div>
              </div>
            </div>

            {/* Telemetry */}
            <div className="p-5 bg-white dark:bg-card-bg-dark/40 border border-slate-200/80 dark:border-border-dark/80 rounded-2xl shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-lg bg-card-bg-light/50 dark:bg-card-bg-dark/60 flex items-center justify-center border border-border-light/60 dark:border-border-dark shrink-0">
                  <Cpu className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <div className="text-base font-bold text-slate-900 dark:text-white">Telemetry</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Usage & debugging</div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Telemetry</label>
                  <div className="flex items-center gap-3 mt-2.5">
                    <input id="telemetry" type="checkbox" checked={settings.telemetry.enable_telemetry} onChange={(e) => update(['telemetry','enable_telemetry'], e.target.checked)} className="h-4.5 w-4.5 rounded border-slate-200 dark:border-slate-800 text-cyan-500 focus:ring-cyan-500/20" />
                    <label htmlFor="telemetry" className="text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-300">Enable Telemetry</label>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Debug Mode</label>
                  <div className="flex items-center gap-3 mt-2.5">
                    <input id="telemetry_debug" type="checkbox" checked={settings.telemetry.debug_mode} onChange={(e) => update(['telemetry','debug_mode'], e.target.checked)} className="h-4.5 w-4.5 rounded border-slate-200 dark:border-slate-800 text-cyan-500 focus:ring-cyan-500/20" />
                    <label htmlFor="telemetry_debug" className="text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-300">Debug Mode</label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed bottom actions */}
      <div className="fixed left-0 right-0 bottom-6 pointer-events-none z-30">
        <div className="max-w-[1000px] mx-auto px-6 pointer-events-auto">
          <div className="flex items-center justify-end gap-3 bg-white/80 dark:bg-[#0c0d12]/85 border border-slate-200/80 dark:border-border-dark/80 rounded-2xl p-3 shadow-lg backdrop-blur-md">
            <button onClick={onReset} className="px-4 py-2 text-xs md:text-sm font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-white transition-all duration-200 cursor-pointer">Reset</button>
            <button onClick={onRestoreDefaults} className="px-4 py-2 text-xs md:text-sm font-semibold rounded-xl border border-slate-200 dark:border-border-dark text-slate-700 dark:text-white bg-transparent hover:bg-slate-50 dark:hover:bg-slate-900 transition-all duration-200 cursor-pointer">Restore Defaults</button>
            <button onClick={onSave} disabled={saving} className="px-5 py-2 text-xs md:text-sm font-bold rounded-xl text-white transition-all duration-200 cursor-pointer shadow-[0_2px_8px_rgba(6,182,212,0.15)] bg-gradient-to-r from-cyan-500 to-teal-500 hover:opacity-95 active:scale-[0.98] disabled:opacity-50">
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
