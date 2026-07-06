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
    <label className="flex h-10 items-center gap-2 border border-concrete bg-paper px-3">
      <span className="text-[12px] font-medium uppercase tracking-[0.08em] text-concrete">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="cursor-pointer bg-transparent text-[12px] font-medium uppercase tracking-[0.08em] text-ink outline-none"
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