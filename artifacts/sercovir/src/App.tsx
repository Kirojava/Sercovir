import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Layout } from "@/components/layout";
import Dashboard from "@/pages/dashboard";
import Countries from "@/pages/countries";
import CountryProfile from "@/pages/country";
import Conflicts from "@/pages/conflicts";
import ConflictDetail from "@/pages/conflict";
import Committees from "@/pages/committees";
import CommitteeDetail from "@/pages/committee";
import Resolutions from "@/pages/resolutions";
import ResolutionDetail from "@/pages/resolution";
import Alliances from "@/pages/alliances";
import AllianceDetail from "@/pages/alliance";
import Delegates from "@/pages/delegates";
import Intelligence from "@/pages/intelligence";

import Leaders from "@/pages/leaders";
import Leader from "@/pages/leader";
import CountryIntel from "@/pages/country-intel";
import Parliamentary from "@/pages/parliamentary";
import Legislation from "@/pages/legislation";
import CriminalCases from "@/pages/criminal-cases";
import Interpol from "@/pages/interpol";
import InterpolNoticeDetail from "@/pages/interpol-notice";
import IcjCases from "@/pages/icj";
import IcjCaseDetail from "@/pages/icj-case";
import Treaties from "@/pages/treaties";
import TreatyDetail from "@/pages/treaty";
import MediaEvents from "@/pages/media-events";
import LiveNews from "@/pages/live-news";
import PressReleases from "@/pages/press-releases";
import Economics from "@/pages/economics";
import Trade from "@/pages/trade";
import Forecasting from "@/pages/forecasting";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/countries" component={Countries} />
        <Route path="/countries/:id" component={CountryProfile} />
        <Route path="/conflicts" component={Conflicts} />
        <Route path="/conflicts/:id" component={ConflictDetail} />
        <Route path="/committees" component={Committees} />
        <Route path="/committees/:id" component={CommitteeDetail} />
        <Route path="/resolutions" component={Resolutions} />
        <Route path="/resolutions/:id" component={ResolutionDetail} />
        <Route path="/alliances" component={Alliances} />
        <Route path="/alliances/:id" component={AllianceDetail} />
        <Route path="/delegates" component={Delegates} />
        <Route path="/intelligence" component={Intelligence} />
        
        <Route path="/leaders" component={Leaders} />
        <Route path="/leaders/:id" component={Leader} />
        <Route path="/country-intel" component={CountryIntel} />
        <Route path="/parliamentary" component={Parliamentary} />
        <Route path="/legislation" component={Legislation} />
        <Route path="/criminal-cases" component={CriminalCases} />
        <Route path="/interpol" component={Interpol} />
        <Route path="/interpol/:id" component={InterpolNoticeDetail} />
        <Route path="/icj" component={IcjCases} />
        <Route path="/icj/:id" component={IcjCaseDetail} />
        <Route path="/treaties" component={Treaties} />
        <Route path="/treaties/:id" component={TreatyDetail} />
        <Route path="/media-events" component={MediaEvents} />
        <Route path="/live-news" component={LiveNews} />
        <Route path="/press-releases" component={PressReleases} />
        <Route path="/economics" component={Economics} />
        <Route path="/trade" component={Trade} />
        <Route path="/forecasting" component={Forecasting} />

        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL?.replace(/\/$/, "") || ""}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;