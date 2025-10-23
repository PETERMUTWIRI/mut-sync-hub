"use client";
import { CloudArrowDownIcon } from "@heroicons/react/24/outline";

export function PosCard() {
  const exeUrl = `${process.env.NEXT_PUBLIC_ORIGIN}/agent/analytics-edge-agent.exe`;

  return (
    <div className="bg-black/60 rounded-xl p-6">
      <div className="flex items-center gap-4">
        <CloudArrowDownIcon className="w-10 h-10 text-teal-400" />
        <div>
          <h3 className="text-lg font-semibold">Kenya POS plug-in (no API needed)</h3>
          <p className="text-sm text-gray-300">Detects QuickBooks, Odoo, MS-SQL, Access, CSV – streams instantly.</p>
        </div>
      </div>

      <ol className="list-decimal ml-5 mt-4 text-sm space-y-1 text-gray-200">
        <li>Click download – save the <code className="text-teal-300">.exe</code> anywhere.</li>
        <li>Double-click → Windows registers it as a service.</li>
        <li>Done. Data appears below within 30 seconds.</li>
      </ol>

      <div className="mt-4 flex gap-3">
        <a
          href={exeUrl}
          download
          className="inline-flex items-center gap-2 bg-[#2E7D7D] hover:bg-teal-600 px-4 py-2 rounded-lg text-sm font-medium"
        >
          <CloudArrowDownIcon className="w-4 h-4" />
          Download 12 MB
        </a>
        <button
          className="px-4 py-2 rounded-lg text-sm border border-teal-400 text-teal-300 hover:bg-teal-900/20"
          onClick={() => navigator.clipboard.writeText(exeUrl)}
        >
          Copy link
        </button>
      </div>
    </div>
  );
}
