import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { GameMode, TimeFilter, LeaderboardEntry } from "@/types/game";
import { useAuth } from "@/contexts/AuthContext";
import * as api from "@/services/api";

const TIME_FILTERS: { label: string; value: TimeFilter }[] = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "All-Time", value: "all-time" },
];

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [mode, setMode] = useState<GameMode>("walls");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all-time");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getLeaderboard(mode, timeFilter).then((data) => {
      setEntries(data);
      setLoading(false);
    });
  }, [mode, timeFilter]);

  return (
    <main className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 font-display text-3xl font-bold text-primary text-glow-green">Leaderboard</h1>

      <Tabs value={mode} onValueChange={(v) => setMode(v as GameMode)}>
        <TabsList className="mb-4 bg-secondary">
          <TabsTrigger value="walls" className="font-display data-[state=active]:text-primary">🧱 Walls</TabsTrigger>
          <TabsTrigger value="pass-through" className="font-display data-[state=active]:text-neon-purple">🌀 Pass-Through</TabsTrigger>
        </TabsList>

        <div className="mb-4 flex gap-2">
          {TIME_FILTERS.map((f) => (
            <Button
              key={f.value}
              size="sm"
              variant={timeFilter === f.value ? "default" : "outline"}
              onClick={() => setTimeFilter(f.value)}
              className={timeFilter === f.value ? "box-glow-green" : ""}
            >
              {f.label}
            </Button>
          ))}
        </div>

        <TabsContent value={mode}>
          {loading ? (
            <p className="py-8 text-center text-muted-foreground">Loading...</p>
          ) : entries.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No scores yet for this filter.</p>
          ) : (
            <div className="rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">#</TableHead>
                    <TableHead>Player</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                    <TableHead className="hidden text-right sm:table-cell">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((e) => (
                    <TableRow
                      key={e.id}
                      className={user && e.userId === user.id ? "bg-primary/10" : ""}
                    >
                      <TableCell className="font-display font-bold">
                        {e.rank <= 3 ? ["🥇", "🥈", "🥉"][e.rank - 1] : e.rank}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {e.username}
                        {user && e.userId === user.id && (
                          <span className="ml-2 text-xs text-primary">(you)</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-display font-bold text-primary">{e.score}</TableCell>
                      <TableCell className="hidden text-right text-sm text-muted-foreground sm:table-cell">
                        {new Date(e.date).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </main>
  );
}
