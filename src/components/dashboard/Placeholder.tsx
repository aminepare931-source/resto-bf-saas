export function Placeholder({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="max-w-2xl mx-auto text-center py-20">
      <div className="inline-flex w-20 h-20 rounded-3xl bg-gradient-to-br from-gold/20 to-gold/5 items-center justify-center text-4xl mb-6">
        {icon}
      </div>
      <h1 className="text-3xl font-black mb-3">{title}</h1>
      <p className="text-muted-foreground">{desc}</p>
      <div className="mt-8 inline-flex px-4 py-2 rounded-full border border-gold/20 bg-gold/5 text-xs font-bold text-gold uppercase tracking-wider">
        🚧 Module en construction
      </div>
    </div>
  );
}
