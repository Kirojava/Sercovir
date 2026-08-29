import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@clerk/react";
import { MessageSquare, Plus, Radio, RefreshCw, Send, Shield, Users, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CLEARANCE_LABELS, ROLE_LABELS, useCurrentAccess } from "@/lib/auth";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";
type Category = { id: number; name: string; description: string | null; threadCount: number };
type Thread = { id: number; categoryId: number; title: string; body: string; secrecyLevel: string; isPinned: boolean; viewCount: number; createdAt: string; category: { name: string }; author: { displayName: string; role: string; clearanceLevel: string } };
type Channel = { id: number; name: string; description: string | null; minClearanceLevel: string };
type ChatMessage = { id: number; content: string; createdAt: string; author: { displayName: string; role: string } };

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE}${path}`, { ...init, credentials: "include", headers: { "Content-Type": "application/json", ...(init?.headers || {}) } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data;
}

function SignInPrompt() {
  return <Card className="mx-auto max-w-2xl border-primary/30 bg-card/80"><CardContent className="p-10 text-center"><Shield className="mx-auto mb-4 h-10 w-10 text-primary" /><div className="kicker">Operator access required</div><h1 className="mt-3 font-serif text-3xl">Join the discussion layer</h1><p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground">Sign in to access forums, secure channels, and moderated operator conversations.</p><div className="mt-7 flex justify-center gap-3"><Button asChild><Link href="/sign-in">Sign in</Link></Button><Button variant="outline" asChild><Link href="/sign-up">Create account</Link></Button></div></CardContent></Card>;
}

export default function Community() {
  const { isSignedIn, isLoaded } = useAuth();
  const { data: user } = useCurrentAccess();
  const [categories, setCategories] = useState<Category[]>([]);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [activeChannel, setActiveChannel] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [chatText, setChatText] = useState("");
  const [showComposer, setShowComposer] = useState(false);
  const [threadTitle, setThreadTitle] = useState("");
  const [threadBody, setThreadBody] = useState("");
  const [threadCategory, setThreadCategory] = useState("");
  const [threadClearance, setThreadClearance] = useState("CL5");
  const [error, setError] = useState("");
  const clearanceOptions = useMemo(() => ["CL1", "CL2", "CL3", "CL4", "CL5"].filter((level) => !user || ["OWNER", "ADMIN", "MODERATOR", "STAFF"].includes(user.role) || Number(level.slice(2)) >= Number(user.clearanceLevel.slice(2))), [user]);

  const load = async () => {
    try {
      const [categoryData, threadData, channelData] = await Promise.all([api<Category[]>("/api/community/categories"), api<Thread[]>(`/api/community/threads?${activeCategory ? `categoryId=${activeCategory}&` : ""}${search ? `search=${encodeURIComponent(search)}` : ""}`), api<Channel[]>("/api/community/channels")]);
      setCategories(categoryData); setThreads(threadData); setChannels(channelData);
      if (!activeChannel && channelData[0]) setActiveChannel(channelData[0].id);
      if (!threadCategory && categoryData[0]) setThreadCategory(String(categoryData[0].id));
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to load community"); }
  };
  useEffect(() => { if (isSignedIn) void load(); }, [isSignedIn, activeCategory, search]);
  useEffect(() => {
    if (!activeChannel || !isSignedIn) return;
    const refresh = () => api<ChatMessage[]>(`/api/community/channels/${activeChannel}/messages`).then(setMessages).catch(() => undefined);
    void refresh();
    const timer = window.setInterval(refresh, 8000);
    return () => window.clearInterval(timer);
  }, [activeChannel, isSignedIn]);

  if (!isLoaded) return <div className="kicker">Authenticating operator…</div>;
  if (!isSignedIn) return <SignInPrompt />;

  const createThread = async (event: React.FormEvent) => {
    event.preventDefault(); setError("");
    try { await api("/api/community/threads", { method: "POST", body: JSON.stringify({ categoryId: Number(threadCategory), title: threadTitle, body: threadBody, secrecyLevel: threadClearance }) }); setThreadTitle(""); setThreadBody(""); setShowComposer(false); await load(); }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to publish thread"); }
  };
  const sendMessage = async (event: React.FormEvent) => {
    event.preventDefault(); if (!chatText.trim() || !activeChannel) return;
    try { await api(`/api/community/channels/${activeChannel}/messages`, { method: "POST", body: JSON.stringify({ content: chatText }) }); setChatText(""); const next = await api<ChatMessage[]>(`/api/community/channels/${activeChannel}/messages`); setMessages(next); }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to send message"); }
  };

  return <div className="space-y-8">
    <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><div className="kicker">Community / moderated network</div><h1 className="mt-3 font-serif text-4xl tracking-tight">Operator Commons</h1><p className="mt-2 max-w-2xl text-sm text-muted-foreground">Discuss sources, coordinate committee work, and exchange links in clearance-aware channels. Every report and moderation action is auditable.</p></div><div className="flex items-center gap-2"><Badge variant="outline" className="gap-2 border-primary/40 text-primary"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />{ROLE_LABELS[user?.role ?? "NORMAL"]}</Badge><Badge variant="outline" className="border-accent/40 text-accent">{CLEARANCE_LABELS[user?.clearanceLevel ?? "CL5"]}</Badge></div></div>
    {error && <div className="border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}<button className="float-right" onClick={() => setError("")}><X className="h-4 w-4" /></button></div>}
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
      <Card className="overflow-hidden"><CardHeader className="border-b border-border/60 pb-4"><div className="flex flex-wrap items-center justify-between gap-3"><CardTitle className="flex items-center gap-2 font-serif text-xl"><MessageSquare className="h-5 w-5 text-primary" /> Forum intelligence</CardTitle><div className="flex gap-2"><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search threads…" className="h-9 w-44" /><Button size="sm" onClick={() => setShowComposer((current) => !current)}><Plus className="h-4 w-4" /> New thread</Button></div></div><div className="mt-4 flex gap-2 overflow-x-auto pb-1"><Button size="sm" variant={activeCategory === null ? "default" : "outline"} onClick={() => setActiveCategory(null)}>All signals</Button>{categories.map((category) => <Button key={category.id} size="sm" variant={activeCategory === category.id ? "default" : "outline"} onClick={() => setActiveCategory(category.id)}>{category.name}<span className="ml-1 text-[10px] opacity-60">{category.threadCount}</span></Button>)}</div></CardHeader>
        {showComposer && <form onSubmit={createThread} className="border-b border-primary/20 bg-primary/[.04] p-5"><div className="mb-3 flex items-center justify-between"><div className="kicker text-primary">Publish a moderated signal</div><button type="button" onClick={() => setShowComposer(false)}><X className="h-4 w-4 text-muted-foreground" /></button></div><div className="grid gap-3 md:grid-cols-[1fr_220px]"><Input value={threadTitle} onChange={(e) => setThreadTitle(e.target.value)} placeholder="Thread title" required minLength={4} /><select value={threadCategory} onChange={(e) => setThreadCategory(e.target.value)} className="h-9 rounded-md border border-input bg-transparent px-3 text-sm">{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></div><Textarea value={threadBody} onChange={(e) => setThreadBody(e.target.value)} placeholder="Share the context, source, or question…" className="mt-3 min-h-28" required minLength={10} /><div className="mt-3 flex flex-wrap items-center justify-between gap-3"><select value={threadClearance} onChange={(e) => setThreadClearance(e.target.value)} className="h-9 rounded-md border border-input bg-transparent px-3 text-sm">{clearanceOptions.map((level) => <option key={level} value={level}>{CLEARANCE_LABELS[level as keyof typeof CLEARANCE_LABELS]}</option>)}</select><Button type="submit">Publish signal</Button></div></form>}
        <CardContent className="p-0">{threads.length ? threads.map((thread) => <div key={thread.id} className="group border-b border-border/50 p-5 transition-colors hover:bg-primary/[.035]"><div className="flex items-start justify-between gap-4"><div className="min-w-0"><div className="mb-2 flex flex-wrap items-center gap-2"><span className="font-mono text-[9px] uppercase tracking-[.14em] text-primary">{thread.category.name}</span>{thread.isPinned && <Badge variant="outline" className="text-[9px]">Pinned</Badge>}<Badge variant="outline" className="text-[9px] text-accent">{thread.secrecyLevel}</Badge></div><h3 className="font-serif text-xl leading-tight group-hover:text-primary">{thread.title}</h3><p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{thread.body}</p></div><span className="hidden shrink-0 items-center gap-1 font-mono text-[10px] text-muted-foreground sm:flex"><Users className="h-3.5 w-3.5" /> {thread.viewCount}</span></div><div className="mt-4 flex items-center justify-between font-mono text-[9px] uppercase tracking-wide text-muted-foreground"><span>{thread.author.displayName} · {thread.author.role}</span><span>{new Date(thread.createdAt).toLocaleDateString()}</span></div></div>) : <div className="p-12 text-center text-sm text-muted-foreground"><Radio className="mx-auto mb-3 h-7 w-7 text-primary/60" />No signals match this filter.</div>}</CardContent>
      </Card>
      <Card className="flex min-h-[560px] flex-col overflow-hidden"><CardHeader className="border-b border-border/60 pb-4"><CardTitle className="flex items-center gap-2 font-serif text-xl"><Radio className="h-5 w-5 text-accent" /> Secure channels</CardTitle><div className="mt-3 flex gap-2 overflow-x-auto">{channels.map((channel) => <Button key={channel.id} size="sm" variant={activeChannel === channel.id ? "default" : "outline"} onClick={() => setActiveChannel(channel.id)}>{channel.name}</Button>)}</div></CardHeader><CardContent className="flex flex-1 flex-col p-0">{activeChannel ? <><div className="quiet-scrollbar flex-1 space-y-3 overflow-y-auto p-4">{messages.length ? messages.map((message) => <div key={message.id} className="rounded-lg border border-border/50 bg-background/30 p-3"><div className="mb-1 flex justify-between gap-2 font-mono text-[9px] uppercase tracking-wide"><span className="text-primary">{message.author.displayName}</span><span className="text-muted-foreground">{new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span></div><p className="text-sm leading-5">{message.content}</p></div>) : <div className="py-16 text-center text-sm text-muted-foreground">No messages yet. Start the channel.</div>}</div><form onSubmit={sendMessage} className="flex gap-2 border-t border-border/60 p-3"><Input value={chatText} onChange={(e) => setChatText(e.target.value)} placeholder="Drop a note or link…" /><Button type="submit" size="icon" aria-label="Send message"><Send className="h-4 w-4" /></Button></form></> : <div className="p-8 text-center text-sm text-muted-foreground">Select a channel.</div>}</CardContent></Card>
    </div>
    <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.14em] text-muted-foreground"><RefreshCw className="h-3.5 w-3.5" /> Chat refreshes every 8 seconds · Report harmful content to staff via moderation controls</div>
  </div>;
}