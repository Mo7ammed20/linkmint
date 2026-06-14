"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, ArrowRight, Check, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordStrength } from "@/components/auth/password-strength";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";

const schema = z
  .object({
    password: z.string().min(8, "Min 8 characters"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { message: "Passwords don't match", path: ["confirm"] });

type FormData = z.infer<typeof schema>;

export function ResetPasswordForm() {
  const router = useRouter();
  const search = useSearchParams();
  const token = search.get("token") ?? "demo-token";
  const reset = useAuthStore((s) => s.resetPassword);
  const [submitting, setSubmitting] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const pw = watch("password") ?? "";

  async function onSubmit(data: FormData) {
    setSubmitting(true);
    try {
      const ok = await reset(token, data.password);
      if (ok) {
        setDone(true);
        toast.success("Password updated");
        setTimeout(() => router.push("/login"), 900);
      }
    } catch {
      toast.error("Could not reset password");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
        <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-success/15 text-success">
          <Check className="h-8 w-8" strokeWidth={3} />
        </div>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight">Password updated</h1>
        <p className="mt-2 text-sm text-muted-foreground">Redirecting you to sign in…</p>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Set a new password</h1>
      <p className="mt-2 text-sm text-muted-foreground">Choose something strong you&apos;ll remember.</p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="password">New password</Label>
          <Input id="password" type="password" leftIcon={<Lock />} invalid={Boolean(errors.password)} {...register("password")} />
          <PasswordStrength password={pw} />
          <AnimatePresence>
            {errors.password ? (
              <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="text-xs text-destructive">
                {errors.password.message}
              </motion.p>
            ) : null}
          </AnimatePresence>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirm">Confirm password</Label>
          <Input id="confirm" type="password" leftIcon={<Lock />} invalid={Boolean(errors.confirm)} {...register("confirm")} />
          <AnimatePresence>
            {errors.confirm ? (
              <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="text-xs text-destructive">
                {errors.confirm.message}
              </motion.p>
            ) : null}
          </AnimatePresence>
        </div>
        <Button type="submit" size="lg" variant="gradient" className="w-full" loading={submitting}>
          Update password <ArrowRight />
        </Button>
        <Button asChild variant="ghost" size="sm" className="w-full">
          <Link href="/login">
            <ArrowLeft /> Back to sign in
          </Link>
        </Button>
      </form>
    </motion.div>
  );
}
