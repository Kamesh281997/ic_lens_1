import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import NotFound from "@/pages/not-found";
import Auth from "@/pages/auth";
import Landing from "@/pages/landing";
import About from "@/pages/about";
import Contact from "@/pages/contact";
import DataUpload from "@/pages/data-upload";
import IcProcessing from "@/pages/ic-processing";
import DataValidation from "@/pages/data-validation";
import PayoutCalculation from "@/pages/payout-calculation";
import DataInsights from "@/pages/data-insights";
import IcPlanConfiguration from "@/pages/ic-plan-configuration";
import PayoutAdjustments from "@/pages/payout-adjustments";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/auth" component={Auth} />
      <Route path="/login" component={Auth} />
      <Route path="/signup" component={Auth} />
      <Route path="/data-upload" component={DataUpload} />
      <Route path="/ic-processing" component={IcProcessing} />
      <Route path="/data-validation" component={DataValidation} />
      <Route path="/payout-calculation" component={PayoutCalculation} />
      <Route path="/data-insights" component={DataInsights} />
      <Route path="/ic-plan-configuration" component={IcPlanConfiguration} />
      <Route path="/payout-adjustments" component={PayoutAdjustments} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="iclens-ui-theme">
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
