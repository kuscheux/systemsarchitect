export default function PortalLoading() {
  return (
    <div className="grid gap-4">
      <div className="h-24 animate-pulse bg-zinc-200" />
      <div className="grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((item) => <div key={item} className="h-36 animate-pulse border border-zinc-200 bg-white" />)}
      </div>
    </div>
  );
}

