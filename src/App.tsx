// src/App.tsx
import { Suspense, lazy } from "react"; // 1. Import Suspense and lazy
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { CartProvider } from "@/context/CartContext";
import { Loader2 } from "lucide-react"; // Import a spinner

// Layouts (Keep layouts eager if they are small, or lazy load them too)
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CustomerLayout } from "@/components/layout/CustomerLayout";

// 2. Lazy Import Pages
const Login = lazy(() => import("@/pages/Login"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const AdminProducts = lazy(() => import("@/pages/AdminProducts"));
const SuperAdmin = lazy(() => import("@/pages/SuperAdmin"));
const Products = lazy(() => import("@/pages/Products"));
const Cart = lazy(() => import("@/pages/Cart"));
const Orders = lazy(() => import("@/pages/Orders"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const TooManyRequests = lazy(() => import("@/pages/TooManyRequests"));
const Profile = lazy(() => import("@/pages/Profile"));
const Settings = lazy(() => import("@/pages/Settings"));
const Wishlist = lazy(() => import("./pages/Wishlist"));

const queryClient = new QueryClient();

// 3. Create a Loading Component
const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              {/* 4. Wrap Routes in Suspense */}
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Public Status Pages */}
                  <Route
                    path="/too-many-requests"
                    element={<TooManyRequests />}
                  />

                  {/* Auth */}
                  <Route path="/login" element={<Login />} />

                  {/* Admin Routes */}
                  <Route element={<DashboardLayout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/admin/products" element={<AdminProducts />} />
                    <Route path="/admin/orders" element={<NotFound />} />
                    <Route path="/admin/users" element={<NotFound />} />
                    <Route path="/admin/reports" element={<NotFound />} />
                    <Route path="/admin/settings" element={<Settings />} />
                    <Route path="/admin/profile" element={<Profile />} />
                    <Route path="/super-admin" element={<SuperAdmin />} />
                  </Route>

                  {/* Customer Routes */}
                  <Route element={<CustomerLayout />}>
                    <Route path="/" element={<Products />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/wishlist" element={<Wishlist />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/settings" element={<Settings />} />
                  </Route>

                  {/* Catch-all */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
