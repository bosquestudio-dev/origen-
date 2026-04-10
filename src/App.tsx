import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/stores/auth.store";
import { CalendarProvider } from "@/stores/calendar.store";
import { AppProvider } from "@/stores/app.store";
import { AdminProvider } from "@/stores/admin.store";
import LoginPage from "@/pages/LoginPage";
import CalendarPage from "@/pages/CalendarPage";

// import AdminLayout from "@/pages/admin/AdminLayout";
// import AdminDashboardPage from "@/pages/admin/AdminDashboardPage";
// import AdminChallengesPage from "@/pages/admin/AdminChallengesPage";
// import AdminCompanyPage from "@/pages/admin/AdminCompanyPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CalendarProvider>
        <AppProvider>
          <AdminProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/calendar" element={<CalendarPage />} />
                {/* <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboardPage />} />
                  <Route path="challenges" element={<AdminChallengesPage />} />
                  <Route path="company" element={<AdminCompanyPage />} />
                </Route> */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </AdminProvider>
        </AppProvider>
      </CalendarProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
