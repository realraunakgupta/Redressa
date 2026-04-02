"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserAuthClient } from "@/lib/supabase/auth";
import { TopNav } from "@/app/components/top-nav";

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserAuthClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user }, error }) => {
      if (error || !user) {
        router.push("/login?next=/profile");
        return;
      }
      setName(user.user_metadata?.full_name || "");
      setEmail(user.email || "");
      setPhone(user.user_metadata?.phone_number || "");
      setLoading(false);
    });
  }, [supabase, router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const { error } = await supabase.auth.updateUser({
      email,
      data: {
        full_name: name,
        phone_number: phone,
      },
    });

    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      setMessage({ type: "success", text: "Profile updated successfully! (Email changes may require verification)" });
      // Refresh router so TopNav updates
      router.refresh();
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-base">
        <TopNav />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-on-surface-muted text-sm font-sans uppercase tracking-widest">Loading Profile...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-base">
      <TopNav />
      <main className="flex-1 px-6 py-12 flex justify-center">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-serif font-medium text-on-base tracking-tight mb-2">Your Profile</h1>
          <p className="text-sm font-sans text-on-surface-muted mb-8">
            Manage your personal details. These details are used as default variables in drafted complaint letters.
          </p>

          {message && (
            <div className={`mb-6 text-sm px-4 py-3 rounded-sm border ${message.type === "error" ? "bg-[var(--color-error)]/10 border-[var(--color-error)]/30 text-[var(--color-error)]" : "bg-[var(--color-success)]/10 border-[var(--color-success)]/30 text-[var(--color-success)]"}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-6 bg-surface-low border border-[var(--color-border-solid)] p-6 sm:p-8 rounded-sm shadow-sm">
            <div>
              <label htmlFor="name" className="block text-xs font-sans font-medium uppercase tracking-wider text-on-surface-muted">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your legal name"
                className="input-editorial w-full py-2 mt-2 text-base bg-transparent"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-sans font-medium uppercase tracking-wider text-on-surface-muted">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="input-editorial w-full py-2 mt-2 text-base bg-transparent"
              />
              <p className="text-[10px] text-on-surface-muted/60 mt-2 uppercase tracking-wide">
                Note: Changing your email will send a verification link to both addresses.
              </p>
            </div>

            <div>
              <label htmlFor="phone" className="block text-xs font-sans font-medium uppercase tracking-wider text-on-surface-muted">
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +91 00000 00000"
                className="input-editorial w-full py-2 mt-2 text-base bg-transparent"
              />
            </div>

            <div className="pt-4 border-t border-[var(--color-border-ghost)] flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="btn-primary"
              >
                {saving ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
