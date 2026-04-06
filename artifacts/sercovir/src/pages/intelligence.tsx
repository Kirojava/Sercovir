import { useGetIntelligenceFeed } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioTower, AlertTriangle, Info, Bell, FileText, Database } from "lucide-react";
import { format } from "date-fns";

export default function Intelligence() {
  const { data: feed, isLoading } = useGetIntelligenceFeed();

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'alert': return AlertTriangle;
      case 'warning': return Bell;
      case 'assessment': return Database;
      case 'report': return FileText;
      default: return Info;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-3xl font-mono font-bold tracking-tight">INTELLIGENCE FEED</h1>
          <p className="text-muted-foreground font-mono mt-1">Classified updates, alerts, and situational assessments.</p>
        </div>
      </div>

      <div className="flex-1 bg-card/50 border border-border rounded-lg backdrop-blur-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between font-mono text-sm">
          <span className="flex items-center gap-2 text-muted-foreground">
            <RadioTower className="w-4 h-4" /> LIVE FEED
          </span>
          <span className="text-emerald-500 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> RECEIVING
          </span>
        </div>
        
        <ScrollArea className="flex-1 p-6">
          {isLoading ? (
            <div className="space-y-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="w-12 h-12 rounded shrink-0" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : feed && feed.length > 0 ? (
            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
              {feed.map((item, i) => {
                const Icon = getCategoryIcon(item.category);
                return (
                  <div key={item.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full border border-background bg-muted text-muted-foreground shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                      <Icon className="w-3 h-3" />
                    </div>
                    
                    <Card className={`w-[calc(100%-2.5rem)] md:w-[calc(50%-2rem)] bg-card border-border shadow-sm
                      ${item.priority === 'critical' ? 'border-red-500/30 bg-red-500/5' :
                        item.priority === 'high' ? 'border-orange-500/30 bg-orange-500/5' :
                        ''}
                    `}>
                      <CardContent className="p-4 space-y-3">
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex gap-2 items-center flex-wrap">
                            <Badge variant="outline" className={`font-mono text-[10px] uppercase
                              ${item.priority === 'critical' ? 'border-red-500 text-red-500' :
                                item.priority === 'high' ? 'border-orange-500 text-orange-500' :
                                item.priority === 'medium' ? 'border-yellow-500 text-yellow-500' :
                                'border-primary text-primary'}
                            `}>
                              {item.priority}
                            </Badge>
                            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                              {item.category}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                            {format(new Date(item.timestamp), "HH:mm:ss 'Z'")}
                          </span>
                        </div>
                        
                        <div>
                          <h4 className="font-mono font-bold text-sm mb-1 group-hover:text-primary transition-colors">
                            {item.title}
                          </h4>
                          <p className="text-sm text-muted-foreground/90 font-mono leading-relaxed whitespace-pre-wrap">
                            {item.content}
                          </p>
                        </div>
                        
                        {(item.relatedCountries?.length || item.relatedConflicts?.length || item.source) && (
                          <div className="pt-3 border-t border-border/50 text-[10px] font-mono text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
                            {item.source && <span>SRC: {item.source}</span>}
                            {item.relatedCountries && item.relatedCountries.length > 0 && (
                              <span>TGT: {item.relatedCountries.join(', ')}</span>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground font-mono">
              No recent intelligence briefings.
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}