import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Terminal as TerminalIcon, ExternalLink, CheckCircle, Sparkles, GitBranch, Loader2, ArrowRight } from 'lucide-react';

const socket = io('http://localhost:9002');

export default function App() {
  const [repoUrl, setRepoUrl] = useState('');
  const [status, setStatus] = useState('idle'); // idle, queuing, building, ready, error
  const [logs, setLogs] = useState([]);
  const [deployedUrl, setDeployedUrl] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    socket.on('message', (message) => {
      let logText = message;
      try {
        const parsed = JSON.parse(message);
        if (parsed.log) logText = parsed.log;
      } catch (e) {}

      setLogs((prev) => [...prev, logText]);

      if (logText === 'Done...' || logText === 'Build Complete') {
        setStatus('ready');
      }
    });

    return () => {
      socket.off('message');
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleDeploy = async (e) => {
    e.preventDefault();
    if (!repoUrl) return;

    setStatus('queuing');
    setLogs([]);
    setDeployedUrl('');

    try {
      const res = await fetch('http://localhost:9000/project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gitURL: repoUrl })
      });

      const data = await res.json();
      
      if (data && data.data && data.data.projectSlug) {
        setStatus('building');
        setDeployedUrl(data.data.url);
        socket.emit('subscribe', `logs:${data.data.projectSlug}`);
      }
    } catch (error) {
      console.error('Deployment failed:', error);
      setStatus('error');
      setLogs((prev) => [...prev, 'Error: Could not connect to API server.']);
    }
  };

  const isDeploying = status === 'queuing' || status === 'building';

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-amber-500 selection:text-black font-sans relative overflow-hidden">
      
      {/* Background Glow Effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-amber-500/10 blur-[140px] rounded-full pointer-events-none" />

      {/* Navigation Header */}
      <header className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-neutral-900 relative z-10">
        <div className="flex items-center gap-3">
          <img 
            src="/logo.png" 
            alt="DeployX Logo" 
            className="w-10 h-10 object-contain rounded-xl shadow-lg shadow-amber-500/20" 
          />
          <span className="text-xl font-bold tracking-tight text-white">Deploy<span className="text-amber-500">X</span></span>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-16 pb-24 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Hero Text */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold tracking-wide uppercase w-fit">
            <Sparkles className="w-3.5 h-3.5" /> Premium Cloud Infrastructure
          </div>
          <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
            Deploy Your <br />
            <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent">
              Dream App
            </span> Instantly.
          </h1>
          <p className="text-neutral-400 text-lg leading-relaxed max-w-xl">
            Experience lightning-fast serverless deployments. Ship your GitHub repository directly to global edge storage with real-time telemetry.
          </p>
        </div>

        {/* Right Glassmorphic Floating Card */}
        <div className="lg:col-span-6">
          <div className="bg-neutral-900/80 backdrop-blur-xl border border-neutral-800/80 rounded-3xl p-8 shadow-2xl shadow-black/80 relative">
            <div className="absolute top-0 right-12 w-32 h-32 bg-amber-500/10 blur-3xl pointer-events-none" />

            <div className="flex items-center gap-2 text-amber-400 text-sm font-semibold mb-6">
              <GitBranch className="w-4 h-4" /> Start New Deployment
            </div>

            <form onSubmit={handleDeploy} className="flex flex-col gap-5">
              <div>
                <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wider mb-2">
                  GitHub Repository URL
                </label>
                <input
                  type="url"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/username/repository"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3.5 text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-sm"
                  required
                  disabled={isDeploying}
                />
              </div>

              <button
                type="submit"
                disabled={isDeploying || !repoUrl}
                className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
              >
                {isDeploying ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-black" />
                    Initializing Pipeline...
                  </>
                ) : (
                  <>
                    Deploy Collection <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Terminal / Build Logs Box */}
            {(status === 'building' || status === 'ready' || logs.length > 0) && (
              <div className="mt-8 bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden flex flex-col shadow-inner">
                <div className="bg-neutral-900/90 border-b border-neutral-800 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono">
                    <TerminalIcon className="w-3.5 h-3.5 text-amber-400" /> Live Build Logs
                  </div>
                  
                  {status === 'building' && (
                    <span className="flex items-center gap-1.5 text-amber-400 text-xs font-medium">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                      </span>
                      Building...
                    </span>
                  )}
                  {status === 'ready' && (
                    <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium">
                      <CheckCircle className="w-3.5 h-3.5" /> Ready
                    </span>
                  )}
                </div>

                <div className="p-4 h-64 overflow-y-auto font-mono text-xs text-neutral-300 flex flex-col gap-1.5 bg-black/60">
                  {logs.log ? null : logs.map((log, index) => (
                    <div key={index} className="break-all leading-relaxed">
                      <span className="text-neutral-600 mr-3">
                        {new Date().toLocaleTimeString([], { hour12: false })}
                      </span>
                      {log}
                    </div>
                  ))}
                  <div ref={bottomRef} />
                </div>

                {status === 'ready' && deployedUrl && (
                  <div className="bg-neutral-900 border-t border-neutral-800 p-4 flex justify-between items-center">
                    <div>
                      <p className="text-[11px] text-neutral-400 uppercase tracking-wider mb-0.5">Live Production URL</p>
                      <a 
                        href={deployedUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-amber-400 hover:text-amber-300 font-medium text-sm flex items-center gap-1.5 transition-colors"
                      >
                        {deployedUrl} <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

      </main>
    </div>
  );
}