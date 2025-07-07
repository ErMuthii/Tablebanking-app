import React from "react";
import LoginForm from "@/components/login-form"; // ✅ default import


const Login = () => {
  return (
    <div className="bg-muted min-h-screen w-full flex items-center justify-center p-0">
      <LoginForm />
    </div>
  );
};

export default Login;
