"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Trophy, Medal, Award, User } from "lucide-react";
import { useSession } from "next-auth/react";

interface LeaderboardEntry {
  id: string;
  user: {
    id: string;
    name?: string;
    email: string;
  };
  score: number;
  rank: number;
  metadata?: {
    testsTaken?: number;
    avgAccuracy?: number;
  };
}

export default function LeaderboardPage() {
  const { data: session } = useSession();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("weekly");
  const [exam, setExam] = useState("");

  useEffect(() => {
    fetchLeaderboard();
  }, [period, exam]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        period,
        ...(exam && { exam }),
      });
      const res = await fetch(`/api/leaderboard?${params}`);
      if (res.ok) {
        const data = await res.json();
        setEntries(data.entries || []);
        setUserRank(data.userRank);
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Medal className="h-6 w-6 text-amber-600" />;
    return <Award className="h-5 w-5 text-muted-foreground" />;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200";
    if (rank === 2) return "bg-gray-50 dark:bg-gray-800 border-gray-200";
    if (rank === 3) return "bg-amber-50 dark:bg-amber-900/20 border-amber-200";
    return "";
  };

  return (
    <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Leaderboard
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Compete with other aspirants and track your ranking
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Period</label>
                <Select value={period} onChange={(e) => setPeriod(e.target.value)}>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="all-time">All Time</option>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Exam (Optional)</label>
                <Select value={exam} onChange={(e) => setExam(e.target.value)}>
                  <option value="">All Exams</option>
                  <option value="UPSC">UPSC</option>
                  <option value="SSC">SSC</option>
                  <option value="Banking">Banking</option>
                  <option value="Railway">Railway</option>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Rank */}
        {userRank && (
          <Card className="border-primary">
            <CardHeader>
              <CardTitle>Your Rank</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-3xl font-bold text-primary">
                    #{userRank.rank}
                  </div>
                  <div>
                    <p className="font-semibold">
                      {userRank.user.name || userRank.user.email}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Score: {userRank.score}
                    </p>
                    {userRank.metadata && (
                      <p className="text-xs text-muted-foreground">
                        {userRank.metadata.testsTaken} tests •{" "}
                        {userRank.metadata.avgAccuracy?.toFixed(1)}% avg accuracy
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
            <CardDescription>
              Rankings based on test performance and accuracy
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading leaderboard...</div>
            ) : entries.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No entries yet. Take some tests to appear on the leaderboard!
              </div>
            ) : (
              <div className="space-y-2">
                {entries.map((entry) => {
                  const isCurrentUser = entry.user.id === session?.user?.id;
                  return (
                    <div
                      key={entry.id}
                      className={`flex items-center justify-between p-4 border rounded-lg ${
                        getRankColor(entry.rank)
                      } ${isCurrentUser ? "ring-2 ring-primary" : ""}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-12">
                          {getRankIcon(entry.rank)}
                        </div>
                        <div className="text-2xl font-bold text-muted-foreground w-8">
                          {entry.rank}
                        </div>
                        <div>
                          <p className="font-semibold">
                            {entry.user.name || entry.user.email}
                            {isCurrentUser && (
                              <span className="ml-2 text-xs text-primary">
                                (You)
                              </span>
                            )}
                          </p>
                          {entry.metadata && (
                            <p className="text-sm text-muted-foreground">
                              {entry.metadata.testsTaken} tests •{" "}
                              {entry.metadata.avgAccuracy?.toFixed(1)}% accuracy
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{entry.score}</p>
                        <p className="text-xs text-muted-foreground">points</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
    </div>
  );
}

