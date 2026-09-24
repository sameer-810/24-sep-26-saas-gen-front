import { useState } from "react";
import { Eye, EyeOff, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppDispatch } from "@/app/hooks";
import { getApiErrorMessage } from "@/shared/api/http";
import { setAdminAuth } from "../adminSlice";
import { useAdminLogin } from "../hooks/useAdminAuth";
import { adminBtnPrimary, adminInput, adminPanel } from "../components/AdminUi";

/**
 * Sign in to the control plane. The submit button is never disabled by
 * validation — only while a request is in flight. A disabled control cannot
 * tell you which rule you failed.
 */

const schema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});
type FormValues = z.infer<typeof schema>;

export function AdminLoginPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useAdminLogin();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
    mode: "onBlur",
  });

  async function onSubmit(values: FormValues) {
    setError(null);
    try {
      const result = await loginMutation.mutateAsync(values);
      dispatch(setAdminAuth(result));
      navigate("/admin", { replace: true });
    } catch (e) {
      setError(getApiErrorMessage(e));
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8f9fb] px-4 py-10 text-foreground dark:bg-background">
      <div className={`${adminPanel} w-full max-w-md p-8 sm:p-10`}>
        <div className="flex items-center gap-4">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
            <Zap className="h-6 w-6 fill-current" />
          </span>
          <span className="text-[22px] font-bold tracking-tight">Superadmin</span>
        </div>

        <h1 className="mt-8 text-[26px] font-bold tracking-tight">Sign in</h1>
        <p className="mt-1 text-[15px] text-muted-foreground">
          Platform console for every company, plan and admin.
        </p>

        <form className="mt-8 space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
          {error ? (
            <div
              role="alert"
              className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300"
            >
              {error}
            </div>
          ) : null}

          <div>
            <label htmlFor="admin-email" className="mb-1.5 block text-[13px] font-medium">
              Email
            </label>
            <input
              id="admin-email"
              className={adminInput}
              autoComplete="email"
              autoFocus
              aria-invalid={!!form.formState.errors.email}
              {...form.register("email")}
            />
            {form.formState.errors.email && (
              <p className="mt-1.5 text-xs text-rose-600">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="admin-password" className="mb-1.5 block text-[13px] font-medium">
              Password
            </label>
            <div className="relative">
              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                className={`${adminInput} pr-10`}
                autoComplete="current-password"
                aria-invalid={!!form.formState.errors.password}
                {...form.register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground transition-colors hover:text-foreground"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {form.formState.errors.password && (
              <p className="mt-1.5 text-xs text-rose-600">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className={`${adminBtnPrimary} h-12 w-full text-base`}
          >
            {loginMutation.isPending ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-8 text-xs leading-relaxed text-muted-foreground">
          Restricted access. This console reaches every customer&apos;s data, and every action taken
          here is recorded against your account in the platform audit log. Staff accounts sign in at
          the main login.
        </p>
      </div>
    </div>
  );
}
