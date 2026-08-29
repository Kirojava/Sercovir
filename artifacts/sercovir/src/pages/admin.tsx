import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ClipboardList, LockKeyhole, ShieldCheck, SlidersHorizontal, Users, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CLEARANCE_LABELS, ROLE_LABELS, useAppAuth, useCurrentAccess, canModerate, type AccessUser } from "@/lib/auth";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";
const ROLES = ["OWNER", "ADMIN", "MODERATOR", "STAFF", "PREMIUM", "NORMAL"] as const;
const CLEARANCES = ["CL1", "CL2", "CL3", "CL4", "CL5"] as const;
type Stats = { users: number; threads: number; posts: number; openReports: number; channels: number };
type Report = { id: number; targetType: string; targetId: number; reason: string; status: string; createdAt: string; reporter: { displayName: string } };

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE}${path}`, { ...init, credentials: "include", headers: { "Content-Type": "application/json", ...(init?.headers || {}) } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data;
}

export default function Admin() {
  const { isSignedIn, isLoaded } = useAppAuth();
  const { data: user } = useCurrentAccess();
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<AccessUser[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [tab, setTab] = useState<"users" | "reports">("users");
  const [error, setError] = useState("");
  const load = async () => {
    try { const [overview, userData, reportData] = await Promise.all([api<Stats>("/api/admin/overview"), api<AccessUser[]>("/api/admin/users"), api<Report[]>("/api/admin/reports")]); setStats(overview); setUsers(userData); setReports(reportData); }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to load admin console"); }
  };
  useEffect(() => { if (isSignedIn && user && canModerate(user.role)) void load(); }, [isSignedIn, user]);

  if (!isLoaded) return <div className="kicker">Authenticating operator…</div>;
  if (!isSignedIn) return <Card className="mx-auto max-w-xl"><CardContent className="p-10 text-center"><LockKeyhole className="mx-auto mb-4 h-10 w-10 text-primary" /><h1 className="font-serif text-3xl">Admin console locked</h1><p className="mt-3 text-sm text-muted-foreground">Sign in with an authorized account to continue.</p><Button asChild className="mt-6"><Link href="/sign-in">Sign in</Link></Button></CardContent></Card>;
  if (!user || !["OWNER", "ADMIN"].includes(user.role)) return <Card className="mx-auto max-w-xl"><CardContent className="p-10 text-center"><ShieldCheck className="mx-auto mb-4 h-10 w-10 text-accent" /><h1 className="font-serif text-3xl">Admin clearance required</h1><p className="mt-3 text-sm text-muted-foreground">Staff can moderate reports, but only Admin and Owner accounts can change authorization or clearance levels.</p></CardContent></Card>;

  const updateUser = async (id: number, field: "role" | "clearanceLevel" | "status", value: string) => {
    try { const updated = await api<AccessUser>(`/api/admin/users/${id}`, { method: "PATCH", body: JSON.stringify({ [field]: value }) }); setUsers((current) => current.map((item) => item.id === id ? { ...item, ...updated } : item)); }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to update access"); }
  };
  const updateReport = async (id: number, status: string) => { try { await api(`/api/admin/reports/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }); await load(); } catch (e) { setError(e instanceof Error ? e.message : "Unable to update report"); } };

  const statCards: Array<[string, number | string, typeof Users]> = [["Active operators", stats?.users ?? "—", Users], ["Forum threads", stats?.threads ?? "—", ClipboardList], ["Forum posts", stats?.posts ?? "—", Users], ["Open reports", stats?.openReports ?? "—", ShieldCheck], ["Secure channels", stats?.channels ?? "—", LockKeyhole]];
  return <div className="space-y-8"><div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><div className="kicker">Administration / access control</div><h1 className="mt-3 font-serif text-4xl">Command governance</h1><p className="mt-2 max-w-2xl text-sm text-muted-foreground">Manage operator accounts, clearance boundaries, community health, and moderation reports from one auditable console.</p></div><Badge className="w-fit gap-2 bg-primary text-primary-foreground"><SlidersHorizontal className="h-3.5 w-3.5" /> {ROLE_LABELS[user.role]}</Badge></div>
    {error && <div className="border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}<button className="float-right" onClick={() => setError("")}><X className="h-4 w-4" /></button></div>}
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{statCards.map(([label, value, Icon]) => <Card key={label}><CardContent className="p-5"><Icon className="h-4 w-4 text-primary" /><div className="mt-4 font-mono text-2xl text-foreground">{value}</div><div className="mt-1 font-mono text-[9px] uppercase tracking-[.14em] text-muted-foreground">{label}</div></CardContent></Card>)}</div>
    <Card><CardHeader className="border-b border-border/60"><div className="flex flex-wrap items-center justify-between gap-3"><CardTitle className="font-serif text-xl">{tab === "users" ? "Operator access registry" : "Moderation queue"}</CardTitle><div className="flex gap-2"><Button size="sm" variant={tab === "users" ? "default" : "outline"} onClick={() => setTab("users")}>Users</Button><Button size="sm" variant={tab === "reports" ? "default" : "outline"} onClick={() => setTab("reports")}>Reports {stats?.openReports ? `(${stats.openReports})` : ""}</Button></div></div></CardHeader>{tab === "users" ? <CardContent className="p-0"><div className="hidden grid-cols-[1.3fr_1fr_180px_180px_140px] gap-4 border-b border-border/60 px-5 py-3 font-mono text-[9px] uppercase tracking-[.14em] text-muted-foreground md:grid"><span>Operator</span><span>Status</span><span>Authorization</span><span>Clearance</span><span>Account</span></div>{users.map((item) => <div key={item.id} className="grid gap-3 border-b border-border/50 px-5 py-4 md:grid-cols-[1.3fr_1fr_180px_180px_140px] md:items-center"><div><div className="font-medium">{item.displayName}</div><div className="font-mono text-[10px] text-muted-foreground">{item.email || "Clerk identity linked"}</div></div><Badge variant={item.status === "ACTIVE" ? "outline" : "destructive"} className="w-fit">{item.status}</Badge><select disabled={item.id === user.id} value={item.role} onChange={(e) => updateUser(item.id, "role", e.target.value)} className="h-9 rounded-md border border-input bg-transparent px-2 text-sm">{ROLES.map((role) => <option key={role} value={role}>{ROLE_LABELS[role]}</option>)}</select><select value={item.clearanceLevel} onChange={(e) => updateUser(item.id, "clearanceLevel", e.target.value)} className="h-9 rounded-md border border-input bg-transparent px-2 text-sm">{CLEARANCES.map((level) => <option key={level} value={level}>{CLEARANCE_LABELS[level]}</option>)}</select><select disabled={item.id === user.id} value={item.status} onChange={(e) => updateUser(item.id, "status", e.target.value)} className="h-9 rounded-md border border-input bg-transparent px-2 text-sm"><option value="ACTIVE">Active</option><option value="SUSPENDED">Suspended</option><option value="BANNED">Banned</option></select></div>)}</CardContent> : <CardContent className="p-0">{reports.length ? reports.map((report) => <div key={report.id} className="flex flex-col justify-between gap-4 border-b border-border/50 px-5 py-5 md:flex-row md:items-center"><div><div className="mb-2 flex items-center gap-2"><Badge variant="outline">{report.status}</Badge><span className="font-mono text-[10px] uppercase text-muted-foreground">{report.targetType} #{report.targetId}</span></div><p className="text-sm">{report.reason}</p><p className="mt-2 font-mono text-[10px] text-muted-foreground">Reported by {report.reporter.displayName} · {new Date(report.createdAt).toLocaleString()}</p></div><div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => updateReport(report.id, "DISMISSED")}>Dismiss</Button><Button size="sm" onClick={() => updateReport(report.id, "RESOLVED")}>Resolve</Button></div></div>) : <div className="p-12 text-center text-sm text-muted-foreground">No moderation reports. The network is clear.</div>}</CardContent>}</Card>
  </div>;
}