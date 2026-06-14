"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, ArrowRight, Github, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { PasswordStrength } from "@/components/auth/password-strength";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";

const schema = z
  .object({
    name: z.string().min(2, "Min 2 characters"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(8, "Min 8 characters"),
    accept: z.literal(true, { message: "Please accept the terms" }),
  });

type FormData = z.infer<typeof schema>;

export function RegisterForm() {
  const router = useRouter();
  const register_ = useAuthStore((s) => s.register);
  const [submitting, setSubmitting] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { accept: false as unknown as true },
  });

  const passwordValue = watch("password") ?? "";

  async function onSubmit(data: FormData) {
    setSubmitting(true);
    try {
      await register_(data.name, data.email, data.password);
      setSuccess(true);
      toast.success("Account created", { description: "Welcome to Linkmint." });
      setTimeout(() => router.push("/dashboard"), 700);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-success/15 text-success">
          <Check className="h-8 w-8" strokeWidth={3} />
        </div>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight">You&apos;re in.</h1>
        <p className="mt-2 text-sm text-muted-foreground">Redirecting you to your dashboard…</p>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Create your account</h1>
        <p className="mt-2 text-sm text-muted-foreground">Free forever. No credit card required.</p>
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
          <Label htmlFor="name">Name</Label>
          <Input id="name" placeholder="Alex Morgan" leftIcon={<User />} invalid={Boolean(errors.name)} {...register("name")} />
          <AnimatePresence>
            {errors.name ? (
              <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="text-xs text-destructive">
                {errors.name.message}
              </motion.p>
            ) : null}
          </AnimatePresence>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@example.com" leftIcon={<Mail />} invalid={Boolean(errors.email)} {...register("email")} />
          <AnimatePresence>
            {errors.email ? (
              <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="text-xs text-destructive">
                {errors.email.message}
              </motion.p>
            ) : null}
          </AnimatePresence>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" placeholder="At least 8 characters" leftIcon={<Lock />} invalid={Boolean(errors.password)} {...register("password")} />
          <PasswordStrength password={passwordValue} />
          <AnimatePresence>
            {errors.password ? (
              <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="text-xs text-destructive">
                {errors.password.message}
              </motion.p>
            ) : null}
          </AnimatePresence>
        </div>

        <label className="flex items-start gap-2 text-sm text-muted-foreground">
          <Checkbox
            className="mt-0.5"
            checked={watch("accept") as boolean}
            onCheckedChange={(v) => setValue("accept", Boolean(v) as unknown as true, { shouldValidate: true })}
          />
          <span>
            I agree to the{" "}
            <Link href="/blog" className="text-foreground hover:underline">Terms</Link> and{" "}
            <Link href="/blog" className="text-foreground hover:underline">Privacy Policy</Link>.
          </span>
        </label>
        <AnimatePresence>
          {errors.accept ? (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs text-destructive">
              {errors.accept.message}
            </motion.p>
          ) : null}
        </AnimatePresence>

        <Button type="submit" size="lg" variant="gradient" className="w-full" loading={submitting}>
          Create account
          <ArrowRight />
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-foreground hover:underline">Sign in</Link>
      </p>
    </motion.div>
  );
}
