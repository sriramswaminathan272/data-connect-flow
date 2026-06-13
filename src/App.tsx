import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import TrainerDashboard from "./pages/TrainerDashboard";
import AppLayout from "./components/AppLayout";
import HypothesisTesting from "./pages/HypothesisTesting";
import ScenarioAnalysis from "./pages/ScenarioAnalysis";
import MachineLearning from "./pages/MachineLearning";
import Onboarding from "./pages/Onboarding";
import ArtisanDaily from "./pages/ArtisanDaily";
import { getContext } from "./lib/artisan-store";

const queryClient = new QueryClient();

function RootRedirect() {
  const ctx = getContext();
  if (ctx.onboardingComplete) return <Navigate to="/artisan" replace />;
  return <Navigate to="/onboarding" replace />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/artisan" element={<ArtisanDaily />} />
          <Route path="/connect" element={
            <AppLayout>
              <Index />
            </AppLayout>
          } />
          <Route path="/dashboard" element={
            <AppLayout>
              <Dashboard />
            </AppLayout>
          } />
          <Route path="/hypothesis" element={
            <AppLayout>
              <HypothesisTesting />
            </AppLayout>
          } />
          <Route path="/scenario" element={
            <AppLayout>
              <ScenarioAnalysis />
            </AppLayout>
          } />
          <Route path="/ml" element={
            <AppLayout>
              <MachineLearning />
            </AppLayout>
          } />
          <Route path="/trainer" element={<TrainerDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
