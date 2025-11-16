"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Plus, Mail, Send, Clock, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface Segment {
  id: string;
  name: string;
}

interface Campaign {
  id: string;
  name: string;
  subject: string;
  content: string;
  status: string;
  scheduledAt?: string;
  sentAt?: string;
  recipientCount: number;
  segment?: {
    id: string;
    name: string;
  };
  createdAt: string;
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    content: "",
    segmentId: "",
    scheduledAt: "",
  });

  useEffect(() => {
    fetchCampaigns();
    fetchSegments();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const res = await fetch("/api/admin/campaigns");
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data.campaigns || []);
      }
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSegments = async () => {
    try {
      const res = await fetch("/api/admin/segments");
      if (res.ok) {
        const data = await res.json();
        setSegments(data.segments || []);
      }
    } catch (error) {
      console.error("Error fetching segments:", error);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          segmentId: formData.segmentId || undefined,
          scheduledAt: formData.scheduledAt || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create campaign");
      }

      toast.success("Campaign created!");
      setShowCreate(false);
      setFormData({
        name: "",
        subject: "",
        content: "",
        segmentId: "",
        scheduledAt: "",
      });
      fetchCampaigns();
    } catch (error: any) {
      toast.error(error.message || "Failed to create campaign");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "scheduled":
        return <Clock className="h-4 w-4 text-blue-600" />;
      case "sending":
        return <Send className="h-4 w-4 text-yellow-600" />;
      default:
        return <Mail className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Email Campaigns
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Create and manage email marketing campaigns
            </p>
          </div>
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Campaign
          </Button>
        </div>

        {/* Create Form */}
        {showCreate && (
          <Card>
            <CardHeader>
              <CardTitle>Create Email Campaign</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Campaign Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Email Subject *</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Email Content *</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    rows={10}
                    required
                    placeholder="HTML or plain text email content"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="segmentId">Target Segment (Optional)</Label>
                    <Select
                      id="segmentId"
                      value={formData.segmentId}
                      onChange={(e) =>
                        setFormData({ ...formData, segmentId: e.target.value })
                      }
                    >
                      <option value="">All Users</option>
                      {segments.map((segment) => (
                        <option key={segment.id} value={segment.id}>
                          {segment.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="scheduledAt">Schedule (Optional)</Label>
                    <Input
                      id="scheduledAt"
                      type="datetime-local"
                      value={formData.scheduledAt}
                      onChange={(e) =>
                        setFormData({ ...formData, scheduledAt: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Create Campaign</Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCreate(false);
                      setFormData({
                        name: "",
                        subject: "",
                        content: "",
                        segmentId: "",
                        scheduledAt: "",
                      });
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Campaigns List */}
        {loading ? (
          <div className="text-center py-8">Loading campaigns...</div>
        ) : campaigns.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No campaigns yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <Card key={campaign.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(campaign.status)}
                      <CardTitle>{campaign.name}</CardTitle>
                    </div>
                    <span className="text-sm px-2 py-1 rounded bg-gray-100 dark:bg-gray-800">
                      {campaign.status}
                    </span>
                  </div>
                  <CardDescription>{campaign.subject}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <strong>Recipients:</strong> {campaign.recipientCount}
                    </div>
                    {campaign.segment && (
                      <div className="text-sm">
                        <strong>Segment:</strong> {campaign.segment.name}
                      </div>
                    )}
                    {campaign.scheduledAt && (
                      <div className="text-sm">
                        <strong>Scheduled:</strong>{" "}
                        {new Date(campaign.scheduledAt).toLocaleString()}
                      </div>
                    )}
                    {campaign.sentAt && (
                      <div className="text-sm">
                        <strong>Sent:</strong>{" "}
                        {new Date(campaign.sentAt).toLocaleString()}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      Created: {new Date(campaign.createdAt).toLocaleString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

