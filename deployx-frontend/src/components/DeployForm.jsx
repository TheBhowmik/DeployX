import { Code, Loader2 } from 'lucide-react';

export default function DeployForm({ repoUrl, setRepoUrl, handleDeploy, status }) {
  const isDeploying = status === 'queuing' || status === 'building';

  return (
    <div className="bg-[#111] border border-gray-800 rounded-xl p-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
        <Code className="w-5 h-5" /> Deploy new project
      </h2>
      <form onSubmit={handleDeploy} className="flex gap-4">
        <input
          type="url"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          placeholder="https://github.com/username/repository"
          className="flex-1 bg-black border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gray-400 transition-colors"
          required
          disabled={isDeploying}
        />
        <button
          type="submit"
          disabled={isDeploying || !repoUrl}
          className="bg-white text-black font-medium px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-200 disabled:opacity-50 transition-colors"
        >
          {isDeploying ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Deploy'}
        </button>
      </form>
    </div>
  );
}