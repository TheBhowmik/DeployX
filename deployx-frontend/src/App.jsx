import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import Header from './components/Header';
import DeployForm from './components/DeployForm';
import Terminal from './components/Terminal';

const socket = io('http://localhost:9002');

function App() {
  const [repoUrl, setRepoUrl] = useState('');
  const [status, setStatus] = useState('idle');
  const [logs, setLogs] = useState([]);
  const [deployedUrl, setDeployedUrl] = useState('');

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

  return (
    <div className="max-w-4xl mx-auto p-6 flex flex-col gap-8">
      <Header />
      <DeployForm 
        repoUrl={repoUrl} 
        setRepoUrl={setRepoUrl} 
        handleDeploy={handleDeploy} 
        status={status} 
      />
      {(status === 'building' || status === 'ready' || logs.length > 0) && (
        <Terminal logs={logs} status={status} deployedUrl={deployedUrl} />
      )}
    </div>
  );
}

export default App;