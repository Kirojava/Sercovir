import { useState } from "react";
import { useListInterpolNotices } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Globe, Target, MapPin, Calendar } from "lucide-react";
import { format } from "date-fns";

export default function Interpol() {
  const [search, setSearch] = useState("");
  const { data: notices, isLoading } = useListInterpolNotices({}); // Ignoring search for noticeType

  const filteredNotices = notices?.filter(n => 
    n.subjectName.toLowerCase().includes(search.toLowerCase()) || 
    n.nationality?.toLowerCase().includes(search.toLowerCase()) ||
    n.noticeType.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-mono font-bold tracking-tight">INTERPOL NOTICES</h1>
          <p className="text-muted-foreground font-mono mt-1">International alert database for wanted persons and threats.</p>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-card/50 p-4 rounded-lg border border-border backdrop-blur-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            className="pl-10 font-mono bg-background/50 border-border/50" 
            placeholder="Search by name, nationality, or notice type..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotices?.map((notice) => {
            const noticeColor = 
              notice.noticeType === 'red' ? 'bg-red-500 border-red-500' :
              notice.noticeType === 'blue' ? 'bg-blue-500 border-blue-500' :
              notice.noticeType === 'green' ? 'bg-green-500 border-green-500' :
              notice.noticeType === 'yellow' ? 'bg-yellow-500 border-yellow-500' :
              notice.noticeType === 'orange' ? 'bg-orange-500 border-orange-500' :
              notice.noticeType === 'purple' ? 'bg-purple-500 border-purple-500' :
              'bg-primary border-primary';
              
            const noticeTextClass = 
              notice.noticeType === 'red' ? 'text-red-500' :
              notice.noticeType === 'blue' ? 'text-blue-500' :
              notice.noticeType === 'green' ? 'text-green-500' :
              notice.noticeType === 'yellow' ? 'text-yellow-500' :
              notice.noticeType === 'orange' ? 'text-orange-500' :
              notice.noticeType === 'purple' ? 'text-purple-500' :
              'text-primary';

            return (
              <Card key={notice.id} className="bg-card/50 border-border backdrop-blur-sm relative overflow-hidden group">
                <div className={`absolute top-0 left-0 w-full h-1 ${noticeColor}`} />
                <CardHeader className="pb-3 border-b border-border/50">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="font-mono text-lg font-bold group-hover:text-primary transition-colors">
                        {notice.subjectName}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1 text-xs font-mono text-muted-foreground">
                        <Globe className="w-3 h-3" />
                        <span>{notice.nationality || "UNKNOWN"}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className={`font-mono uppercase text-[10px] ${noticeTextClass} border-current bg-current/10`}>
                      {notice.noticeType} NOTICE
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 flex flex-col gap-4">
                  <div className="space-y-1">
                    <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Charges / Info</div>
                    <p className="text-sm font-mono line-clamp-2">
                      {notice.charges || notice.description || "Classified."}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono border-t border-border/50 pt-3">
                    <div className="space-y-1">
                      <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Target className="w-3 h-3" /> CHARGED BY
                      </div>
                      <div>{notice.chargedBy || "N/A"}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> LAST SEEN
                      </div>
                      <div>{notice.lastKnownLocation || "UNKNOWN"}</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-2 text-[10px] font-mono text-muted-foreground">
                    <span>STATUS: <span className="text-foreground">{notice.status.toUpperCase()}</span></span>
                    {notice.issuedDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(notice.issuedDate), "yyyy-MM-dd")}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {filteredNotices?.length === 0 && (
            <div className="col-span-full py-12 text-center font-mono text-muted-foreground bg-card/30 rounded-lg border border-dashed border-border/50">
              No Interpol notices matched your search.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
