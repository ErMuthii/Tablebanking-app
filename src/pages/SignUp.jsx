import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const SignUp = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    // TODO: Integrate with Supabase sign up
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
                <option value="tablebanking">Table Banking</option>
                <option value="member">Member</option>
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
              className="w-full bg-[#1F5A3D] hover:bg-[#17432e] text-white font-semibold mt-2"
            >
              Sign Up
            </Button>
          </form>
          <div className="text-center text-sm mt-4">
            Already have an account?{" "}
            <a
              href="/login"
              className="underline underline-offset-4 text-[#1F5A3D] hover:text-[#17432e]"
            >
              Login
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUp;
