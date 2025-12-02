import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./components/ThemeProvider";
import { lazy, Suspense } from "react";

// Lazy load pages for better performance (code splitting)
const MDDSStrategy = lazy(() => import("./pages/MDDSStrategy"));
const SinglePlayerGame = lazy(() => import("./pages/SinglePlayerGame"));
const MobileSession = lazy(() => import("./pages/MobileSession"));
const MobileLogin = lazy(() => import("./pages/MobileLogin"));
const DatabaseSessions = lazy(() => import("./pages/DatabaseSessions"));
const Analysis = lazy(() => import("./pages/Analysis"));
const Research = lazy(() => import("./pages/Research"));
const NotFound = lazy(() => import("@/pages/not-found"));

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/" component={MDDSStrategy} />
        <Route path="/single-player" component={SinglePlayerGame} />
        <Route path="/database" component={DatabaseSessions} />
        <Route path="/analysis" component={Analysis} />
        <Route path="/research" component={Research} />
        <Route path="/mobile" component={MobileLogin} />
        <Route path="/mobile/:sessionName" component={MobileSession} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="mdds-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
