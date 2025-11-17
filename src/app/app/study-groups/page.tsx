"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Plus, Users, Lock, Globe, LogOut, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface StudyGroup {
  id: string;
  name: string;
  description?: string;
  exam?: string;
  isPublic: boolean;
  maxMembers: number;
  memberCount: number;
  createdBy: {
    id: string;
    name?: string;
    email: string;
  };
  createdAt: string;
}

export default function StudyGroupsPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [myGroups, setMyGroups] = useState<StudyGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "my">("all");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    exam: "",
    isPublic: true,
    maxMembers: 50,
  });

  useEffect(() => {
    fetchGroups();
    fetchMyGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const res = await fetch("/api/study-groups");
      if (res.ok) {
        const data = await res.json();
        setGroups(data.groups || []);
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyGroups = async () => {
    try {
      const res = await fetch("/api/study-groups?myGroups=true");
      if (res.ok) {
        const data = await res.json();
        setMyGroups(data.groups || []);
      }
    } catch (error) {
      console.error("Error fetching my groups:", error);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/study-groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          exam: formData.exam || undefined,
          maxMembers: parseInt(String(formData.maxMembers)) || 50,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create group");
      }

      toast.success("Study group created!");
      setShowCreate(false);
      setFormData({
        name: "",
        description: "",
        exam: "",
        isPublic: true,
        maxMembers: 50,
      });
      fetchGroups();
      fetchMyGroups();
    } catch (error: any) {
      toast.error(error.message || "Failed to create group");
    }
  };

  const handleJoin = async (groupId: string) => {
    try {
      const res = await fetch(`/api/study-groups/${groupId}/join`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to join group");
      }

      toast.success("Joined group!");
      fetchGroups();
      fetchMyGroups();
    } catch (error: any) {
      toast.error(error.message || "Failed to join group");
    }
  };

  const handleLeave = async (groupId: string) => {
    if (!confirm("Are you sure you want to leave this group?")) return;

    try {
      const res = await fetch(`/api/study-groups/${groupId}/leave`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to leave group");
      }

      toast.success("Left group");
      fetchGroups();
      fetchMyGroups();
    } catch (error: any) {
      toast.error(error.message || "Failed to leave group");
    }
  };

  const displayGroups = activeTab === "all" ? groups : myGroups;

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Study Groups
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Join or create study groups to learn together
            </p>
          </div>
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Group
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 font-medium ${
              activeTab === "all"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground"
            }`}
          >
            All Groups
          </button>
          <button
            onClick={() => setActiveTab("my")}
            className={`px-4 py-2 font-medium ${
              activeTab === "my"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground"
            }`}
          >
            My Groups ({myGroups.length})
          </button>
        </div>

        {/* Create Form */}
        {showCreate && (
          <Card>
            <CardHeader>
              <CardTitle>Create Study Group</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Group Name *</Label>
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
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="exam">Exam Type</Label>
                    <Input
                      id="exam"
                      value={formData.exam}
                      onChange={(e) =>
                        setFormData({ ...formData, exam: e.target.value })
                      }
                      placeholder="UPSC, SSC, etc."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxMembers">Max Members</Label>
                    <Input
                      id="maxMembers"
                      type="number"
                      min="2"
                      max="100"
                      value={formData.maxMembers}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          maxMembers: parseInt(e.target.value) || 50,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={formData.isPublic}
                    onChange={(e) =>
                      setFormData({ ...formData, isPublic: e.target.checked })
                    }
                    className="rounded"
                  />
                  <Label htmlFor="isPublic">Public Group</Label>
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Create Group</Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCreate(false);
                      setFormData({
                        name: "",
                        description: "",
                        exam: "",
                        isPublic: true,
                        maxMembers: 50,
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

        {/* Groups List */}
        {loading ? (
          <div className="text-center py-8">Loading groups...</div>
        ) : displayGroups.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                {activeTab === "all"
                  ? "No public groups available"
                  : "You haven't joined any groups yet"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {displayGroups.map((group) => {
              const isMyGroup = myGroups.some((g) => g.id === group.id);
              return (
                <Card key={group.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{group.name}</span>
                      {group.isPublic ? (
                        <Globe className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      )}
                    </CardTitle>
                    {group.description && (
                      <CardDescription>{group.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Members</span>
                        <span className="font-semibold flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {group.memberCount}/{group.maxMembers}
                        </span>
                      </div>
                      {group.exam && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Exam: </span>
                          <span className="font-medium">{group.exam}</span>
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground">
                        Created by {group.createdBy.name || group.createdBy.email}
                      </div>
                      <div className="flex gap-2">
                        {isMyGroup ? (
                          <>
                            <Link href={`/app/study-groups/${group.id}`} className="flex-1">
                              <Button variant="outline" className="w-full" size="sm">
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Open
                              </Button>
                            </Link>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleLeave(group.id)}
                            >
                              <LogOut className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <Button
                            className="w-full"
                            size="sm"
                            onClick={() => handleJoin(group.id)}
                            disabled={group.memberCount >= group.maxMembers}
                          >
                            Join Group
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
    </div>
  );
}

