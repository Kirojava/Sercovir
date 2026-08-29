import { useRoute } from "wouter";
import { useGetCommittee, getGetCommitteeQueryKey, useListDelegates, useListResolutions } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, FileText, Info, Award } from "lucide-react";
import { Link } from "wouter";

export default function CommitteeDetail() {
  const [match, params] = useRoute("/committees/:id");
  const id = params?.id ? parseInt(params.id, 10) : 0;
  
  const { data: committee, isLoading } = useGetCommittee(id, {
    query: { enabled: !!id, queryKey: getGetCommitteeQueryKey(id) }
  });

  const { data: delegates, isLoading: delegatesLoading } = useListDelegates({ committeeId: id }, {
    query: { enabled: !!id, queryKey: [`/api/committees/${id}/delegates`] }
  });

  const { data: resolutions, isLoading: resolutionsLoading } = useListResolutions({ committeeId: id }, {
    query: { enabled: !!id, queryKey: [`/api/resolutions?committeeId=${id}`] }
  });

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  if (!committee) return null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className={`font-mono text-sm
              ${committee.status === 'active' ? 'border-primary text-primary bg-primary/5' : 
                committee.status === 'upcoming' ? 'border-yellow-500 text-yellow-500 bg-yellow-500/5' : 
                'border-muted-foreground text-muted-foreground'}
            `}>
              {committee.status.toUpperCase()}
            </Badge>
            <span className="text-xl font-mono text-muted-foreground font-bold tracking-widest">{committee.abbreviation}</span>
          </div>
          <h1 className="text-4xl font-mono font-bold tracking-tight">{committee.name}</h1>
          <p className="text-lg font-mono text-primary mt-2">Topic: {committee.topic}</p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-muted/50 border border-border">
          <TabsTrigger value="overview" className="font-mono">OVERVIEW</TabsTrigger>
          <TabsTrigger value="delegates" className="font-mono">DELEGATES ({delegates?.length || 0})</TabsTrigger>
          <TabsTrigger value="resolutions" className="font-mono">RESOLUTIONS ({resolutions?.length || 0})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6 mt-6">
          <Card className="bg-card/50 backdrop-blur-sm border-border">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="font-mono text-sm flex items-center gap-2 text-primary">
                <Info className="w-4 h-4" />
                COMMITTEE BRIEFING
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-sm font-mono leading-relaxed text-muted-foreground whitespace-pre-wrap">
                {committee.description || 'No detailed briefing available.'}
              </p>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-card/50 backdrop-blur-sm border-border">
              <CardHeader className="border-b border-border/50 pb-4">
                <CardTitle className="font-mono text-sm flex items-center gap-2 text-primary">
                  <Award className="w-4 h-4" />
                  CHAIRPERSON
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="font-mono text-lg">{committee.chairperson || 'TBD'}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-card/50 backdrop-blur-sm border-border">
              <CardHeader className="border-b border-border/50 pb-4">
                <CardTitle className="font-mono text-sm flex items-center gap-2 text-primary">
                  <Users className="w-4 h-4" />
                  SESSION INFO
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="font-mono text-lg">{committee.session || 'TBD'}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="delegates" className="mt-6">
          <Card className="bg-card/50 backdrop-blur-sm border-border">
            <CardContent className="p-0">
              {delegatesLoading ? (
                <div className="p-8 space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : delegates && delegates.length > 0 ? (
                <div className="divide-y divide-border/50">
                  {delegates.map(delegate => (
                    <div key={delegate.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                      <div className="space-y-1">
                        <p className="font-mono font-bold text-lg">{delegate.country}</p>
                        <p className="font-mono text-sm text-muted-foreground">{delegate.name}</p>
                      </div>
                      <Badge variant="outline" className="font-mono uppercase bg-background">
                        {delegate.position}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center text-muted-foreground font-mono">
                  No delegates assigned to this committee yet.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resolutions" className="mt-6">
          <div className="grid grid-cols-1 gap-4">
            {resolutionsLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : resolutions && resolutions.length > 0 ? (
              resolutions.map(resolution => (
                <Link key={resolution.id} href={`/resolutions/${resolution.id}`}>
                  <Card className="cursor-pointer hover:border-primary/50 transition-colors bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-6 flex items-center justify-between">
                      <div className="space-y-2">
                        <Badge variant="outline" className={`font-mono text-xs uppercase
                          ${resolution.status === 'passed' ? 'border-emerald-500 text-emerald-500' :
                            resolution.status === 'failed' ? 'border-red-500 text-red-500' :
                            resolution.status === 'draft' ? 'border-yellow-500 text-yellow-500' :
                            'border-blue-500 text-blue-500'}
                        `}>
                          {resolution.status}
                        </Badge>
                        <h3 className="font-mono font-bold text-lg">{resolution.title}</h3>
                      </div>
                      <div className="text-right text-sm font-mono text-muted-foreground">
                        <div className="flex gap-4">
                          <span className="text-emerald-500">Y: {resolution.votesFor || 0}</span>
                          <span className="text-red-500">N: {resolution.votesAgainst || 0}</span>
                          <span className="text-yellow-500">A: {resolution.abstentions || 0}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <div className="p-12 text-center text-muted-foreground font-mono border rounded-lg border-dashed">
                No resolutions drafted in this committee.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}