import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";

// Layouts
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CustomerLayout } from "@/components/layout/CustomerLayout";

// Pages
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import AdminProducts from "@/pages/AdminProducts";
import SuperAdmin from "@/pages/SuperAdmin";
import Products from "@/pages/Products";
import Cart from "@/pages/Cart";
import Orders from "@/pages/Orders";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Auth */}
              <Route path="/login" element={<Login />} />

              {/* Admin Routes */}
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/admin/products" element={<AdminProducts />} />
                <Route path="/admin/orders" element={<Dashboard />} />
                <Route path="/admin/users" element={<Dashboard />} />
                <Route path="/admin/reports" element={<Dashboard />} />
                <Route path="/admin/settings" element={<Dashboard />} />
                <Route path="/super-admin" element={<SuperAdmin />} />
              </Route>

              {/* Customer Routes */}
              <Route element={<CustomerLayout />}>
                <Route path="/" element={<Products />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/orders" element={<Orders />} />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
