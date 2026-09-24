import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FeatureItem } from "../../types";
import { IconTile, SectionHeading, SmartLink, card, container } from "../ui";

export function Features({
  title,
  description,
  items,
}: {
  title: string;
  description: string;
  items: FeatureItem[];
}) {
  const visible = items.filter((i) => i.isVisible !== false);
  if (!visible.length && !title) return null;
  return (
    <section id="features" className="bg-white py-20 sm:py-24">
      <div className={container}>
        <SectionHeading eyebrow="What you get" title={title} description={description} />
        {visible.length > 0 && (
          <ul className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((item) => (
              <li key={item.id ?? item.title} className={cn(card, "flex flex-col")}>
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt=""
                    className="mb-5 h-36 w-full rounded-xl object-cover"
                    loading="lazy"
                  />
                ) : (
                  <IconTile icon={item.icon} className="mb-5" />
                )}
                <h3 className="text-[17px] font-semibold text-slate-900">{item.title}</h3>
                {item.description && (
                  <p className="mt-2 flex-1 text-[15px] leading-relaxed text-slate-600">
                    {item.description}
                  </p>
                )}
                {item.link && (
                  <SmartLink
                    href={item.link}
                    className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[var(--site-primary)] hover:underline"
                  >
                    Learn more <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </SmartLink>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
