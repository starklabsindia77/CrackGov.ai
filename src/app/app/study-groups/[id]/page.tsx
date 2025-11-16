"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Users, Send, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface GroupPost {
  id: string;
  authorId: string;
  content: string;
  createdAt: string;
}

interface StudyGroup {
  id: string;
  name: string;
  description?: string;
  exam?: string;
  isPublic: boolean;
  memberCount: number;
  isMember: boolean;
  members: Array<{
    user: {
      id: string;
      name?: string;
      email: string;
    };
    role: string;
  }>;
}

export default function StudyGroupPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.id as string;
  const [group, setGroup] = useState<StudyGroup | null>(null);
  const [posts, setPosts] = useState<GroupPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [postContent, setPostContent] = useState("");

  useEffect(() => {
    fetchGroup();
    fetchPosts();
  }, [groupId]);

  const fetchGroup = async () => {
    try {
      const res = await fetch(`/api/study-groups/${groupId}`);
      if (res.ok) {
        const data = await res.json();
        setGroup(data.group);
      }
    } catch (error) {
      console.error("Error fetching group:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      const res = await fetch(`/api/study-groups/${groupId}/posts`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim()) return;

    try {
      const res = await fetch(`/api/study-groups/${groupId}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: postContent }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to post");
      }

      toast.success("Posted!");
      setPostContent("");
      fetchPosts();
    } catch (error: any) {
      toast.error(error.message || "Failed to post");
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="text-center py-8">Loading...</div>
      </AppLayout>
    );
  }

  if (!group) {
    return (
      <AppLayout>
        <div className="text-center py-8">Group not found</div>
      </AppLayout>
    );
  }

  if (!group.isMember) {
    return (
      <AppLayout>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              You need to join this group to view it
            </p>
            <Link href="/app/study-groups">
              <Button>Back to Groups</Button>
            </Link>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/app/study-groups">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{group.name}</h1>
            {group.description && (
              <p className="text-muted-foreground mt-1">{group.description}</p>
            )}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-4">
            {/* Post Form */}
            <Card>
              <CardContent className="pt-6">
                <form onSubmit={handlePost} className="space-y-4">
                  <Textarea
                    placeholder="Share something with the group..."
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    rows={3}
                  />
                  <Button type="submit" className="w-full">
                    <Send className="h-4 w-4 mr-2" />
                    Post
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Posts */}
            <div className="space-y-4">
              {posts.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    No posts yet. Be the first to post!
                  </CardContent>
                </Card>
              ) : (
                posts.map((post) => (
                  <Card key={post.id}>
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          {new Date(post.createdAt).toLocaleString()}
                        </p>
                        <p className="whitespace-pre-wrap">{post.content}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Members
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {group.members.slice(0, 10).map((member) => (
                    <div key={member.user.id} className="flex justify-between items-center">
                      <span className="text-sm">
                        {member.user.name || member.user.email}
                      </span>
                      {member.role === "admin" && (
                        <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">
                          Admin
                        </span>
                      )}
                    </div>
                  ))}
                  {group.members.length > 10 && (
                    <p className="text-xs text-muted-foreground text-center">
                      +{group.members.length - 10} more
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {group.exam && (
              <Card>
                <CardHeader>
                  <CardTitle>Group Info</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm space-y-1">
                    <p>
                      <strong>Exam:</strong> {group.exam}
                    </p>
                    <p>
                      <strong>Members:</strong> {group.memberCount}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

