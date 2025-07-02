import React, { useState } from "react";
import { supabase } from "@/SupabaseClient";
import { useSession } from "@/hooks/useSession";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { toast } from "sonner";
import { Loader2, Users, ArrowRight } from "lucide-react";

export const JoinGroup = ({ onGroupJoined }) => {
  const { user } = useSession();
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleJoinGroup = async () => {
    console.log("Attempting to join group...");

    if (!inviteCode.trim() || inviteCode.length !== 6) {
      toast.error("Please enter a complete 6-character invite code.");
      console.log("Exited: Invalid invite code provided.");
      return;
    }
    setLoading(true);

    const { data: groups, error: groupError } = await supabase
      .from("groups")
      .select("id")
      .eq("invite_code", inviteCode.trim());

    if (groupError || !groups || groups.length === 0) {
      toast.error("Invalid invite code. Please check the code and try again.");
      console.error("Group fetch error:", groupError);
      console.log("Exited: Group not found or error fetching group.");
      setLoading(false);
      return;
    }

    const group = groups[0];
    console.log(`Found group with ID: ${group.id}`);

    const { data: membership, error: insertError } = await supabase
      .from("group_members")
      .insert({
        group_id: group.id,
        member_id: user.id,
      })
      .select()
      .single();

    if (insertError) {
      toast.error("Failed to join group. You may already be a member.");
      console.error("Error joining group:", insertError);
      setLoading(false);
    } else {
      toast.success("Successfully joined the group!");
      console.log("Successfully joined group. Membership data:", membership);
      if (onGroupJoined) {
        onGroupJoined(membership);
      }
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      
    >
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4 pb-8">
            <div
              className="w-16 h-16 rounded-full mx-auto flex items-center justify-center shadow-lg"
              style={{ backgroundColor: "#1F5A3D" }}
            >
              <Users className="w-8 h-8 text-white" />
            </div>
            <div className="space-y-2">
              <CardTitle
                className="text-2xl font-bold"
                style={{ color: "#1F5A3D" }}
              >
                Join a Group
              </CardTitle>
              <CardDescription className="text-gray-600 text-base leading-relaxed">
                Enter the 6-character invite code provided by your group leader
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-8">
            <div className="space-y-8">
              <div className="space-y-4">
                <label
                  className="text-sm font-medium block text-center"
                  style={{ color: "#1F5A3D" }}
                >
                  Invite Code
                </label>
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={inviteCode}
                    onChange={(value) => setInviteCode(value.toUpperCase())}
                    disabled={loading}
                    className="gap-2"
                  >
                    <InputOTPGroup>
                      <InputOTPSlot
                        index={0}
                        className="w-12 h-12 text-lg font-bold border-2 rounded-lg focus:border-[#1F5A3D] focus:ring-1 focus:ring-[#1F5A3D]/20"
                      />
                      <InputOTPSlot
                        index={1}
                        className="w-12 h-12 text-lg font-bold border-2 rounded-lg focus:border-[#1F5A3D] focus:ring-2 focus:ring-[#1F5A3D]/20"
                      />
                      <InputOTPSlot
                        index={2}
                        className="w-12 h-12 text-lg font-bold border-2 rounded-lg focus:border-[#1F5A3D] focus:ring-2 focus:ring-[#1F5A3D]/20"
                      />
                    </InputOTPGroup>
                    <InputOTPGroup>
                      <InputOTPSlot
                        index={3}
                        className="w-12 h-12 text-lg font-bold border-2 rounded-lg focus:border-[#1F5A3D] focus:ring-2 focus:ring-[#1F5A3D]/20"
                      />
                      <InputOTPSlot
                        index={4}
                        className="w-12 h-12 text-lg font-bold border-2 rounded-lg focus:border-[#1F5A3D] focus:ring-2 focus:ring-[#1F5A3D]/20"
                      />
                      <InputOTPSlot
                        index={5}
                        className="w-12 h-12 text-lg font-bold border-2 rounded-lg focus:border-[#1F5A3D] focus:ring-2 focus:ring-[#1F5A3D]/20"
                      />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>

              <Button
                onClick={handleJoinGroup}
                className="w-full h-12 text-base font-semibold rounded-lg transition-all duration-200 hover:shadow-lg disabled:opacity-50"
                style={{
                  backgroundColor: "#1F5A3D",
                  color: "white",
                }}
                disabled={loading || inviteCode.length !== 6}
                onMouseEnter={(e) => {
                  if (!loading && inviteCode.length === 6) {
                    e.target.style.backgroundColor = "#164430";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.target.style.backgroundColor = "#1F5A3D";
                  }
                }}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Joining Group...
                  </>
                ) : (
                  <>
                    Join Group
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-500">
                Don't have an invite code?{" "}
                <button
                  className="font-medium hover:underline"
                  style={{ color: "#1F5A3D" }}
                >
                  Contact your group leader
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
