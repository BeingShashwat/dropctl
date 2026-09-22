import { FAQ, HOW_IT_WORKS } from "../../lib/content";
import { useFaqJsonLd } from "../../lib/seo";

/**
 * Below-the-fold reference content. Deliberately not built from cards — the
 * tool above already establishes that shape, and repeating it here would make
 * the page read as a wall of identical panels.
 */
export function HomeContent() {
  // Keeps the structured data in lockstep with the questions rendered below.
  useFaqJsonLd(FAQ);

  return (
    <div className="space-y-10 border-t border-line pt-10">
      <section aria-labelledby="how-it-works">
        <h2
          id="how-it-works"
          className="font-mono text-[11px] tracking-[0.16em] text-faint uppercase"
        >
          How it works
        </h2>

        <ol className="mt-5 grid gap-6 sm:grid-cols-3 sm:gap-8">
          {HOW_IT_WORKS.map((step, index) => (
            <li key={step.title} className="space-y-1.5">
              <span className="font-mono text-[11px] text-accent">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="text-sm font-semibold text-fg">{step.title}</h3>
              <p className="text-[13px] text-pretty text-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section
        aria-labelledby="questions"
        className="border-t border-line pt-10"
      >
        <h2
          id="questions"
          className="font-mono text-[11px] tracking-[0.16em] text-faint uppercase"
        >
          Questions
        </h2>

        <div className="mt-5 divide-y divide-line">
          {FAQ.map((item) => (
            <section key={item.question} className="py-4 first:pt-0">
              <h3 className="text-sm font-medium text-fg">{item.question}</h3>
              <p className="mt-1.5 max-w-3xl text-[13px] text-pretty text-muted">
                {item.answer}
              </p>
            </section>
          ))}
        </div>
      </section>
    </div>
  );
}
