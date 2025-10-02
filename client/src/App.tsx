import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./components/ThemeProvider";
import MDDSStrategy from "./pages/MDDSStrategy";
import MobileSession from "./pages/MobileSession";
import MobileLogin from "./pages/MobileLogin";
import DatabaseSessions from "./pages/DatabaseSessions";
import Analysis from "./pages/Analysis";
import Research from "./pages/Research";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={MDDSStrategy} />
      <Route path="/database" component={DatabaseSessions} />
      <Route path="/analysis" component={Analysis} />
      <Route path="/research" component={Research} />
      <Route path="/mobile" component={MobileLogin} />
      <Route path="/mobile/:sessionName" component={MobileSession} />
      <Route component={NotFound} />
    </Switch>
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
