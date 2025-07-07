import React, { useState } from "react";
import { supabase } from "@/SupabaseClient"; 
import {
  Eye, EyeOff, Mail, Lock, User, Phone, UserCheck, ArrowRight
} from "lucide-react";

export default function SignUpForm() {
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    role: "", password: "", confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  const { data, error } = await supabase.auth.signUp({
    email: form.email,
    password: form.password,
    options: {
      data: {
        first_name: form.firstName,
        last_name: form.lastName,
        phone: form.phone,
        role: form.role,
      },
    },
  });

  if (error) {
    setError(error.message);
    setLoading(false);
  } else {
    // Optional: send user to email verification page or login
    const user = data.user;

if (user) {
  const { error: profileError } = await supabase.from("profiles").insert({
    id: user.id,
    email: form.email,
    full_name: fullName,
    phone_number: form.phone,
    role: form.role,
  });

  if (profileError) {
    setError("Account created, but failed to save profile.");
    console.error("Profile insert error:", profileError.message);
  } else {
    alert("Account created successfully! Please check your email to verify.");
  }
}
setLoading(false);

  }
};

const handleGoogleSignUp = async () => {
  setError("");

  if (!form.role) {
    setError("Please select your role before continuing with Google Sign-Up.");
    return;
  }

  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/oauth-callback`,
        queryParams: {
          role: form.role, // pass selected role to your redirect handler
        },
      },
    });

    if (error) {
      setError("Google sign-in failed: " + error.message);
    }
  } catch (err) {
    setError("Unexpected error during Google sign-in.");
  }
};



  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4">
      <div className="w-full max-w-5xl bg-white shadow-xl rounded-2xl flex flex-col md:flex-row overflow-hidden border border-gray-200">
        {/* Left Panel */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-600 text-white p-8 md:w-1/2 flex flex-col justify-center">
          <h2 className="text-3xl font-bold mb-2">Chama Pro</h2>
<p className="text-xl mb-6">Empowering Community Savings</p>
<ul className="text-base space-y-4">
  <li>• Secure group savings management</li>
  <li>• Track contributions and loans</li>
  <li>• Community-driven financial growth</li>
</ul>

        </div>

        {/* Right Panel - Form */}
        <div className="p-8 md:w-1/2">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Create account</h2>
            <p className="text-sm text-gray-500">Join thousands building their financial future</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-4">
              <div className="relative w-1/2">
                <User className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <input
                  name="firstName"
                  placeholder="First Name"
                  value={form.firstName}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg"
                />
              </div>
              <div className="relative w-1/2">
                <User className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <input
                  name="lastName"
                  placeholder="Last Name"
                  value={form.lastName}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg"
                />
              </div>
            </div>

            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
              <input
                name="email"
                type="email"
                placeholder="Email address"
                value={form.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
            </div>

            <div className="relative">
              <Phone className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
              <input
                name="phone"
                placeholder="Phone number"
                value={form.phone}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
            </div>

            <div className="relative">
              <UserCheck className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 border rounded-lg bg-white"
              >
                <option value="">Select your role</option>
                <option value="member">Member</option>
                <option value="group_leader">Group Leader</option>
              </select>
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                className="w-full pl-10 pr-10 py-2 border rounded-lg"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-gray-500">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm password"
                value={form.confirmPassword}
                onChange={handleChange}
                className="w-full pl-10 pr-10 py-2 border rounded-lg"
              />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-2.5 text-gray-500">
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2"
            >
              {loading ? "Creating..." : <>Create account <ArrowRight size={16} /></>}
            </button>

            <div className="text-center text-sm text-gray-500 my-4">or sign up with</div>

            <button
              onClick={handleGoogleSignUp}
              type="button"
              className="w-full border border-gray-300 py-2 rounded-lg flex items-center justify-center gap-3 hover:bg-gray-50"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
              <span className="text-sm">Sign up with Google</span>
            </button>

            <p className="text-center text-sm mt-6 text-gray-500">
              Already have an account?{" "}
              <a href="/login" className="text-emerald-600 hover:underline">Sign in</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
