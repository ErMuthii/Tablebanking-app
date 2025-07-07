import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/SupabaseClient";

export default function OAuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handlePostOAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        navigate("/login");
        return;
      }

      // Get the role from query param
      const params = new URLSearchParams(window.location.search);
      const role = params.get("role") || "member";

      // Optionally store this role in the user's profile table
      await supabase.from("profiles").upsert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata.full_name || "",
        role,
      });

      // Navigate based on role
      if (role === "group_leader") {
        navigate("/dashboard/leader");
      } else {
        navigate("/dashboard/member");
      }
    };

    handlePostOAuth();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Finishing sign-in...</p>
    </div>
  );
}
