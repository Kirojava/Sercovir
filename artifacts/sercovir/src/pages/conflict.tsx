import { useRoute } from "wouter";
import { useGetConflict, getGetConflictQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Flame, ShieldAlert, Crosshair, Users, Activity, FileText, Clock } from "lucide-react";
import { format } from "date-fns";

export default function ConflictDetail() {
  const [match, params] = useRoute("/conflicts/:id");
  const id = params?.id ? parseInt(params.id, 10) : 0;
  
  const { data: conflict, isLoading } = useGetConflict(id, {
    query: { enabled: !!id, queryKey: getGetConflictQueryKey(id) }
  });

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  if (!conflict) return null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className={`font-mono uppercase text-sm
              ${conflict.status === 'active' ? 'border-primary text-primary' :
                conflict.status === 'escalating' ? 'border-red-500 text-red-500 animate-pulse' :
                conflict.status === 'frozen' ? 'border-blue-500 text-blue-500' :
                'border-emerald-500 text-emerald-500'}
            `}>
              {conflict.status}
            </Badge>
            <span className="text-muted-foreground font-mono">{conflict.region}</span>
          </div>
          <h1 className="text-4xl font-mono font-bold tracking-tight">{conflict.title}</h1>
        </div>

        <div className={`px-6 py-4 rounded-md border flex flex-col items-end gap-1 font-mono
          ${conflict.severity === 'critical' ? 'bg-red-500/10 border-red-500/50' : 
            conflict.severity === 'high' ? 'bg-orange-500/10 border-orange-500/50' : 
            conflict.severity === 'medium' ? 'bg-yellow-500/10 border-yellow-500/50' : 
            'bg-emerald-500/10 border-emerald-500/50'}
        `}>
          <span className="text-[10px] opacity-80 leading-none">SEVERITY</span>
          <span className={`text-xl font-bold uppercase
            ${conflict.severity === 'critical' ? 'text-red-500' : 
              conflict.severity === 'high' ? 'text-orange-500' : 
              conflict.severity === 'medium' ? 'text-yellow-500' : 
              'text-emerald-500'}
          `}>
            {conflict.severity}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="bg-card/50 backdrop-blur-sm border-border">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="font-mono text-sm flex items-center gap-2 text-primary">
                <FileText className="w-4 h-4" />
                SITUATION REPORT
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-sm font-mono leading-relaxed text-muted-foreground whitespace-pre-wrap">
                {conflict.description || 'No detailed description available.'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="font-mono text-sm flex items-center gap-2 text-primary">
                <ShieldAlert className="w-4 h-4" />
                PARTIES INVOLVED
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {conflict.partiesInvolved && conflict.partiesInvolved.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {conflict.partiesInvolved.map(party => (
                    <Badge key={party} variant="secondary" className="px-3 py-1 font-mono text-sm bg-muted/50 border-border">
                      {party}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm font-mono text-muted-foreground">Unknown parties.</p>
              )}
            </CardContent>
          </Card>
          
          {conflict.notes && (
            <Card className="bg-card/50 backdrop-blur-sm border-border">
              <CardHeader className="border-b border-border/50 pb-4">
                <CardTitle className="font-mono text-sm flex items-center gap-2 text-primary">
                  <Activity className="w-4 h-4" />
                  INTELLIGENCE NOTES
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-sm font-mono leading-relaxed text-muted-foreground whitespace-pre-wrap">
                  {conflict.notes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="bg-card/50 backdrop-blur-sm border-border">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="font-mono text-sm flex items-center gap-2 text-primary">
                <Crosshair className="w-4 h-4" />
                IMPACT DATA
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-mono text-muted-foreground">ESTIMATED CASUALTIES</span>
                <p className="text-3xl font-mono font-bold text-red-500">
                  {conflict.casualties?.toLocaleString() || 'UNKNOWN'}
                </p>
              </div>
              <div className="space-y-2">
                <span className="text-xs font-mono text-muted-foreground">DISPLACED PERSONS</span>
                <p className="text-3xl font-mono font-bold text-orange-500">
                  {conflict.displacedPersons?.toLocaleString() || 'UNKNOWN'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="font-mono text-sm flex items-center gap-2 text-primary">
                <Clock className="w-4 h-4" />
                TIMELINE
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="relative pl-6 border-l border-border space-y-6">
                {conflict.startDate && (
                  <div className="relative">
                    <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-primary" />
                    <span className="text-xs font-mono text-muted-foreground mb-1 block">START DATE</span>
                    <p className="font-mono">{format(new Date(conflict.startDate), 'MMMM d, yyyy')}</p>
                  </div>
                )}
                
                <div className="relative">
                  <div className={`absolute -left-[31px] top-1 w-3 h-3 rounded-full ${conflict.endDate ? 'bg-muted-foreground' : 'bg-red-500 animate-pulse'}`} />
                  <span className="text-xs font-mono text-muted-foreground mb-1 block">STATUS</span>
                  <p className="font-mono">
                    {conflict.endDate ? format(new Date(conflict.endDate), 'MMMM d, yyyy') : 'ONGOING'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}