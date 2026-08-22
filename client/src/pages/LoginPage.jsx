import { ArrowRight } from "@phosphor-icons/react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      setSubmitting(true);
      await login(form);
      navigate("/", { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-black px-4 py-10">
      <div className="grid w-full max-w-[935px] grid-cols-1 items-center gap-10 lg:grid-cols-[420px_350px] lg:justify-center">
        <section className="relative hidden h-[580px] lg:block">
          <div className="absolute left-10 top-1/2 h-[560px] w-[270px] -translate-y-1/2 rounded-[36px] border border-border bg-gradient-to-b from-[#1a1a1a] via-[#0f0f0f] to-black p-3 shadow-lifted">
            <div className="flex h-full flex-col overflow-hidden rounded-[30px] border border-white/10 bg-black">
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <p className="[font-family:'Segoe_Script',cursive] text-[28px] text-white">Curated</p>
                <div className="flex gap-1">
                  <span className="h-2 w-2 rounded-full bg-white/40" />
                  <span className="h-2 w-2 rounded-full bg-white/20" />
                </div>
              </div>
              <div className="flex-1 space-y-4 bg-[radial-gradient(circle_at_top,rgba(214,41,118,0.15),transparent_32%),radial-gradient(circle_at_bottom,rgba(250,126,30,0.18),transparent_30%)] px-4 py-5">
                <div className="rounded-[24px] border border-border bg-[#101010] p-3">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="story-ring">
                      <div className="rounded-full bg-black p-[2px]">
                        <div
                          className="h-8 w-8 rounded-full bg-cover bg-center"
                          style={{
                            backgroundImage:
                              "url('https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&q=80')",
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold">ava.studio</p>
                      <p className="text-[11px] text-[#a8a8a8]">New York</p>
                    </div>
                  </div>
                  <div
                    className="aspect-[4/5] rounded-[18px] bg-cover bg-center"
                    style={{
                      backgroundImage:
                        "url('https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80')",
                    }}
                  />
                </div>
                <div className="ml-auto w-[78%] rounded-[22px] border border-border bg-[#101010] p-3">
                  <div
                    className="aspect-square rounded-[18px] bg-cover bg-center"
                    style={{
                      backgroundImage:
                        "url('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80')",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-[350px]">
          <div className="border border-border bg-black px-10 py-8">
            <div className="text-center">
              <p className="[font-family:'Segoe_Script',cursive] text-[48px] text-white">Curated</p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-2.5">
              <input
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                type="email"
                placeholder="Phone number, username, or email"
                className="ig-input"
              />
              <input
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                type="password"
                placeholder="Password"
                className="ig-input"
              />

              {error ? <p className="pt-1 text-sm text-[#ff7d91]">{error}</p> : null}

              <button
                type="submit"
                disabled={submitting}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accentSoft disabled:cursor-not-allowed disabled:opacity-70"
              >
                <span>{submitting ? "Signing in..." : "Sign in"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#a8a8a8]">or</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <p className="text-center text-sm text-[#a8a8a8]">
              Sign in to see photos and videos from your friends.
            </p>
          </div>

          <div className="mt-3 border border-border bg-black px-6 py-5 text-center text-sm text-[#f5f5f5]">
            Don’t have an account?{" "}
            <Link to="/register" className="font-semibold text-accent hover:text-accentSoft">
              Sign up
            </Link>
          </div>

          <p className="mt-6 text-center text-xs text-[#737373]">
            Meta · About · Blog · Jobs · Help · API · Privacy · Terms
          </p>
        </section>
      </div>
    </div>
  );
}
