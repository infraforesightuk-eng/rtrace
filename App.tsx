
import React, { useState, useEffect, useCallback } from 'react';
import { Search, Globe, Network, Shield, MapPin, History, ExternalLink, Loader2, AlertCircle, Info } from 'lucide-react';
import { fetchIpWhois } from './services/geminiService';
import { WhoisResult, SearchHistoryItem } from './types';
import InfoCard, { InfoItem } from './components/InfoCard';

const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<WhoisResult | null>(null);
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem('ip_intel_history');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  const handleSearch = useCallback(async (ipToSearch?: string) => {
    const targetIp = ipToSearch || query.trim();
    if (!targetIp) return;

    // Simple IP validation (loose)
    const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$|^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    if (!ipRegex.test(targetIp)) {
      setError("Please enter a valid IPv4 or IPv6 address.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchIpWhois(targetIp);
      setResult(data);
      
      // Update History
      const newItem = { ip: targetIp, timestamp: Date.now() };
      const updatedHistory = [newItem, ...history.filter(h => h.ip !== targetIp)].slice(0, 10);
      setHistory(updatedHistory);
      localStorage.setItem('ip_intel_history', JSON.stringify(updatedHistory));
      
      if (!ipToSearch) setQuery('');
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }, [query, history]);

  return (
    <div className="min-h-screen flex flex-col items-center bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="w-full max-w-6xl px-6 py-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Globe size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">IP Intel <span className="text-blue-500">Pro</span></h1>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">Network Reconnaissance</p>
          </div>
        </div>
        
        <div className="hidden sm:flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium text-slate-300">WHOIS Gateway</p>
            <p className="text-xs text-slate-500">RIPE • ARIN • APNIC • LACNIC</p>
          </div>
        </div>
      </header>

      <main className="w-full max-w-6xl px-6 pb-20 flex flex-col gap-10">
        
        {/* Search Hero */}
        <section className="flex flex-col items-center justify-center py-12 text-center">
          <h2 className="text-4xl sm:text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            Intelligence on any IP.
          </h2>
          <p className="text-slate-400 text-lg mb-8 max-w-2xl">
            Real-time WHOIS data, organizational details, and geographic mapping powered by advanced AI and live search grounding.
          </p>

          <div className="w-full max-w-2xl relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="text-slate-500" size={20} />
            </div>
            <input 
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="e.g. 23.90.66.53 or 2001:4860:4860::8888"
              className="w-full bg-slate-900 border-2 border-slate-800 rounded-2xl py-4 pl-12 pr-32 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-lg mono"
            />
            <button 
              onClick={() => handleSearch()}
              disabled={loading}
              className="absolute right-2 top-2 bottom-2 px-6 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 rounded-xl font-semibold flex items-center gap-2 transition-colors shadow-lg"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Lookup'}
            </button>
          </div>

          {error && (
            <div className="mt-4 flex items-center gap-2 text-red-400 text-sm bg-red-400/10 px-4 py-2 rounded-lg border border-red-400/20">
              <AlertCircle size={16} />
              {error}
            </div>
          )}
        </section>

        {/* Results Section */}
        {result ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Main Result Card */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Lookup Target</h3>
                    <div className="text-3xl font-bold mono text-blue-400">{result.ip}</div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full text-sm font-medium">
                    <Shield size={14} />
                    Verified Resource
                  </div>
                </div>

                <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800 mb-8">
                  <div className="flex gap-3 text-slate-300 italic">
                    <Info className="flex-shrink-0 text-blue-500" size={20} />
                    <p className="text-sm leading-relaxed">{result.summary}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InfoCard title="Network Assignment" icon={<Network size={20} />}>
                    <InfoItem label="Organization" value={result.networkInfo.organization} />
                    <InfoItem label="NetName" value={result.networkInfo.name} />
                    <InfoItem label="CIDR Block" value={result.networkInfo.cidr} isMono />
                    <InfoItem label="Status" value={result.networkInfo.status} />
                  </InfoCard>

                  <InfoCard title="Geolocation" icon={<MapPin size={20} />}>
                    <InfoItem label="Country" value={result.geography.country} />
                    <InfoItem label="City / Region" value={result.geography.city} />
                    <InfoItem label="Coordinates" value={result.geography.coordinates} isMono />
                  </InfoCard>

                  <InfoCard title="Administrative Contacts" icon={<Shield size={20} />}>
                    <InfoItem label="Abuse Contact" value={result.contacts.abuse} />
                    <InfoItem label="Admin Contact" value={result.contacts.admin} />
                  </InfoCard>

                  <InfoCard title="Registry Status" icon={<Globe size={20} />}>
                    <InfoItem label="Registry" value={result.networkInfo.registry || "Automatic Detection"} />
                    <InfoItem label="IP Range" value={result.networkInfo.netRange} isMono />
                  </InfoCard>
                </div>
              </div>

              {/* Source Attribution */}
              {result.sources.length > 0 && (
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Verification Sources</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.sources.map((src, idx) => (
                      <a 
                        key={idx}
                        href={src.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs text-slate-300 transition-colors"
                      >
                        <ExternalLink size={12} />
                        {src.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar / History */}
            <aside className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <History size={18} className="text-blue-400" />
                  <h3 className="font-bold">Recent Inquiries</h3>
                </div>
                {history.length === 0 ? (
                  <p className="text-sm text-slate-500 py-4">Your search history will appear here.</p>
                ) : (
                  <div className="space-y-2">
                    {history.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSearch(item.ip)}
                        className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800/30 hover:bg-slate-800 hover:translate-x-1 transition-all text-left"
                      >
                        <span className="text-sm mono text-slate-300 truncate">{item.ip}</span>
                        <span className="text-[10px] text-slate-500 whitespace-nowrap">
                          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 shadow-xl shadow-blue-500/10">
                <h3 className="font-bold text-white mb-2">Registry Coverage</h3>
                <p className="text-sm text-blue-100 mb-4">
                  Supporting global IP allocations across all major Regional Internet Registries (RIRs).
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {['RIPE', 'ARIN', 'APNIC', 'LACNIC', 'AFRINIC'].map(reg => (
                    <div key={reg} className="bg-white/10 rounded-lg py-1 px-2 text-[10px] font-bold text-center border border-white/10 uppercase">
                      {reg}
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        ) : !loading && (
          <div className="flex flex-col items-center justify-center py-12 opacity-50 grayscale">
            <Globe size={120} className="text-slate-800 animate-pulse" />
            <p className="mt-8 text-slate-500 font-medium tracking-wide">Enter an IP address to begin reconnaissance</p>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-96 bg-slate-900/50 rounded-2xl border border-slate-800"></div>
              <div className="h-24 bg-slate-900/30 rounded-2xl border border-slate-800"></div>
            </div>
            <div className="h-96 bg-slate-900/50 rounded-2xl border border-slate-800"></div>
          </div>
        )}
      </main>

      <footer className="w-full mt-auto py-8 border-t border-slate-900 flex flex-col items-center gap-4 bg-slate-950/80 backdrop-blur-md sticky bottom-0">
        <div className="text-slate-500 text-xs font-medium uppercase tracking-widest flex items-center gap-4">
          <span>Real-time WHOIS</span>
          <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
          <span>Gemini Intelligence</span>
          <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
          <span>Security Insights</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
