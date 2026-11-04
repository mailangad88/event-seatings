"use client";

import { useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { intakeSections, isAnswered, keyFields, type IntakeField, type IntakeValue, type Prefilled } from "@/lib/intake";

// The call script form. Same questions, same order, for every customer. Answers we already have are filled in;
// must-have answers that are still empty are marked "Ask this". "Only show what's missing" hides the rest
// (hidden boxes still save, so nothing is lost).

function SaveButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button className="btn-primary" disabled={pending}>
      {pending ? "Saving..." : label}
    </button>
  );
}

function FieldInput({ f, value, onChange }: { f: IntakeField; value: IntakeValue | undefined; onChange: (v: IntakeValue) => void }) {
  const name = `f_${f.id}`;
  const id = `q-${f.id}`;
  const str = typeof value === "string" ? value : "";
  if (f.type === "choices") {
    const picked = Array.isArray(value) ? value : [];
    return (
      <div className="flex flex-wrap gap-2" role="group" aria-labelledby={`${id}-label`}>
        {(f.options ?? []).map((o) => {
          const on = picked.includes(o);
          return (
            <label key={o} className={`${on ? "chip-active" : "chip"} cursor-pointer text-sm select-none has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent/40`}>
              <input
                type="checkbox"
                name={name}
                value={o}
                checked={on}
                onChange={() => onChange(on ? picked.filter((p) => p !== o) : [...picked, o])}
                className="sr-only"
              />
              {o}
            </label>
          );
        })}
      </div>
    );
  }
  if (f.type === "select") {
    return (
      <select id={id} name={name} value={str} onChange={(e) => onChange(e.target.value)} className="field">
        <option value="">Pick one</option>
        {(f.options ?? []).map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
        {/* Keep an older saved value that is no longer in the list. */}
        {str && !(f.options ?? []).includes(str) && <option value={str}>{str}</option>}
      </select>
    );
  }
  if (f.type === "textarea") {
    return <textarea id={id} name={name} rows={3} value={str} onChange={(e) => onChange(e.target.value)} placeholder={f.placeholder} className="field resize-y" />;
  }
  const list = f.suggest ? `${id}-list` : undefined;
  return (
    <>
      <input
        id={id}
        name={name}
        type={f.type === "number" ? "number" : f.type}
        inputMode={f.type === "number" ? "numeric" : f.type === "tel" ? "tel" : undefined}
        min={f.type === "number" ? 1 : undefined}
        value={str}
        onChange={(e) => onChange(e.target.value)}
        placeholder={f.placeholder}
        list={list}
        autoComplete="off"
        className="field"
      />
      {list && (
        <datalist id={list}>
          {f.suggest!.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      )}
    </>
  );
}

export function CallScript({
  action,
  prefilled,
  leadId,
  submissionId,
  saveLabel = "Save answers",
}: {
  action: (formData: FormData) => void | Promise<void>;
  prefilled: Prefilled;
  leadId?: string;
  submissionId?: string;
  saveLabel?: string;
}) {
  const [values, setValues] = useState<Record<string, IntakeValue>>(() => Object.fromEntries(Object.entries(prefilled).map(([k, v]) => [k, v.value])));
  const [touched, setTouched] = useState<Set<string>>(() => new Set());
  // Fields answered when "only missing" was switched on. Taken once, so a box doesn't vanish while you type in it.
  const [hiddenIds, setHiddenIds] = useState<Set<string> | null>(null);
  const onlyMissing = hiddenIds !== null;

  const missing = useMemo(() => keyFields.filter((f) => !isAnswered(values[f.id])), [values]);
  const answered = keyFields.length - missing.length;
  const pct = Math.round((answered / keyFields.length) * 100);

  const set = (id: string, v: IntakeValue) => {
    setValues((s) => ({ ...s, [id]: v }));
    setTouched((t) => (t.has(id) ? t : new Set(t).add(id)));
  };

  return (
    <form action={action} className="mt-6">
      {leadId && <input type="hidden" name="id" value={leadId} />}
      {submissionId && <input type="hidden" name="submission_id" value={submissionId} />}

      <div className="office-card sticky top-2 z-10 p-4 sm:top-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold">
              {answered} of {keyFields.length} must-have answers
              {missing.length === 0 && <span className="ml-2 badge-green">Ready to price</span>}
            </p>
            {missing.length > 0 && <p className="mt-0.5 text-xs text-muted">Still to ask: {missing.map((f) => f.label.toLowerCase()).join(", ")}</p>}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input type="checkbox" checked={onlyMissing} onChange={(e) => setHiddenIds(e.target.checked ? new Set(Object.keys(values).filter((k) => isAnswered(values[k]))) : null)} className="size-4 accent-[var(--accent)]" />
              Only show what&apos;s missing
            </label>
            <SaveButton label={saveLabel} />
          </div>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-2" aria-hidden>
          <div className={`h-full rounded-full transition-[width] ${missing.length ? "bg-amber" : "bg-green"}`} style={{ width: `${pct}%` }} />
        </div>
        <nav className="mt-3 flex gap-1.5 overflow-x-auto pb-1 text-xs" aria-label="Script sections">
          {intakeSections.map((s) => {
            const open = s.fields.filter((f) => f.key && !isAnswered(values[f.id])).length;
            return (
              <a key={s.id} href={`#s-${s.id}`} className="chip shrink-0 whitespace-nowrap hover:text-ink">
                {s.title}
                {open > 0 && <span className="rounded-full bg-amber-soft px-1.5 text-amber">{open}</span>}
              </a>
            );
          })}
        </nav>
      </div>

      <div className="mt-6 space-y-6">
        {intakeSections.map((s, si) => {
          const sectionHidden = onlyMissing && s.fields.every((f) => hiddenIds.has(f.id));
          return (
            <section key={s.id} id={`s-${s.id}`} className={`office-card scroll-mt-48 p-5 sm:p-6 ${sectionHidden ? "hidden" : ""}`}>
              <h2 className="text-lg font-semibold">
                <span className="mr-2 text-muted tabular-nums">{si + 1}.</span>
                {s.title}
              </h2>
              {s.say && (
                <p className="well mt-3 p-3 text-sm leading-6">
                  <span className="mr-1 font-semibold">Say:</span>
                  {s.say}
                </p>
              )}
              <div className="mt-4 grid gap-x-6 gap-y-5 md:grid-cols-2">
                {s.fields.map((f) => {
                  const v = values[f.id];
                  const has = isAnswered(v);
                  const from = !touched.has(f.id) && has ? prefilled[f.id]?.from : undefined;
                  const wide = f.type === "choices" || f.type === "textarea";
                  const hide = onlyMissing && hiddenIds.has(f.id);
                  return (
                    <div
                      key={f.id}
                      className={`min-w-0 rounded-xl ${wide ? "md:col-span-2" : ""} ${f.key && !has ? "-m-2 bg-amber-soft/50 p-2 ring-1 ring-amber/40" : ""} ${hide ? "hidden" : ""}`}
                    >
                      <div className="mb-1.5 flex flex-wrap items-center gap-2">
                        <label id={`q-${f.id}-label`} htmlFor={f.type === "choices" ? undefined : `q-${f.id}`} className="text-sm font-medium">
                          {f.label}
                        </label>
                        {f.key && !has && <span className="badge-amber">Ask this</span>}
                        {from === "form" && <span className="badge-blue" title="Worked out from what they sent. Check it with them.">From their form, check it</span>}
                        {from === "lead" && <span className="badge-green">They told us</span>}
                        {from === "call" && <span className="badge">From an earlier call</span>}
                      </div>
                      <p className="mb-2 text-sm text-muted">&ldquo;{f.ask}&rdquo;</p>
                      <FieldInput f={f} value={v} onChange={(nv) => set(f.id, nv)} />
                      {f.tip && <p className="hint text-xs">{f.tip}</p>}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
        {missing.length > 0 && <p className="text-sm text-muted">You can save now and finish the rest on the next call.</p>}
        <SaveButton label={saveLabel} />
      </div>
    </form>
  );
}
