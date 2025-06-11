import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "../SupabaseClient";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({ className, ...props }) {
  const navigate = useNavigate();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // 1. Sign in
    const { data: signInData, error: authError } =
      await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // 2. Get session & user ID
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      setError("Could not retrieve session");
      setLoading(false);
      return;
    }
    const userId = session.user.id;

    // 3. Fetch role from profiles
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      setError("Could not fetch user role");
      setLoading(false);
      return;
    }

    // 4. Redirect based on role
    setLoading(false);
    switch (profile.role) {
      case "member":
        navigate("/dashboards/member");
        break;
      case "group_leader":
        navigate("/dashboards/group-leader");
        break;
      case "admin":
        navigate("/dashboards/admin");
        break;
      default:
        navigate("/");
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-6 font-sans bg-gray-50 min-h-screen justify-center items-center",
        className
      )}
      {...props}
    >
      <Card className="overflow-hidden p-0 shadow-lg border-0 rounded-2xl max-w-3xl w-full">
        <CardContent className="grid p-0 md:grid-cols-2">
          {/* Illustration Panel */}
          <div className="hidden md:block bg-gradient-to-br from-[#1F5A3D]/90 to-[#1F5A3D]/60 relative">
            <img
              src="/tablebank-illustration.svg"
              alt="Community Banking Illustration"
              className="absolute inset-0 h-full w-full object-cover opacity-80 mix-blend-multiply"
            />
            <div className="absolute inset-0 bg-[#1F5A3D]/70" />
            <div className="relative z-10 flex flex-col h-full justify-center items-center text-white p-8">
              <h2 className="text-3xl font-bold mb-2">TableBank</h2>
              <p className="text-lg font-medium">
                Empowering Community Savings
              </p>
            </div>
          </div>

          {/* Login Form */}
          <form
            onSubmit={handleSubmit}
            className="p-8 flex flex-col justify-center bg-white rounded-r-2xl"
          >
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold text-[#1F5A3D]">
                  Welcome back
                </h1>
                <p className="text-gray-600 mt-1">
                  Login to your TableBank account
                </p>
              </div>

              {/* Email */}
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="focus:ring-2 focus:ring-[#1F5A3D]/60"
                />
              </div>

              {/* Password */}
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="#"
                    className="ml-auto text-sm text-[#1F5A3D] underline-offset-2 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="focus:ring-2 focus:ring-[#1F5A3D]/60"
                />
              </div>

              {/* Error message */}
              {error && (
                <div className="text-red-600 text-sm text-center">{error}</div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1F5A3D] hover:bg-[#17432e] text-white font-semibold shadow-md"
              >
                {loading ? "Logging in…" : "Login"}
              </Button>

              {/* Social / alternate login */}
              <div className="relative text-center text-sm mt-2 mb-2">
                <span className="bg-white px-2 text-gray-400">
                  Or continue with
                </span>
                <div className="absolute inset-0 top-1/2 border-t border-gray-200" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                {/* Buttons for Apple, Google, Meta… */}
              </div>

              {/* Sign-up link */}
              <div className="text-center text-sm mt-2">
                Don’t have an account?{" "}
                <Link
                  to="/signup"
                  className="underline underline-offset-4 text-[#1F5A3D] hover:text-[#17432e]"
                >
                  Sign up
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Terms footer */}
      <div className="text-center text-xs text-gray-500 mt-4">
        By clicking continue, you agree to our{" "}
        <a href="#" className="underline hover:text-[#1F5A3D]">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="underline hover:text-[#1F5A3D]">
          Privacy Policy
        </a>
        .
      </div>
    </div>
  );
}
