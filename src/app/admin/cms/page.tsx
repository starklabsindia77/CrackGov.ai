"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, HelpCircle, Bell, Image } from "lucide-react";
import Link from "next/link";
import { PagesManager } from "@/components/admin/cms/pages-manager";
import { FaqsManager } from "@/components/admin/cms/faqs-manager";
import { AnnouncementsManager } from "@/components/admin/cms/announcements-manager";
import { BannersManager } from "@/components/admin/cms/banners-manager";

export default function CMSAdminPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Content Management</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage website content, pages, FAQs, announcements, and banners
          </p>
        </div>

        <Tabs defaultValue="pages" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pages">
              <FileText className="h-4 w-4 mr-2" />
              Pages
            </TabsTrigger>
            <TabsTrigger value="faqs">
              <HelpCircle className="h-4 w-4 mr-2" />
              FAQs
            </TabsTrigger>
            <TabsTrigger value="announcements">
              <Bell className="h-4 w-4 mr-2" />
              Announcements
            </TabsTrigger>
            <TabsTrigger value="banners">
              <Image className="h-4 w-4 mr-2" />
              Banners
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pages">
            <PagesManager />
          </TabsContent>

          <TabsContent value="faqs">
            <FaqsManager />
          </TabsContent>

          <TabsContent value="announcements">
            <AnnouncementsManager />
          </TabsContent>

          <TabsContent value="banners">
            <BannersManager />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}

