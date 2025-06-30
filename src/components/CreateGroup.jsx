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
import { Loader2, Users, Plus, Sparkles } from "lucide-react";

// Generate a friendly, 6-character alphanumeric code
const nanoid = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 6);

export const CreateGroup = ({ onGroupCreated }) => {
  const { user } = useSession();
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreateGroup = async () => {
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
    <div 
      className="min-h-screen flex items-center justify-center p-4"
    >
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4 pb-8">
            <div 
              className="w-16 h-16 rounded-full mx-auto flex items-center justify-center shadow-lg relative overflow-hidden"
              style={{ backgroundColor: '#1F5A3D' }}
            >
              <Users className="w-8 h-8 text-white z-10" />
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
            </div>
            <div className="space-y-2">
              <CardTitle 
                className="text-2xl font-bold flex items-center justify-center gap-2"
                style={{ color: '#1F5A3D' }}
              >
                Create Your Group
                <Sparkles className="w-5 h-5 text-yellow-500" />
              </CardTitle>
              <CardDescription className="text-gray-600 text-base leading-relaxed">
                You don't have a group yet. Create one to get started and bring people together.
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label 
                  className="text-sm font-medium"
                  style={{ color: '#1F5A3D' }}
                >
                  Group Name
                </label>
                <Input
                  placeholder="Enter your group's name"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  disabled={loading}
                  className="h-12 text-base border-2 rounded-lg focus:border-[#1F5A3D] focus:ring-2 focus:ring-[#1F5A3D]/20 transition-all duration-200"
                  style={{ 
                    borderColor: groupName ? '#1F5A3D' : '#e5e5e5',
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && groupName.trim() && !loading) {
                      handleCreateGroup();
                    }
                  }}
                />
              </div>
              
              <Button 
                onClick={handleCreateGroup}
                className="w-full h-12 text-base font-semibold rounded-lg transition-all duration-200 hover:shadow-lg disabled:opacity-50"
                style={{ 
                  backgroundColor: '#1F5A3D',
                  color: 'white'
                }}
                disabled={loading || !groupName.trim()}
                onMouseEnter={(e) => {
                  if (!loading && groupName.trim()) {
                    e.target.style.backgroundColor = '#164430';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.target.style.backgroundColor = '#1F5A3D';
                  }
                }}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Group...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Group
                  </>
                )}
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500 font-medium">What happens next?</span>
                </div>
              </div>
              
              <div 
                className="p-4 rounded-lg border-l-4 bg-gradient-to-r from-green-50 to-transparent"
                style={{ borderLeftColor: '#1F5A3D' }}
              >
                <div className="flex items-start space-x-3">
                  <div 
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white mt-1"
                    style={{ backgroundColor: '#1F5A3D' }}
                  >
                    1
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Get your invite code
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      You'll receive a 6-character code to share with members
                    </p>
                  </div>
                </div>
              </div>
              
              <div 
                className="p-4 rounded-lg border-l-4 bg-gradient-to-r from-blue-50 to-transparent"
                style={{ borderLeftColor: '#3B82F6' }}
              >
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold text-white mt-1">
                    2
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Invite your members
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Share the code with people you want to join your group
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};