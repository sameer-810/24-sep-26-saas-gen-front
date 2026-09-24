import type { Dispatch, SetStateAction } from "react";
import { Field, adminInput } from "./AdminUi";

export type PlanForm = {
  name: string;
  code: string;
  tagline: string;
  description: string;
  termMonths: string;
  priceMonthly: string;
  priceTotal: string;
  referencePrice: string;
  badge: string;
  isFeatured: boolean;
  isActive: boolean;
  sortOrder: string;
  maxUsers: string;
  maxProducts: string;
  maxLeads: string;
  features: string;
};

const numberField = `${adminInput} no-spinner font-mono tabular-nums`;

/** The plan editor's fields. State lives in PlansPage; this only draws them. */
export function PlanFormFields({
  form,
  setForm,
  editing,
}: {
  form: PlanForm;
  setForm: Dispatch<SetStateAction<PlanForm>>;
  editing: boolean;
}) {
  const set = (key: keyof PlanForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({
      ...f,
      [key]: e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value,
    }));

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <Field label="Name *" htmlFor="plan-name">
        <input id="plan-name" className={adminInput} value={form.name} onChange={set("name")} />
      </Field>
      <Field
        label="Code *"
        htmlFor="plan-code"
        hint={
          editing
            ? "Fixed after creation — companies reference a plan by code."
            : "Letters, numbers, hyphens and underscores."
        }
      >
        <input
          id="plan-code"
          className={`${adminInput} font-mono`}
          disabled={editing}
          value={form.code}
          onChange={set("code")}
        />
      </Field>
      <Field label="Tagline" htmlFor="plan-tagline" className="sm:col-span-2">
        <input id="plan-tagline" className={adminInput} value={form.tagline} onChange={set("tagline")} />
      </Field>
      <Field label="Description" htmlFor="plan-description" className="sm:col-span-2">
        <textarea
          id="plan-description"
          rows={2}
          className={adminInput}
          value={form.description}
          onChange={set("description")}
        />
      </Field>

      <div className="sm:col-span-2">
        <p className="text-sm font-bold text-foreground">Pricing inputs</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          These are stored values, not the printed card.{" "}
          <span className="font-mono tabular-nums">0</span> on a total or reference price means
          “derive it”, and a blank badge derives one from the discount.
        </p>
      </div>
      <Field label="Term (months)" htmlFor="plan-term">
        <input id="plan-term" type="number" min={1} className={numberField} value={form.termMonths} onChange={set("termMonths")} />
      </Field>
      <Field label="Price per month" htmlFor="plan-monthly">
        <input id="plan-monthly" type="number" min={0} className={numberField} value={form.priceMonthly} onChange={set("priceMonthly")} />
      </Field>
      <Field label="Price total" htmlFor="plan-total" hint="0 derives it from per-month × term.">
        <input id="plan-total" type="number" min={0} className={numberField} value={form.priceTotal} onChange={set("priceTotal")} />
      </Field>
      <Field
        label="Reference price"
        htmlFor="plan-reference"
        hint="0 derives the struck-through anchor from the 1-month plan."
      >
        <input id="plan-reference" type="number" min={0} className={numberField} value={form.referencePrice} onChange={set("referencePrice")} />
      </Field>
      <Field label="Badge" htmlFor="plan-badge" hint="Blank derives e.g. “Save 50%”.">
        <input id="plan-badge" className={adminInput} value={form.badge} onChange={set("badge")} />
      </Field>
      <Field label="Sort order" htmlFor="plan-sort">
        <input id="plan-sort" type="number" min={0} className={numberField} value={form.sortOrder} onChange={set("sortOrder")} />
      </Field>

      <div className="sm:col-span-2">
        <p className="text-sm font-bold text-foreground">Ceilings</p>
        <p className="mt-1 text-xs text-muted-foreground">
          <span className="font-mono tabular-nums">0</span> means unlimited.
        </p>
      </div>
      {(
        [
          ["maxUsers", "Max users"],
          ["maxProducts", "Max products"],
          ["maxLeads", "Max leads"],
        ] as const
      ).map(([key, label]) => (
        <Field key={key} label={label} htmlFor={`plan-${key}`}>
          <input id={`plan-${key}`} type="number" min={0} className={numberField} value={form[key]} onChange={set(key)} />
        </Field>
      ))}

      <Field
        label="Features"
        htmlFor="plan-features"
        className="sm:col-span-2"
        hint="One per line, as they appear on the price card."
      >
        <textarea id="plan-features" rows={4} className={adminInput} value={form.features} onChange={set("features")} />
      </Field>

      <label className="flex items-center gap-2 text-sm sm:col-span-2">
        <input type="checkbox" className="h-4 w-4 accent-blue-600" checked={form.isFeatured} onChange={set("isFeatured")} />
        Featured — only one plan can hold this, so saving demotes whichever plan holds it now
      </label>
      <label className="flex items-center gap-2 text-sm sm:col-span-2">
        <input type="checkbox" className="h-4 w-4 accent-blue-600" checked={form.isActive} onChange={set("isActive")} />
        Active — offered on the price list and assignable to a company
      </label>
    </div>
  );
}
