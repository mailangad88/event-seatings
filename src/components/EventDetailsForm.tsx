"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { FieldInput } from "@/components/admin/CallScript";
import { intakeField, writtenAsk, type IntakeValue } from "@/lib/intake";

// The customer's own short form: only the questions we still need, worded for writing.
function Send() {
  const { pending } = useFormStatus();
  return (
    <button className="btn-primary" disabled={pending}>
      {pending ? "Sending..." : "Send my answers"}
    </button>
  );
}

function Question({ id, value, onChange }: { id: string; value: IntakeValue | undefined; onChange: (v: IntakeValue) => void }) {
  const f = intakeField(id);
  if (!f) return null;
  const wide = f.type === "choices" || f.type === "textarea";
  return (
    <div className={wide ? "md:col-span-2" : ""}>
      <label htmlFor={f.type === "choices" ? undefined : `q-${f.id}`} id={`q-${f.id}-label`} className="label">
        {writtenAsk(f)}
      </label>
      <FieldInput f={f} value={value} onChange={onChange} />
    </div>
  );
}

export function EventDetailsForm({ action, token, keyIds, moreIds }: { action: (fd: FormData) => void | Promise<void>; token: string; keyIds: string[]; moreIds: string[] }) {
  const [values, setValues] = useState<Record<string, IntakeValue>>({});
  const set = (id: string) => (v: IntakeValue) => setValues((s) => ({ ...s, [id]: v }));
  return (
    <form action={action} className="space-y-8">
      <input type="hidden" name="token" value={token} />
      {keyIds.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          {keyIds.map((id) => (
            <Question key={id} id={id} value={values[id]} onChange={set(id)} />
          ))}
        </div>
      )}
      {moreIds.length > 0 && (
        <details className="card p-5" open={keyIds.length === 0}>
          <summary className="cursor-pointer font-medium">A few more, if you know them</summary>
          <div className="mt-5 grid gap-6 md:grid-cols-2">
            {moreIds.map((id) => (
              <Question key={id} id={id} value={values[id]} onChange={set(id)} />
            ))}
          </div>
        </details>
      )}
      <div className="flex flex-wrap items-center gap-4">
        <Send />
        <p className="text-sm text-muted">Skip anything you don&apos;t know yet. A rough answer is fine.</p>
      </div>
    </form>
  );
}
