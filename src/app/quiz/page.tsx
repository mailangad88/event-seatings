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
        <p className="eyebrow">Style quiz</p>
        <h1 className="mt-2 font-serif text-5xl sm:text-6xl">Which chair fits your wedding?</h1>
        <p className="mt-4 text-muted">Four questions, about 30 seconds.</p>
      </div>
      <Quiz />
    </div>
  );
}
