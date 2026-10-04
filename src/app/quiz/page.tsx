import type { Metadata } from "next";
import { Quiz } from "@/components/Quiz";

export const metadata: Metadata = {
  title: "Wedding Chair Style Quiz",
  description: "Answer four quick questions and we'll match you with the wedding chairs that fit your style.",
};

export default function QuizPage() {
  return (
    <div className="container-x py-14">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <span className="eyebrow">🔮 style quiz</span>
        <h1 className="mt-4 display text-5xl leading-[0.95] sm:text-7xl">what&apos;s your chair <span className="font-italic font-normal normal-case tracking-normal">era</span>?</h1>
        <p className="mt-4 text-muted">Four questions. 30 seconds. Zero judgment.</p>
      </div>
      <Quiz />
    </div>
  );
}
