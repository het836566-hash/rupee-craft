import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ExpenseProvider } from "@/contexts/ExpenseContext";
import { FriendsProvider } from "@/contexts/FriendsContext";
import { BudgetProvider } from "@/contexts/BudgetContext";
import { SplitProvider } from "@/contexts/SplitContext";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import AddTransaction from "@/pages/AddTransaction";
import Analytics from "@/pages/Analytics";
import Friends from "@/pages/Friends";
import Budget from "@/pages/Budget";
import Split from "@/pages/Split";
import Settings from "@/pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ExpenseProvider>
        <FriendsProvider>
          <BudgetProvider>
            <SplitProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="add" element={<AddTransaction />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="friends" element={<Friends />} />
                  <Route path="budget" element={<Budget />} />
                  <Route path="split" element={<Split />} />
                  <Route path="settings" element={<Settings />} />
                  </Route>
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </SplitProvider>
          </BudgetProvider>
        </FriendsProvider>
      </ExpenseProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
