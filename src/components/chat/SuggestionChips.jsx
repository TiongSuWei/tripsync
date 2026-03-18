const suggestions = [
  "🗼 Paris for 7 days, budget $3000",
  "🏝️ Bali honeymoon for 10 days",
  "🗽 New York City weekend trip",
  "🌸 Japan 14-day cultural tour",
];

export default function SuggestionChips({ onSelect }) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {suggestions.map((s) => (
        <button
          key={s}
          onClick={() => onSelect(s)}
          className="text-xs px-3 py-2 rounded-full border border-border bg-card hover:bg-secondary hover:border-primary/30 text-muted-foreground hover:text-foreground transition-all duration-200 shadow-sm"
        >
          {s}
        </button>
      ))}
    </div>
  );
}