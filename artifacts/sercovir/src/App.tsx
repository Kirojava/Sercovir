import { useEffect, useRef } from "react";
import { ClerkProvider, SignIn, SignUp, useClerk } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { shadcn } from "@clerk/themes";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
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
import EntityGraph from "@/pages/entity-graph";
import ThreatMatrix from "@/pages/threat-matrix";
import GeoMap from "@/pages/geo-map";
import AiAnalyst from "@/pages/ai-analyst";
import CyberIntel from "@/pages/cyber-intel";
import NuclearMonitor from "@/pages/nuclear-monitor";
import OperationsTimeline from "@/pages/operations-timeline";
import CrisisRoom from "@/pages/crisis-room";
import MilitaryActivities from "@/pages/military-activities";
import Community from "@/pages/community";
import Admin from "@/pages/admin";
import { GlobalSearch } from "@/components/global-search";
import { AppAuthProvider, ClerkAuthBridge, useAppAuth } from "@/lib/auth";

const queryClient = new QueryClient();
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
const clerkPubKey = publishableKeyFromHost(window.location.hostname, import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

function stripBase(path: string) {
  return basePath && path.startsWith(basePath) ? path.slice(basePath.length) || "/" : path;
}

function SignInPage() {
  const { hasClerk } = useAppAuth();
  if (!hasClerk) return <AuthUnavailable />;
  return <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4"><SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} /></div>;
}

function SignUpPage() {
  const { hasClerk } = useAppAuth();
  if (!hasClerk) return <AuthUnavailable />;
  return <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4"><SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} /></div>;
}

function AuthUnavailable() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <div className="glass-panel max-w-lg p-8 text-center">
        <div className="kicker text-accent">Identity service / pending setup</div>
        <h1 className="mt-3 font-serif text-3xl">Authentication is not configured</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Public intelligence surfaces are available in preview. Sign-in, community, and administration features will activate after Clerk is connected.
        </p>
        <a href={basePath || "/"} className="mt-6 inline-flex border border-primary/40 px-4 py-2 font-mono text-[10px] uppercase tracking-[.15em] text-primary hover:bg-primary/10">Return to command center</a>
      </div>
    </div>
  );
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const client = useQueryClient();
  const previous = useRef<string | null | undefined>(undefined);
  useEffect(() => addListener(({ user }) => {
    const next = user?.id ?? null;
    if (previous.current !== undefined && previous.current !== next) client.clear();
    previous.current = next;
  }), [addListener, client]);
  return null;
}

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
        <Route path="/entity-graph" component={EntityGraph} />
        <Route path="/threat-matrix" component={ThreatMatrix} />
        <Route path="/geo-map" component={GeoMap} />
        <Route path="/ai-analyst" component={AiAnalyst} />
        <Route path="/cyber-intel" component={CyberIntel} />
        <Route path="/nuclear-monitor" component={NuclearMonitor} />
        <Route path="/operations-timeline" component={OperationsTimeline} />
        <Route path="/crisis-room" component={CrisisRoom} />
        <Route path="/military-activities" component={MilitaryActivities} />
        <Route path="/community" component={Community} />
        <Route path="/admin" component={Admin} />

        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  const shell = (withClerk: boolean) => (
    <QueryClientProvider client={queryClient}>
      {withClerk && <ClerkQueryClientCacheInvalidator />}
      <TooltipProvider>
        <WouterRouter base={basePath}>
          <Switch>
            <Route path="/sign-in/*?" component={SignInPage} />
            <Route path="/sign-up/*?" component={SignUpPage} />
            <Route component={Router} />
          </Switch>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );

  if (!clerkPubKey) {
    return (
      <AppAuthProvider value={{ isLoaded: true, isSignedIn: false, hasClerk: false, userId: null }}>
        {shell(false)}
      </AppAuthProvider>
    );
  }

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={{
        theme: shadcn,
        cssLayerName: "clerk",
        options: { logoPlacement: "inside", logoLinkUrl: basePath || "/", logoImageUrl: `${window.location.origin}${basePath}/logo.svg` },
        variables: { colorPrimary: "#78c7b0", colorForeground: "#eef7f3", colorMutedForeground: "#99b4ad", colorDanger: "#e27b73", colorBackground: "#0b1918", colorInput: "#122725", colorInputForeground: "#eef7f3", colorNeutral: "#38534e", fontFamily: "Manrope", borderRadius: "2px" },
        elements: {
          rootBox: "w-full flex justify-center", cardBox: "bg-[#0b1918] rounded-2xl w-[440px] max-w-full overflow-hidden", card: "!shadow-none !border-0 !bg-transparent !rounded-none", footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
          headerTitle: "text-[#eef7f3]", headerSubtitle: "text-[#99b4ad]", socialButtonsBlockButtonText: "text-[#eef7f3]", formFieldLabel: "text-[#c9ded8]", footerActionLink: "text-[#78c7b0]", footerActionText: "text-[#99b4ad]", dividerText: "text-[#99b4ad]", identityPreviewEditButton: "text-[#78c7b0]", formFieldSuccessText: "text-[#78c7b0]", alertText: "text-[#e27b73]",
          logoBox: "text-[#78c7b0]", logoImage: "max-h-10", socialButtonsBlockButton: "!border-[#38534e] !bg-[#122725] hover:!bg-[#193631]", formButtonPrimary: "!bg-[#78c7b0] !text-[#07110f] hover:!bg-[#94dcc3]", formFieldInput: "!border-[#38534e] !bg-[#122725] !text-[#eef7f3]", footerAction: "border-[#38534e]", dividerLine: "bg-[#38534e]", alert: "!border-[#7d3e3a] !bg-[#2a1716]", otpCodeFieldInput: "!border-[#38534e] !bg-[#122725] !text-[#eef7f3]", formFieldRow: "gap-2", main: "bg-transparent",
        },
      }}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{ signIn: { start: { title: "Welcome back", subtitle: "Access the Sercovir observation room" } }, signUp: { start: { title: "Create operator account", subtitle: "Join the Sercovir intelligence network" } } }}
      routerPush={(to) => window.history.pushState({}, "", stripBase(to))}
      routerReplace={(to) => window.history.replaceState({}, "", stripBase(to))}
    >
      <ClerkAuthBridge>{shell(true)}</ClerkAuthBridge>
    </ClerkProvider>
  );
}

export default App;