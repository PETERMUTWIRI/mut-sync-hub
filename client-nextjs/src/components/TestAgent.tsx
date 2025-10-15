'use client';

import { ping } from '@/app/actions/agentics';

export default function TestAgent() {
  const [res, setRes] = useState<any>(null);

  const click = async () => {
    const r = await ping();
    setRes(r);
  };

  return (
    <div className="p-4 bg-gray-800 text-white rounded-xl">
      <button onClick={click} className="bg-cyan-600 hover:bg-cyan-700 px-4 py-2 rounded">Ping Server</button>
      {res && <pre className="mt-2 text-xs">{JSON.stringify(res, null, 2)}</pre>}
    </div>
  );
}
function useState<T>(arg0: null): [any, any] {
  throw new Error('Function not implemented.');
}

