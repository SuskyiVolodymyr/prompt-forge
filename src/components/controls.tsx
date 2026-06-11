interface SectionProps {
  title: string
  children: React.ReactNode
}

export function Section({ title, children }: SectionProps) {
  return (
    <fieldset className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
      <legend className="px-2 text-sm font-semibold uppercase tracking-wider text-zinc-400">{title}</legend>
      <div className="flex flex-col gap-3">{children}</div>
    </fieldset>
  )
}

interface CheckboxProps {
  label: string
  hint?: string
  checked: boolean
  onChange: (v: boolean) => void
}

export function Checkbox({ label, hint, checked, onChange }: CheckboxProps) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 accent-blue-500"
      />
      <span className="text-sm leading-snug">
        <span className="text-zinc-200">{label}</span>
        {hint && <span className="block text-xs text-zinc-500">{hint}</span>}
      </span>
    </label>
  )
}

interface TextFieldProps {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  multiline?: boolean
}

export function TextField({ label, value, onChange, placeholder, multiline }: TextFieldProps) {
  const cls =
    'w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-blue-500'
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-zinc-300">{label}</span>
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={3} className={`${cls} resize-y`} />
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={cls} />
      )}
    </label>
  )
}

interface SelectFieldProps<T extends string> {
  label: string
  value: T
  options: { value: T; label: string }[]
  onChange: (v: T) => void
}

export function SelectField<T extends string>({ label, value, options, onChange }: SelectFieldProps<T>) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-zinc-300">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-blue-500"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )
}

/** Indented sub-block that appears when its parent checkbox is on */
export function SubBlock({ children }: { children: React.ReactNode }) {
  return <div className="ml-6 flex flex-col gap-3 border-l border-zinc-800 pl-4">{children}</div>
}
