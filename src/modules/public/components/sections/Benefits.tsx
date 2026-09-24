import type { BenefitItem } from "../../types";
import { IconTile, SectionHeading, card, container } from "../ui";

export function Benefits({
  heading,
  description,
  items,
}: {
  heading: string;
  description: string;
  items: BenefitItem[];
}) {
  if (!items.length && !heading) return null;
  return (
    <section id="benefits" className="bg-white py-20 sm:py-24">
      <div className={container}>
        <SectionHeading eyebrow="Why it matters" title={heading} description={description} />
        {items.length > 0 && (
          <ul className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item) => (
              <li key={item.id ?? item.title} className={card}>
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt=""
                    className="mb-4 h-28 w-full rounded-xl object-cover"
                    loading="lazy"
                  />
                ) : (
                  <IconTile icon={item.icon} className="mb-4 h-10 w-10 rounded-full" />
                )}
                <h3 className="text-[16px] font-semibold text-slate-900">{item.title}</h3>
                {item.description && (
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.description}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
