const SajdaLegend = () => {
  return (
    <div className="bg-card/70 rounded-lg border border-border p-3 flex items-start gap-3">
      <span
        className="sajda-mark shrink-0 mt-0.5"
        style={{ fontSize: "1.25rem", lineHeight: 1 }}
        aria-hidden="true"
      >
        ۩
      </span>
      <div className="min-w-0">
        <h4 className="text-xs font-semibold text-foreground mb-0.5">
          Sajda (Prostration) Sign
        </h4>
        <p className="text-[11px] text-muted-foreground leading-snug">
          This mark indicates a verse of prostration (Ayat as-Sajdah). When
          reciting or hearing such a verse, it is recommended (sunnah) to
          perform a single sajdah of recitation (sajdat at-tilāwah) — say
          takbīr, prostrate once, then rise. There are 14–15 such verses in
          the Qur'an.
        </p>
      </div>
    </div>
  );
};

export default SajdaLegend;
