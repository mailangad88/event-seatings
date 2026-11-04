import { describe, expect, it } from "vitest";
import { isDisposableEmail } from "@/lib/disposable-email";

describe("isDisposableEmail", () => {
  it("flags known throwaway domains, any case, and their subdomains", () => {
    expect(isDisposableEmail("a@mailinator.com")).toBe(true);
    expect(isDisposableEmail("A@MailInator.COM")).toBe(true);
    expect(isDisposableEmail("a@abc.mailinator.com")).toBe(true);
    expect(isDisposableEmail("a@yopmail.fr")).toBe(true);
  });

  it("lets real inboxes through", () => {
    for (const e of ["a@gmail.com", "a@outlook.com", "a@beyondchiavari.com", "a@notmailinator.com", "a@mailinator.com.au"]) {
      expect(isDisposableEmail(e), e).toBe(false);
    }
  });

  it("does not throw on junk input", () => {
    expect(isDisposableEmail("")).toBe(false);
    expect(isDisposableEmail("no-at-sign")).toBe(false);
    expect(isDisposableEmail("a@")).toBe(false);
  });
});
