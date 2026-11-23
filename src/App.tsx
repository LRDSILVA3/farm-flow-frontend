import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { OfflineProvider } from "@/contexts/OfflineContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <OfflineProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Index />} />
            <Route path="/dashboard" element={<Index />} />
            <Route path="/customers" element={<Index />} />
            <Route path="/clientes" element={<Index />} />
            <Route path="/farms" element={<Index />} />
            <Route path="/fazendas" element={<Index />} />
            <Route path="/orders" element={<Index />} />
            <Route path="/pedidos" element={<Index />} />
            <Route path="/schedule" element={<Index />} />
            <Route path="/agenda" element={<Index />} />
            <Route path="/analysis" element={<Index />} />
            <Route path="/analises" element={<Index />} />
            <Route path="/financial" element={<Index />} />
            <Route path="/financeiro" element={<Index />} />
            <Route path="/reports" element={<Index />} />
            <Route path="/relatorios" element={<Index />} />
            <Route path="/settings" element={<Index />} />
            <Route path="/configuracoes" element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </OfflineProvider>
  </QueryClientProvider>
);

export default App;
