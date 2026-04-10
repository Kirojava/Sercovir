import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Send, Zap, Shield, Globe, AlertTriangle, RefreshCw, ChevronRight, Loader2, Copy, Check, FileText, Target } from "lucide-react";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

interface StreamMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

const QUICK_PROMPTS = [
  { label: "Global Threat Brief", icon: Shield, query: "Generate today's global threat brief", endpoint: "/api/ai/threat-brief" },
  { label: "China Analysis", icon: Globe, query: "Analyze China's current geopolitical posture and Taiwan threat", endpoint: null },
  { label: "Russia Escalation Risk", icon: AlertTriangle, query: "Assess Russia's escalation risk over the next 30 days given the Ukraine conflict situation", endpoint: null },
  { label: "Iran Nuclear Breakout", icon: Target, query: "Provide a detailed assessment of Iran's nuclear breakout timeline and regional implications", endpoint: null },
  { label: "DPRK Threat Vector", icon: Zap, query: "Analyze North Korea's current military threat posture including ICBM and nuclear capabilities", endpoint: null },
  { label: "Cyber Threat Landscape", icon: Brain, query: "Summarize the current global cyber threat landscape, highlighting top APT groups and critical incidents in 2026", endpoint: null },
];

function MarkdownText({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-1.5 text-sm font-mono leading-relaxed">
      {lines.map((line, i) => {
        if (line.startsWith("## ")) {
          return <h3 key={i} className="text-primary font-bold text-sm mt-3 mb-1 border-b border-primary/20 pb-1">{line.replace("## ", "")}</h3>;
        }
        if (line.startsWith("# ")) {
          return <h2 key={i} className="text-primary font-bold text-base mt-4 mb-2">{line.replace("# ", "")}</h2>;
        }
        if (line.startsWith("- ") || line.startsWith("• ")) {
          return <div key={i} className="flex gap-2 ml-2"><span className="text-primary mt-0.5">▸</span><span className="flex-1" dangerouslySetInnerHTML={{ __html: formatInline(line.slice(2)) }} /></div>;
        }
        if (line.match(/^\d+\. /)) {
          const [num, ...rest] = line.split(". ");
          return <div key={i} className="flex gap-2 ml-2"><span className="text-primary font-bold w-4">{num}.</span><span className="flex-1" dangerouslySetInnerHTML={{ __html: formatInline(rest.join(". ")) }} /></div>;
        }
        if (line.trim() === "") return <div key={i} className="h-1" />;
        return <p key={i} dangerouslySetInnerHTML={{ __html: formatInline(line) }} />;
      })}
    </div>
  );
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatInline(text: string): string {
  return escapeHtml(text)
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-foreground font-bold">$1</strong>')
    .replace(/\[HIGH CONFIDENCE\]/g, '<span class="text-emerald-400 text-[10px] border border-emerald-400/30 bg-emerald-400/10 px-1 py-0.5 rounded">[HIGH CONFIDENCE]</span>')
    .replace(/\[MEDIUM CONFIDENCE\]/g, '<span class="text-yellow-400 text-[10px] border border-yellow-400/30 bg-yellow-400/10 px-1 py-0.5 rounded">[MEDIUM CONFIDENCE]</span>')
    .replace(/\[ASSESSED\]/g, '<span class="text-blue-400 text-[10px] border border-blue-400/30 bg-blue-400/10 px-1 py-0.5 rounded">[ASSESSED]</span>')
    .replace(/BLUF:/g, '<strong class="text-red-400">BLUF:</strong>');
}

export default function AiAnalyst() {
  const [messages, setMessages] = useState<StreamMessage[]>([
    {
      role: "assistant",
      content: "ARES SYSTEM ONLINE — Advanced Reconnaissance and Evaluation System\n\nI am connected to SERCOVIR's live intelligence database. I can analyze geopolitical threats, generate situation reports, assess escalation risks, and provide strategic intelligence briefings.\n\n**Current Alert Status:** Multiple critical indicators active as of April 2026. Use the quick prompts or ask me anything.",
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const streamResponse = useCallback(async (query: string, endpoint?: string | null) => {
    if (isStreaming) return;
    setIsStreaming(true);

    const userMsg: StreamMessage = { role: "user", content: query, timestamp: new Date() };
    const assistantMsg: StreamMessage = { role: "assistant", content: "", timestamp: new Date(), isStreaming: true };

    setMessages(prev => [...prev, userMsg, assistantMsg]);

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const url = endpoint ? `${BASE}${endpoint}` : `${BASE}/api/ai/analyze`;
      const body = endpoint ? {} : { query };
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: ctrl.signal,
      });

      const reader = resp.body?.getReader();
      if (!reader) throw new Error("No stream");
      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value);
        const lines = text.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                fullContent += data.content;
                setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { ...updated[updated.length - 1], content: fullContent };
                  return updated;
                });
              }
              if (data.done) break;
            } catch {}
          }
        }
      }

      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { ...updated[updated.length - 1], isStreaming: false };
        return updated;
      });
    } catch (err: unknown) {
      if ((err as Error)?.name !== "AbortError") {
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { ...updated[updated.length - 1], content: "⚠️ Analysis failed. Connection interrupted.", isStreaming: false };
          return updated;
        });
      }
    } finally {
      setIsStreaming(false);
    }
  }, [isStreaming]);

  const handleSend = () => {
    if (!input.trim() || isStreaming) return;
    const q = input.trim();
    setInput("");
    streamResponse(q);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyMessage = async (idx: number, content: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const stopStream = () => {
    abortRef.current?.abort();
    setIsStreaming(false);
    setMessages(prev => {
      const updated = [...prev];
      const last = updated[updated.length - 1];
      if (last.isStreaming) updated[updated.length - 1] = { ...last, isStreaming: false, content: last.content + "\n\n[Analysis interrupted]" };
      return updated;
    });
  };

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-3xl font-mono font-bold tracking-tight flex items-center gap-3">
            <Brain className="w-7 h-7 text-primary" />
            ARES AI ANALYST
          </h1>
          <p className="text-muted-foreground font-mono text-sm mt-1">
            Advanced Reconnaissance and Evaluation System · Powered by GPT-5 · Live Database Integration
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/10">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-xs text-emerald-400">ARES ONLINE</span>
          </div>
        </div>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        <div className="flex flex-col flex-1 min-h-0 gap-3">
          <div className="flex-1 overflow-y-auto bg-card/30 border border-border rounded-xl p-4 space-y-4 font-mono text-xs">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Brain className="w-3.5 h-3.5 text-primary" />
                  </div>
                )}
                <div className={`max-w-[85%] group relative ${msg.role === "user" ? "order-1" : "order-2"}`}>
                  <div className={`rounded-xl px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-primary/15 border border-primary/25 text-foreground"
                      : "bg-card/80 border border-border text-muted-foreground"
                  }`}>
                    {msg.role === "assistant" ? (
                      <MarkdownText text={msg.content} />
                    ) : (
                      <p className="font-mono text-sm">{msg.content}</p>
                    )}
                    {msg.isStreaming && (
                      <span className="inline-block w-1.5 h-3.5 bg-primary animate-pulse ml-0.5 align-middle" />
                    )}
                  </div>
                  {msg.role === "assistant" && msg.content && !msg.isStreaming && (
                    <button
                      onClick={() => copyMessage(idx, msg.content)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded bg-muted/50 hover:bg-muted border border-border"
                    >
                      {copiedIdx === idx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-muted-foreground" />}
                    </button>
                  )}
                  <p className="text-[10px] text-muted-foreground/50 mt-1 px-1">
                    {msg.timestamp.toLocaleTimeString()}
                  </p>
                </div>
                {msg.role === "user" && (
                  <div className="w-7 h-7 rounded-full bg-muted border border-border flex items-center justify-center flex-shrink-0 mt-0.5 order-2">
                    <span className="text-[10px] font-mono text-muted-foreground">OP</span>
                  </div>
                )}
              </div>
            ))}
            <div ref={endRef} />
          </div>

          <div className="flex-shrink-0 bg-card/50 border border-border rounded-xl p-3">
            <div className="flex gap-3">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask ARES anything… threat assessments, country analysis, conflict scenarios, prediction models…"
                className="flex-1 bg-transparent font-mono text-sm text-foreground placeholder:text-muted-foreground resize-none outline-none min-h-[52px] max-h-32"
                rows={2}
                disabled={isStreaming}
              />
              <div className="flex flex-col gap-2 justify-end">
                {isStreaming ? (
                  <button
                    onClick={stopStream}
                    className="px-3 py-2 rounded-lg bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30 transition-all font-mono text-xs"
                  >
                    STOP
                  </button>
                ) : (
                  <button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="px-3 py-2 rounded-lg bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 mt-2 pt-2 border-t border-border/50">
              <span className="text-[10px] font-mono text-muted-foreground">↵ Send · Shift+↵ Newline</span>
              <span className="ml-auto text-[10px] font-mono text-muted-foreground">GPT-5.2 · {isStreaming ? "🔴 Analyzing..." : "🟢 Ready"}</span>
            </div>
          </div>
        </div>

        <div className="w-56 flex-shrink-0 space-y-3">
          <Card className="bg-card/50 border-border">
            <CardHeader className="pb-2">
              <CardTitle className="font-mono text-xs text-muted-foreground">RAPID ANALYSIS</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {QUICK_PROMPTS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => streamResponse(p.query, p.endpoint)}
                  disabled={isStreaming}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg border border-border/50 bg-muted/20 hover:bg-muted/40 hover:border-primary/30 transition-all text-left disabled:opacity-40 disabled:cursor-not-allowed group"
                >
                  <p.icon className="w-3.5 h-3.5 text-primary/60 group-hover:text-primary shrink-0 transition-colors" />
                  <span className="font-mono text-[10px] text-muted-foreground group-hover:text-foreground">{p.label}</span>
                  <ChevronRight className="w-3 h-3 text-muted-foreground/30 ml-auto" />
                </button>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border">
            <CardHeader className="pb-2">
              <CardTitle className="font-mono text-xs text-muted-foreground">CAPABILITIES</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {[
                "Threat assessments",
                "Situation reports (SITREP)",
                "Escalation modeling",
                "Scenario analysis",
                "Actor profiling",
                "Economic intelligence",
                "Cyber threat analysis",
                "Nuclear risk assessment",
                "Predictive modeling",
                "Diplomatic analysis",
              ].map(cap => (
                <div key={cap} className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground">
                  <div className="w-1 h-1 rounded-full bg-primary/60" />
                  {cap}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-amber-500/20 border">
            <CardContent className="p-3">
              <p className="font-mono text-[10px] text-amber-400/80">
                ⚠️ ARES analysis is AI-generated. Verify critical intelligence through primary sources before action.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
