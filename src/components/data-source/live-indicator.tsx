export function LiveIndicator({ live }: { live: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`inline-block w-2 h-2 rounded-full ${live ? "bg-green-500" : "bg-red-600"}`} />
      <span className="text-xs text-gray-300">{live ? "Live" : "Offline"}</span>
      {live && (
        <div className="w-16 h-1 bg-gray-700 rounded overflow-hidden">
          <div className="h-full bg-teal-400 animate-pulse" />
        </div>
      )}
    </div>
  );
}
