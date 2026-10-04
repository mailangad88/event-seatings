import type { Metadata } from "next";
import { Quiz } from "@/components/Quiz";

export const metadata: Metadata = {
  title: "Wedding Chair Style Quiz",
  description: "Answer four quick questions and we'll match you with the wedding chairs that fit your style.",
};

export default function QuizPage() {
  return (
    <div className="container-x py-20">
      <div className="mx-auto mb-20 max-w-2xl text-center">
        <p className="eyebrow justify-center">The style quiz</p>
        <h1 className="headline mt-6 text-6xl leading-[0.95] sm:text-8xl">
          Discover your <em className="text-gold">aesthetic</em>
        </h1>
        <p className="mt-6 text-lg text-muted">Four questions. A considered recommendation.</p>
      </div>
      <Quiz />
    </div>
  );
}
