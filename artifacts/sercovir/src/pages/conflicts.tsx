import { useState } from "react";
import { Link } from "wouter";
import { useListConflicts, useGetConflictsSummary } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Crosshair, Flame, ShieldAlert, Thermometer, Clock } from "lucide-react";
import { format } from "date-fns";

export default function Conflicts() {
  const [status, setStatus] = useState<string>("all");
  const { data: conflicts, isLoading } = useListConflicts(status !== "all" ? { status: status as any } : {});
  const { data: summary } = useGetConflictsSummary();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-mono font-bold tracking-tight">ACTIVE CONFLICTS</h1>
          <p className="text-muted-foreground font-mono mt-1">Real-time tracking of geopolitical disputes and hostilities.</p>
        </div>
        
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[180px] font-mono">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ALL STATUSES</SelectItem>
            <SelectItem value="active">ACTIVE</SelectItem>
            <SelectItem value="escalating">ESCALATING</SelectItem>
            <SelectItem value="frozen">FROZEN</SelectItem>
            <SelectItem value="resolved">RESOLVED</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-card/50 border-border backdrop-blur-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-mono text-muted-foreground">TOTAL CONFLICTS</p>
                <p className="text-2xl font-mono font-bold">{summary.total}</p>
              </div>
              <Crosshair className="w-8 h-8 text-primary/20" />
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border backdrop-blur-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-mono text-muted-foreground">ESCALATING</p>
                <p className="text-2xl font-mono font-bold text-red-500">{summary.escalating}</p>
              </div>
              <Flame className="w-8 h-8 text-red-500/20" />
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border backdrop-blur-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-mono text-muted-foreground">CRITICAL SEVERITY</p>
                <p className="text-2xl font-mono font-bold text-orange-500">
                  {summary.bySeverity?.['critical'] || 0}
                </p>
              </div>
              <ShieldAlert className="w-8 h-8 text-orange-500/20" />
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border backdrop-blur-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-mono text-muted-foreground">TOTAL DISPLACED</p>
                <p className="text-2xl font-mono font-bold text-blue-500">
                  {summary.totalDisplaced ? (summary.totalDisplaced / 1000000).toFixed(1) + 'M' : '0'}
                </p>
              </div>
              <UsersIcon className="w-8 h-8 text-blue-500/20" />
            </CardContent>
          </Card>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {conflicts?.map((conflict) => (
            <Link key={conflict.id} href={`/conflicts/${conflict.id}`}>
              <Card className="cursor-pointer hover:border-primary/50 transition-colors bg-card/50 backdrop-blur-sm group">
                <CardContent className="p-0 flex flex-col md:flex-row">
                  <div className={`w-2 md:w-2 bg-${
                    conflict.severity === 'critical' ? 'red-500' :
                    conflict.severity === 'high' ? 'orange-500' :
                    conflict.severity === 'medium' ? 'yellow-500' : 'emerald-500'
                  } shrink-0`} />
                  
                  <div className="p-6 flex-1 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className={`font-mono uppercase
                          ${conflict.status === 'active' ? 'border-primary text-primary' :
                            conflict.status === 'escalating' ? 'border-red-500 text-red-500 animate-pulse' :
                            conflict.status === 'frozen' ? 'border-blue-500 text-blue-500' :
                            'border-emerald-500 text-emerald-500'}
                        `}>
                          {conflict.status}
                        </Badge>
                        <span className="text-xs font-mono text-muted-foreground">{conflict.region}</span>
                      </div>
                      
                      <h3 className="text-lg font-bold font-mono group-hover:text-primary transition-colors">
                        {conflict.title}
                      </h3>
                      
                      {conflict.partiesInvolved && (
                        <p className="text-sm font-mono text-muted-foreground truncate max-w-2xl">
                          Parties: {conflict.partiesInvolved.join(', ')}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex flex-row md:flex-col gap-4 md:gap-2 text-right">
                      <div className="flex items-center gap-2 md:justify-end text-sm font-mono">
                        <Thermometer className="w-4 h-4 text-muted-foreground" />
                        <span className={`uppercase ${
                          conflict.severity === 'critical' ? 'text-red-500 font-bold' :
                          conflict.severity === 'high' ? 'text-orange-500 font-bold' :
                          conflict.severity === 'medium' ? 'text-yellow-500' : 'text-emerald-500'
                        }`}>
                          {conflict.severity}
                        </span>
                      </div>
                      
                      {conflict.startDate && (
                        <div className="flex items-center gap-2 md:justify-end text-xs font-mono text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {format(new Date(conflict.startDate), 'MMM yyyy')}
                          {conflict.endDate ? ` - ${format(new Date(conflict.endDate), 'MMM yyyy')}` : ' - PRESENT'}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
          {(!conflicts || conflicts.length === 0) && (
            <div className="p-12 text-center border rounded-lg bg-card/50 backdrop-blur-sm border-dashed">
              <p className="text-muted-foreground font-mono">No conflicts found matching criteria.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function UsersIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}