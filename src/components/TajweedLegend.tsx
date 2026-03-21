const TAJWEED_RULES = [
  { name: "Ghunnah", color: "#FF7E1E", description: "Nasal sound" },
  { name: "Ikhfa", color: "#D500B2", description: "Hidden nasalization" },
  { name: "Idgham", color: "#169200", description: "Merging" },
  { name: "Iqlab", color: "#26BFFD", description: "Conversion" },
  { name: "Qalqalah", color: "#DD0008", description: "Echoing sound" },
  { name: "Madd (obligatory)", color: "#000EBC", description: "Extended vowel (4-6)" },
  { name: "Madd (permissible)", color: "#9400A8", description: "Extended vowel (2-6)" },
  { name: "Madd (normal)", color: "#537FFF", description: "Normal extension" },
  { name: "Silent / Lam Shamsiyyah", color: "#AAAAAA", description: "Silent letter" },
];

const TajweedLegend = () => {
  return (
    <div className="bg-card/70 rounded-lg border border-border p-3">
      <h4 className="text-xs font-semibold text-foreground mb-2">Tajweed Color Guide</h4>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
        {TAJWEED_RULES.map((rule) => (
          <div key={rule.name} className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded-full shrink-0 border border-border"
              style={{ backgroundColor: rule.color }}
            />
            <span className="text-[10px] text-muted-foreground leading-tight">
              {rule.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TajweedLegend;
