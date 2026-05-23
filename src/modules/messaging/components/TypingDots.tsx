export const TypingDots = ({ name }: { name?: string }) => (
  <div className="flex items-center gap-2 text-xs text-slate-300/80">
    <span className="inline-flex items-end gap-1">
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ocean-300 [animation-delay:-0.3s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ocean-300 [animation-delay:-0.15s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ocean-300" />
    </span>
    {name ? `${name} is typing…` : "Typing…"}
  </div>
);
