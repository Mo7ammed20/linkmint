"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, ArrowRight, Github, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Min 8 characters"),
  remember: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((s) => s.login);
  const [submitting, setSubmitting] = React.useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { remember: true },
  });

  async function onSubmit(data: FormData) {
    setSubmitting(true);
    try {
      await login(data.email, data.password);
      toast.success("Welcome back");
      const next = searchParams.get("next") || "/dashboard";
      router.push(next);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Welcome back</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to manage your links, analytics, and earnings.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-2">
        <Button variant="glass" size="lg" className="w-full" type="button">
          <Github /> GitHub
        </Button>
        <Button variant="glass" size="lg" className="w-full" type="button">
          <Sparkles /> Google
        </Button>
      </div>

      <div className="my-6 flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">or</span>
        <Separator className="flex-1" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            leftIcon={<Mail />}
            invalid={Boolean(errors.email)}
            {...register("email")}
          />
          <AnimatePresence>
            {errors.email ? (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-xs text-destructive"
              >
                {errors.email.message}
              </motion.p>
            ) : null}
          </AnimatePresence>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="/forgot-password" className="text-xs text-muted-foreground hover:text-foreground">
              Forgot?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            leftIcon={<Lock />}
            invalid={Boolean(errors.password)}
            {...register("password")}
          />
          <AnimatePresence>
            {errors.password ? (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-xs text-destructive"
              >
                {errors.password.message}
              </motion.p>
            ) : null}
          </AnimatePresence>
        </div>

        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <Checkbox
            checked={watch("remember")}
            onCheckedChange={(v) => setValue("remember", Boolean(v))}
          />
          Remember me for 30 days
        </label>

        <Button type="submit" size="lg" variant="gradient" className="w-full" loading={submitting}>
          Sign in
          <ArrowRight />
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        New here?{" "}
        <Link href="/register" className="font-medium text-foreground hover:underline">
          Create an account
        </Link>
      </p>
    </motion.div>
  );
}
