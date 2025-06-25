import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../SupabaseClient";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const SignUp = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!form.role) {
      setError("Please select a role");
      return;
    }

    setLoading(true);
    // 1. Sign up with Supabase Auth
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // 2. Insert profile record
    const userId = signUpData.user.id;
    const { error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        full_name: `${form.firstName} ${form.lastName}`,
        role: form.role,
        email: form.email,
      });

    if (profileError) {
      setError("Could not create user profile");
      setLoading(false);
      return;
    }

    // 3. Redirect to welcome or dashboard
    navigate("/welcome");
  };

  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center py-8">
      <Card className="w-full max-w-md shadow-lg border-0 rounded-2xl">
        <CardContent className="p-8">
          <h2 className="text-2xl font-bold text-[#1F5A3D] mb-2 text-center">
            Create your account
          </h2>
          <p className="text-gray-600 text-center mb-6">
            Sign up to join TableBank
          </p>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex gap-3">
              <div className="flex-1">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                name="role"
                value={form.role}
                onChange={handleChange}
                required
                className="w-full mt-1 rounded-md border px-3 py-2 text-base focus:ring-2 focus:ring-[#1F5A3D]/60"
              >
                <option value="" disabled>
                  Select role
                </option>
                <option value="member">Member</option>
                <option value="group_leader">Group Leader</option>
              </select>
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center">{error}</div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1F5A3D] hover:bg-[#17432e] text-white font-semibold mt-2"
            >
              {loading ? "Signing Up…" : "Sign Up"}
            </Button>
          </form>

          <div className="text-center text-sm mt-4">
            Already have an account?{" "}
            <Link
              to="/login"
              className="underline underline-offset-4 text-[#1F5A3D] hover:text-[#17432e]"
            >
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUp;
