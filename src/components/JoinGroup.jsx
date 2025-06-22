import React, { useState } from "react";
import { supabase } from "@/SupabaseClient";
import { useSession } from "@/hooks/useSession";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { toast } from "sonner";

export const JoinGroup = ({ onGroupJoined }) => {
  const { user } = useSession();
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleJoinGroup = async (e) => {
    e.preventDefault();
    console.log("Attempting to join group...");

    if (!inviteCode.trim()) {
      toast.error("Please enter an invite code.");
      console.log("Exited: No invite code provided.");
      return;
    }
    setLoading(true);

    // 1. Find the group with the invite code
    console.log(`Searching for group with invite code: ${inviteCode.trim()}`);
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

    // 2. Add the user to the group
    console.log(`Attempting to add user ${user.id} to group ${group.id}`);
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
    }
  };

  return (
    <div className="flex items-center justify-center h-full p-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Join a Group</CardTitle>
          <CardDescription>
            Enter the invite code provided by your group leader to join.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleJoinGroup} className="space-y-4">
            <Input
              placeholder="Enter invite code"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              disabled={loading}
              maxLength="6"
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Joining Group..." : "Join Group"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
