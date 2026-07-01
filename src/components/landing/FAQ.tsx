import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faqs } from "./data";

export function FAQ() {
  return (
    <section id="faq" className="bg-surface-soft py-20 md:py-28">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-teal ring-1 ring-brand-teal/30">
            FAQ
          </span>
          <h2 className="mt-4 text-3xl font-extrabold text-brand-navy md:text-4xl">
            Pertanyaan yang sering diajukan
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Tidak menemukan jawaban? Hubungi kami langsung via WhatsApp.
          </p>
        </div>

        <Accordion
          type="multiple"
          defaultValue={["item-0", "item-1", "item-2"]}
          className="mt-10 space-y-3"
        >
          {faqs.map((f, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="overflow-hidden rounded-2xl border border-border bg-white px-5 shadow-soft"
            >
              <AccordionTrigger className="py-5 text-left text-base font-semibold text-brand-navy hover:no-underline">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="pb-5 text-sm leading-relaxed text-muted-foreground">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}