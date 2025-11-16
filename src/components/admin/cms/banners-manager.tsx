"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function BannersManager() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Banners</CardTitle>
        <CardDescription>Manage promotional banners</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Banners feature coming soon. This will allow you to create and manage
          promotional banners that appear on your website.
        </p>
      </CardContent>
    </Card>
  );
}

