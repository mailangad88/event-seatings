import { describe, expect, it } from "vitest";
import { spamReason } from "@/lib/lead-spam";

describe("spamReason", () => {
  it("lets a normal enquiry through", () => {
    expect(
      spamReason({
        name: "Maria Lopez",
        message: "Need 120 chiavari chairs for a wedding in Naperville. Venue: https://example.com/hall",
        form_ms: 45_000,
      }),
    ).toBeUndefined();
  });

  it("lets old pages without timing through", () => {
    expect(spamReason({ name: "Sam", message: "Do you deliver to Evanston?" })).toBeUndefined();
  });

  it("catches forms sent faster than a person can type", () => {
    expect(spamReason({ name: "Bot", form_ms: 300 })).toMatch(/seconds/);
  });

  it("catches links in the name", () => {
    expect(spamReason({ name: "Cheap SEO www.spam.ru" })).toMatch(/link in the name/);
  });

  it("catches link-stuffed messages", () => {
    expect(spamReason({ name: "A", message: "http://a.com http://b.com https://c.com" })).toMatch(/3 web links/);
  });

  it("catches sales pitches", () => {
    expect(spamReason({ name: "Jake", message: "We offer SEO services to get you on the first page of Google" })).toMatch(/spam wording/);
    expect(spamReason({ name: "Jake", message: "Interested in a guest post on your blog?" })).toMatch(/guest post/);
  });

  it("does not flag a Chinese or Polish message", () => {
    expect(spamReason({ name: "王芳", message: "我们需要租一百把椅子用于婚礼" })).toBeUndefined();
    expect(spamReason({ name: "Zofia", message: "Potrzebuję 80 krzeseł na wesele w Chicago" })).toBeUndefined();
  });
});
