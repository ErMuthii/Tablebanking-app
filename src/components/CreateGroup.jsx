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
import { customAlphabet } from "nanoid";

// Generate a friendly, 6-character alphanumeric code
const nanoid = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 6);

export const CreateGroup = ({ onGroupCreated }) => {
  const { user } = useSession();
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) {
      toast.error("Please enter a group name.");
      return;
    }

    setLoading(true);
    const inviteCode = nanoid();

    const { data, error } = await supabase
      .from("groups")
      .insert({
        name: groupName,
        created_by: user.id,
        invite_code: inviteCode,
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to create group. Please try again.");
      console.error("Error creating group:", error);
      setLoading(false);
    } else {
      toast.success(`Group "${groupName}" created successfully!`);
      if (onGroupCreated) {
        onGroupCreated(data);
      }
    }
  };

  return (
    <div className="bg-green-50 min-h-screen py-8">
      <div className="max-w-2xl mx-auto">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Create Your Group</CardTitle>
            <CardDescription>
              You don't have a group yet. Create one to get started.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <Input
                placeholder="Enter your group's name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                disabled={loading}
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating Group..." : "Create Group"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
