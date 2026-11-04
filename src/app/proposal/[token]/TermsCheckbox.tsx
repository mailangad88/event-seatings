import Link from "@/components/Link";

// Required "I agree to the terms" tick box on the proposal's payment and accept forms. The server action checks it
// again and records when and which version (lib/terms.ts).
export function TermsCheckbox({ missing = false }: { missing?: boolean }) {
  return (
    <div className="my-3">
      <label className="flex cursor-pointer items-start gap-3 text-sm leading-6">
        <input type="checkbox" name="terms_agree" value="yes" required className="mt-1 accent-[var(--gold)]" />
        <span>
          I agree to the{" "}
          <Link href="/terms" className="underline underline-offset-2" target="_blank">Terms and Conditions</Link>, including the
          deposit, cancellation and damage terms, and the{" "}
          <Link href="/privacy" className="underline underline-offset-2" target="_blank">Privacy Policy</Link>.
        </span>
      </label>
      {missing && (
        <p role="alert" className="mt-1 text-sm text-rose">
          Please tick the box to agree to the terms before you continue.
        </p>
      )}
    </div>
  );
}
