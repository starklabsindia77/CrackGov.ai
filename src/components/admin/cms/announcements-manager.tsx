"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function AnnouncementsManager() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Announcements</CardTitle>
        <CardDescription>Manage site-wide announcements</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Announcements feature coming soon. This will allow you to create and manage
          site-wide announcements that appear to users.
        </p>
      </CardContent>
    </Card>
  );
}

