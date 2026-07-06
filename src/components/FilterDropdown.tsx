interface Option {
  value: string;
  label: string;
}

export function FilterDropdown({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Option[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex items-center gap-2 border border-hairline px-3 py-2">
      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-grey">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="cursor-pointer bg-transparent text-xs font-medium uppercase tracking-[0.12em] text-ink outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
