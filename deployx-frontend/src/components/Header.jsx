import { Rocket } from 'lucide-react';

export default function Header() {
  return (
    <div className="flex items-center gap-3 border-b border-gray-800 pb-6 mt-10">
      <div className="bg-white p-2 rounded-lg">
        <Rocket className="text-black w-6 h-6" />
      </div>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">DeployX</h1>
        <p className="text-gray-400 text-sm">Ship your GitHub repositories to S3 instantly.</p>
      </div>
    </div>
  );
}