import { cn } from "@/lib/utils";
import type { TrustItem } from "../../types";
import { IconTile, container } from "../ui";

export function Trust({ items }: { items: TrustItem[] }) {
  if (!items.length) return null;
  return (
    <section
      id="trust"
      aria-label="Why teams choose us"
      className="border-b border-slate-200 bg-white"
    >
      <ul
        className={cn(
          container,
          "grid grid-cols-1 gap-x-8 gap-y-8 py-12 sm:grid-cols-2 lg:grid-cols-5",
          items.length < 5 && "lg:grid-cols-4",
        )}
      >
        {items.map((item) => (
          <li key={item.id ?? item.title} className="flex gap-4 lg:block">
            <IconTile icon={item.icon} className="h-10 w-10 rounded-full lg:mb-4" />
            <div>
              <h3 className="text-[15px] font-semibold text-slate-900">{item.title}</h3>
              {item.description && (
                <p className="mt-1 text-sm leading-relaxed text-slate-500">{item.description}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
