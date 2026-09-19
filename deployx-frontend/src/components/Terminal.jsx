import { useEffect, useRef } from 'react';
import { Terminal as TerminalIcon, ExternalLink, CheckCircle } from 'lucide-react';

export default function Terminal({ logs, status, deployedUrl }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="bg-[#111] border border-gray-800 rounded-xl overflow-hidden flex flex-col">
      <div className="bg-[#1a1a1a] border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-400 font-mono">
          <TerminalIcon className="w-4 h-4" /> Build Logs
        </div>
        
        {status === 'building' && (
          <span className="flex items-center gap-2 text-yellow-500 text-sm font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
            </span>
            Building...
          </span>
        )}
        {status === 'ready' && (
          <span className="flex items-center gap-2 text-green-500 text-sm font-medium">
            <CheckCircle className="w-4 h-4" /> Ready
          </span>
        )}
      </div>

      <div className="p-4 h-96 overflow-y-auto font-mono text-sm text-gray-300 flex flex-col gap-1 bg-black">
        {logs.map((log, index) => (
          <div key={index} className="break-all">
            <span className="text-gray-600 mr-4">
              {new Date().toLocaleTimeString([], { hour12: false })}
            </span>
            {log}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {status === 'ready' && deployedUrl && (
        <div className="bg-[#1a1a1a] border-t border-gray-800 p-4 flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-400 mb-1">Deployment URL</p>
            <a 
              href={deployedUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-2 transition-colors"
            >
              {deployedUrl} <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}