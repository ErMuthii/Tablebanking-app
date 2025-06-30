import React, { useState, useEffect } from "react";
import { supabase } from "@/SupabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Mail, Send, Loader2, UserPlus, Sparkles } from "lucide-react";

export default function InviteMemberDialog({ group, user, trigger }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.id) {
        const { data } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();
        if (data?.full_name) setFullName(data.full_name);
      }
    };
    fetchProfile();
  }, [user]);

  const handleInvite = async () => {
    setLoading(true);
    const { error } = await supabase.functions.invoke("resend-email", {
      body: {
        recipientEmail: email,
        inviteCode: group.invite_code,
        groupName: group.name,
        senderName: fullName || "Group Leader",
      },
    });
    setLoading(false);
    if (error) {
      toast.error("Failed to send invite: " + error.message);
    } else {
      toast.success("Invite sent to " + email + "!");
      setOpen(false);
      setEmail("");
    }
  };

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="outline"
            className="border-2 text-[#1F5A3D] border-[#1F5A3D] hover:bg-[#1F5A3D] hover:text-white transition-all duration-200"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Invite Member
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-white border-0 shadow-2xl max-w-md p-0 gap-0 rounded-xl overflow-hidden">
        {/* Header Section */}
        <div className="px-6 py-8 text-center relative overflow-hidden bg-[#F0F9FF]">
          <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center shadow-lg relative overflow-hidden mb-4 bg-[#1F5A3D]">
            <Mail className="w-8 h-8 text-white z-10" />
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
          </div>

          <DialogTitle className="text-2xl font-bold mb-2 flex items-center justify-center gap-2 text-[#1F5A3D]">
            Invite a Member
          </DialogTitle>

          <DialogDescription className="text-gray-600 text-base leading-relaxed">
            Send an email invitation to join{" "}
            <span className="font-semibold text-[#1F5A3D]">{group?.name}</span>
          </DialogDescription>
        </div>

        {/* Content Section */}
        <div className="px-6 py-6 space-y-6">
          {/* Email Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2 text-[#1F5A3D]">
              <Mail className="w-4 h-4" />
              Email Address
            </label>
            <Input
              type="email"
              placeholder="Enter member's email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className={`h-12 text-base border-2 rounded-lg focus:border-[#1F5A3D] focus:ring-2 focus:ring-[#1F5A3D]/20 transition-all duration-200 ${
                email
                  ? isValidEmail(email)
                    ? "border-[#1F5A3D]"
                    : "border-red-500"
                  : "border-[#e5e5e5]"
              }`}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  email &&
                  isValidEmail(email) &&
                  !loading
                ) {
                  handleInvite();
                }
              }}
            />
            {email && !isValidEmail(email) && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                Please enter a valid email address
              </p>
            )}
          </div>

          {/* Invite Preview */}
          {group && (
            <div className="p-4 rounded-lg border-l-4 border-[#1F5A3D] bg-gradient-to-r from-green-50 to-transparent">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-900">
                  Invitation Preview:
                </p>
                <div className="text-xs text-gray-600 space-y-1">
                  <p>
                    <span className="font-medium">Group:</span> {group.name}
                  </p>
                  <p>
                    <span className="font-medium">Invite Code:</span>{" "}
                    {group.invite_code}
                  </p>
                  <p>
                    <span className="font-medium">From:</span>{" "}
                    {fullName || "Group Leader"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 h-11 border-gray-300 text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleInvite}
              disabled={loading || !email || !isValidEmail(email)}
              className="flex-1 h-11 text-base font-semibold rounded-lg bg-[#1F5A3D] text-white transition-all duration-200 hover:bg-[#164430] hover:shadow-lg disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Invite
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
