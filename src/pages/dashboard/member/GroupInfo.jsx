import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export default function GroupInfo() {
  // TODO: Replace this dummy data with actual Supabase fetch
  const group = {
    name: "Jitegemea Women Group",
    leader: "Anne Mwikali",
    chairperson: "Grace Njeri",
    secretary: "Mary Atieno",
    totalMembers: 18,
    totalSavings: 250000,
    createdAt: "2023-08-15",
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Group Information</h2>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="p-4 space-y-1">
            <p className="text-muted-foreground text-sm">Group Name</p>
            <p className="font-medium">{group.name}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-1">
            <p className="text-muted-foreground text-sm">Group Leader</p>
            <p className="font-medium">{group.leader}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-1">
            <p className="text-muted-foreground text-sm">Chairperson</p>
            <p className="font-medium">{group.chairperson}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-1">
            <p className="text-muted-foreground text-sm">Secretary</p>
            <p className="font-medium">{group.secretary}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-1">
            <p className="text-muted-foreground text-sm">Total Members</p>
            <p className="font-medium">{group.totalMembers}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-1">
            <p className="text-muted-foreground text-sm">Total Savings</p>
            <p className="font-medium">KES {group.totalSavings.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-1">
            <p className="text-muted-foreground text-sm">Date Created</p>
            <p className="font-medium">{new Date(group.createdAt).toDateString()}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
