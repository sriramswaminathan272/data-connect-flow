
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import TrainerDashboard from "./pages/TrainerDashboard";
import AppLayout from "./components/AppLayout";
import HypothesisTesting from "./pages/HypothesisTesting";
import ScenarioAnalysis from "./pages/ScenarioAnalysis";
import MachineLearning from "./pages/MachineLearning";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
            <AppLayout>
              <Dashboard />
            </AppLayout>
          } />
          <Route path="/connect" element={
            <AppLayout>
              <Index />
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
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
