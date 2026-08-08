import { useEffect, useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  Tooltip, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  LineChart, 
  Line 
} from 'recharts';
import { 
  Database, 
  Layers, 
  Cpu, 
  Clock, 
  Activity, 
  FileText, 
  Server, 
  HardDrive, 
  ShieldCheck, 
  AlertCircle, 
  Calendar,
  MessageSquare,
  RefreshCw,
  TrendingUp,
  Sliders
} from 'lucide-react';

type HistoryPoint = {
  ts: number;
  response_ms: number;
  retrieval_ms: number;
  llm_ms: number;
};

type Metrics = {
  document_count: number;
  chunk_count: number;
  embedding_model: string;
  reranker_model: string;
  active_llm_provider: string;
  active_llm_model?: string;
  average_response_time_ms: number;
  average_retrieval_time_ms: number;
  average_llm_time_ms: number;
  conversation_count: number;
  message_count: number;
  total_queries?: number;
  storage_size_bytes?: number;
  history?: HistoryPoint[];
  uptime_seconds?: number;
  active_requests?: number;
  success_count?: number;
  failed_count?: number;
  success_rate_pct?: number;
  provider_status?: Record<string, any>;
  system_resources?: {
    ram_total?: number | null;
    ram_used?: number | null;
    ram_percent?: number | null;
    cpu_percent?: number | null;
  };
  vector_count?: number;
  embedding_cache?: number;
  query_volume?: Array<{ date: string; count: number }>;
  health?: {
    backend: string;
    database: string;
    chromadb: string;
    llm_api: string;
  };
};

const formatBytes = (bytes: number, decimals = 2) => {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const formatUptime = (seconds: number) => {
  if (!seconds) return '0s';
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  
  const parts = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(' ');
};

const HealthPill = ({ status }: { status?: string }) => {
  const isHealthy = status === 'healthy';
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider select-none ${
      isHealthy
        ? 'text-emerald-400 bg-emerald-950/20 border-emerald-800/30'
        : 'text-rose-400 bg-rose-950/20 border-rose-800/30'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isHealthy ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
      {status || 'unknown'}
    </span>
  );
};

export const AdminDashboard = () => {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMetrics = async (showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    try {
      const res = await fetch('/api/admin/metrics');
      if (!res.ok) throw new Error('Failed to load dashboard metrics');
      const data = await res.json();
      setMetrics(data);
    } catch (e) {
      console.error(e);
      setMetrics(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const iv = setInterval(() => fetchMetrics(false), 5000);
    return () => clearInterval(iv);
  }, []);

  const chartData = useMemo(() => {
    if (!metrics || !metrics.history) return [];
    return metrics.history.map((h: HistoryPoint) => ({
      time: new Date(h.ts * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      response: Math.round(h.response_ms),
      retrieval: Math.round(h.retrieval_ms),
      llm: Math.round(h.llm_ms),
    }));
  }, [metrics]);

  const volumeChartData = useMemo(() => {
    if (!metrics || !metrics.query_volume) return [];
    return metrics.query_volume.map((qv) => ({
      date: qv.date,
      count: qv.count,
    }));
  }, [metrics]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-slate-400 gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-cyan-500" />
        <span className="text-sm font-semibold tracking-wider uppercase">Loading enterprise metrics...</span>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-slate-400 gap-4">
        <AlertCircle className="w-12 h-12 text-rose-500" />
        <div className="text-center">
          <h2 className="text-lg font-bold text-slate-200">Failed to load system metrics</h2>
          <p className="text-xs text-slate-500 mt-1">Please ensure the backend API server is online and try again.</p>
        </div>
        <button 
          onClick={() => fetchMetrics(true)}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Reconnect API
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 select-text text-slate-300">
      
      {/* Title Header Control Center */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-light/20 dark:border-border-dark/20 pb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight flex items-center gap-2">
            <Server className="w-6 h-6 text-cyan-500" />
            AI Enterprise Control Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time RAG diagnostics, system status alerts, database metrics, and service latencies.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-2 py-1 rounded border border-slate-850">
            Active Fallback Pipeline
          </span>
          <button 
            onClick={() => fetchMetrics(true)}
            className={`p-2 rounded-lg bg-card-bg-light/40 dark:bg-card-bg-dark/40 border border-border-light/50 dark:border-border-dark/50 hover:bg-card-bg-light dark:hover:bg-card-bg-dark text-slate-400 hover:text-slate-200 transition-all ${
              refreshing ? 'pointer-events-none' : ''
            }`}
            title="Force refresh metrics"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Documents Card */}
        <div className="p-4 rounded-2xl bg-card-bg-light/35 dark:bg-workspace-bg-dark/30 border border-border-light/60 dark:border-border-dark/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Total Documents</span>
            <span className="text-2xl font-black text-slate-100 block">{metrics.document_count}</span>
            <span className="text-[9px] font-mono text-slate-500 block">Size: {formatBytes(metrics.storage_size_bytes || 0)}</span>
          </div>
          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        {/* Total Chunks Card */}
        <div className="p-4 rounded-2xl bg-card-bg-light/35 dark:bg-workspace-bg-dark/30 border border-border-light/60 dark:border-border-dark/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Vector Chunks</span>
            <span className="text-2xl font-black text-slate-100 block">{metrics.chunk_count}</span>
            <span className="text-[9px] font-mono text-slate-500 block">DB: ChromaDB</span>
          </div>
          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Database className="w-5 h-5" />
          </div>
        </div>

        {/* Total Queries Card */}
        <div className="p-4 rounded-2xl bg-card-bg-light/35 dark:bg-workspace-bg-dark/30 border border-border-light/60 dark:border-border-dark/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Chat Queries</span>
            <span className="text-2xl font-black text-slate-100 block">{metrics.total_queries ?? metrics.message_count}</span>
            <span className="text-[9px] font-mono text-slate-500 block">Convs: {metrics.conversation_count}</span>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <MessageSquare className="w-5 h-5" />
          </div>
        </div>

        {/* Avg Response Latency Card */}
        <div className="p-4 rounded-2xl bg-card-bg-light/35 dark:bg-workspace-bg-dark/30 border border-border-light/60 dark:border-border-dark/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Avg Response Latency</span>
            <span className="text-2xl font-black text-slate-100 block">{Math.round(metrics.average_response_time_ms)} ms</span>
            <span className="text-[9px] font-mono text-slate-500 block">
              Retrieval: {Math.round(metrics.average_retrieval_time_ms)}ms | LLM: {Math.round(metrics.average_llm_time_ms)}ms
            </span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* System Health Cards Container */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest select-none flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-500 animate-pulse" />
          System Integration Health
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Backend API Health */}
          <div className="p-4 rounded-2xl bg-card-bg-light/35 dark:bg-workspace-bg-dark/30 border border-border-light/60 dark:border-border-dark/60 flex flex-col justify-between gap-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-[10px] uppercase tracking-wider text-slate-200">Backend API</span>
              <HealthPill status={metrics.health?.backend || 'healthy'} />
            </div>
            <div className="space-y-1 text-slate-400 font-mono text-[10px]">
              <div>CPU Load: <span className="font-bold text-slate-200">{metrics.system_resources?.cpu_percent ?? 0}%</span></div>
              <div>RAM Use: <span className="font-bold text-slate-200">{metrics.system_resources?.ram_percent ?? 0}%</span></div>
              <div>Uptime: <span className="font-bold text-slate-200">{formatUptime(metrics.uptime_seconds || 0)}</span></div>
            </div>
          </div>

          {/* SQLite DB Health */}
          <div className="p-4 rounded-2xl bg-card-bg-light/35 dark:bg-workspace-bg-dark/30 border border-border-light/60 dark:border-border-dark/60 flex flex-col justify-between gap-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-[10px] uppercase tracking-wider text-slate-200">SQLite Database</span>
              <HealthPill status={metrics.health?.database} />
            </div>
            <div className="space-y-1 text-slate-400 font-mono text-[10px]">
              <div>Total Messages: <span className="font-bold text-slate-200">{metrics.message_count}</span></div>
              <div>Total Threads: <span className="font-bold text-slate-200">{metrics.conversation_count}</span></div>
              <div>Queue Status: <span className="font-bold text-emerald-400">Idle (0 in line)</span></div>
            </div>
          </div>

          {/* ChromaDB Health */}
          <div className="p-4 rounded-2xl bg-card-bg-light/35 dark:bg-workspace-bg-dark/30 border border-border-light/60 dark:border-border-dark/60 flex flex-col justify-between gap-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-[10px] uppercase tracking-wider text-slate-200">Vector store</span>
              <HealthPill status={metrics.health?.chromadb} />
            </div>
            <div className="space-y-1 text-slate-400 font-mono text-[10px]">
              <div>Collection: <span className="font-bold text-slate-200">default</span></div>
              <div>Vector count: <span className="font-bold text-slate-200">{metrics.chunk_count}</span></div>
              <div>Embedding model: <span className="font-bold text-cyan-400 truncate block max-w-full" title={metrics.embedding_model}>{metrics.embedding_model.split('/').pop()}</span></div>
            </div>
          </div>

          {/* LLM Provider Health */}
          <div className="p-4 rounded-2xl bg-card-bg-light/35 dark:bg-workspace-bg-dark/30 border border-border-light/60 dark:border-border-dark/60 flex flex-col justify-between gap-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-[10px] uppercase tracking-wider text-slate-200">LLM Endpoint</span>
              <HealthPill status={metrics.health?.llm_api} />
            </div>
            <div className="space-y-1 text-slate-400 font-mono text-[10px]">
              <div>Provider: <span className="font-bold text-slate-200">{metrics.active_llm_provider || 'none'}</span></div>
              <div>Model: <span className="font-bold text-amber-400 truncate block max-w-full" title={metrics.active_llm_model}>{metrics.active_llm_model || 'unknown'}</span></div>
              <div>Reranker model: <span className="font-bold text-purple-400 truncate block max-w-full" title={metrics.reranker_model}>{metrics.reranker_model.split('/').pop() || 'none'}</span></div>
            </div>
          </div>

        </div>
      </div>

      {/* Visualizations Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Query Volume Chart */}
        <div className="p-5 rounded-2xl bg-card-bg-light/35 dark:bg-workspace-bg-dark/30 border border-border-light/60 dark:border-border-dark/60 flex flex-col gap-4">
          <div className="flex items-center gap-1.5 select-none">
            <TrendingUp className="w-4 h-4 text-cyan-500" />
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Query Volume (Last 7 Days)</h3>
          </div>
          
          <div className="h-64 w-full">
            {volumeChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={volumeChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                    labelStyle={{ color: '#94a3b8', fontSize: 10, fontWeight: 'bold' }}
                    itemStyle={{ color: '#06b6d4', fontSize: 11, fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="count" stroke="#06b6d4" strokeWidth={2.5} fill="url(#volGrad)" name="Queries" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500 text-xs italic">
                No query volume records detected in search history.
              </div>
            )}
          </div>
        </div>

        {/* Latencies Tracking Chart */}
        <div className="p-5 rounded-2xl bg-card-bg-light/35 dark:bg-workspace-bg-dark/30 border border-border-light/60 dark:border-border-dark/60 flex flex-col gap-4">
          <div className="flex items-center gap-1.5 select-none">
            <Activity className="w-4 h-4 text-purple-500" />
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Pipeline Processing Latencies (Recent Requests)</h3>
          </div>
          
          <div className="h-64 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="respGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={9} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                    labelStyle={{ color: '#94a3b8', fontSize: 10, fontWeight: 'bold' }}
                    itemStyle={{ fontSize: 11, fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="response" stroke="#8b5cf6" strokeWidth={2} fill="url(#respGrad)" name="Total Response (ms)" />
                  <Area type="monotone" dataKey="llm" stroke="#ef4444" strokeWidth={1.5} fill="none" name="LLM Generation (ms)" />
                  <Area type="monotone" dataKey="retrieval" stroke="#f59e0b" strokeWidth={1.5} fill="none" name="Retrieval (ms)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500 text-xs italic">
                No request execution trace available yet. Send a chat message to track latencies.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Resource Utilization & Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* System Resources Load Bars */}
        <div className="p-4 rounded-2xl bg-card-bg-light/35 dark:bg-workspace-bg-dark/30 border border-border-light/60 dark:border-border-dark/60 flex flex-col justify-between gap-4">
          <div className="flex items-center gap-1.5 select-none">
            <HardDrive className="w-4 h-4 text-cyan-400" />
            <h3 className="text-[10px] font-bold text-slate-200 uppercase tracking-widest">Hardware Resource Utilization</h3>
          </div>
          
          <div className="space-y-4">
            {/* RAM utilisation */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-slate-400">Memory Load (RAM)</span>
                <span className="text-slate-200 font-bold">{metrics.system_resources?.ram_percent ?? 0}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full transition-all duration-500" 
                  style={{ width: `${metrics.system_resources?.ram_percent ?? 0}%` }} 
                />
              </div>
            </div>

            {/* CPU utilisation */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-slate-400">Processor Load (CPU)</span>
                <span className="text-slate-200 font-bold">{metrics.system_resources?.cpu_percent ?? 0}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-rose-500 rounded-full transition-all duration-500" 
                  style={{ width: `${metrics.system_resources?.cpu_percent ?? 0}%` }} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* API Statistics */}
        <div className="p-4 rounded-2xl bg-card-bg-light/35 dark:bg-workspace-bg-dark/30 border border-border-light/60 dark:border-border-dark/60 flex flex-col justify-between gap-4">
          <div className="flex items-center gap-1.5 select-none">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h3 className="text-[10px] font-bold text-slate-200 uppercase tracking-widest">HTTP Traffic & Queue</h3>
          </div>
          
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 rounded-xl bg-slate-950/40 border border-slate-900">
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Success</span>
              <span className="text-sm font-black text-emerald-400 mt-1 block">{metrics.success_count || 0}</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-950/40 border border-slate-900">
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Failed</span>
              <span className="text-sm font-black text-rose-400 mt-1 block">{metrics.failed_count || 0}</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-950/40 border border-slate-900">
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Rate</span>
              <span className="text-sm font-black text-slate-200 mt-1 block">{(metrics.success_rate_pct || 0).toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Pipeline Controls Info */}
        <div className="p-4 rounded-2xl bg-card-bg-light/35 dark:bg-workspace-bg-dark/30 border border-border-light/60 dark:border-border-dark/60 flex flex-col justify-between gap-4">
          <div className="flex items-center gap-1.5 select-none">
            <Sliders className="w-4 h-4 text-amber-400" />
            <h3 className="text-[10px] font-bold text-slate-200 uppercase tracking-widest">Model Cache Status</h3>
          </div>
          
          <div className="space-y-2 text-xs text-slate-400">
            <div className="flex justify-between border-b border-slate-900/50 pb-1.5">
              <span>Embedding Cache Size:</span>
              <span className="font-mono font-bold text-slate-200">{metrics.embedding_cache || 0} items</span>
            </div>
            <div className="flex justify-between border-b border-slate-900/50 pb-1.5">
              <span>Reranker Cache Status:</span>
              <span className="font-mono font-bold text-purple-400">LRU Bounded</span>
            </div>
            <div className="flex justify-between">
              <span>Active Requests:</span>
              <span className="font-mono font-bold text-cyan-400">{metrics.active_requests || 0} queries</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;
