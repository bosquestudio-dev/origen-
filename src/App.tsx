import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/stores/auth.store";
import { CalendarProvider } from "@/stores/calendar.store";
import { AppProvider } from "@/stores/app.store";
import LoginPage from "@/pages/LoginPage";
import CalendarPage from "@/pages/CalendarPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CalendarProvider>
        <AppProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LoginPage />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AppProvider>
      </CalendarProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
