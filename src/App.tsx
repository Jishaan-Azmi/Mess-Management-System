import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import StudentLogin from "./pages/StudentLogin";
import AdminLogin from "./pages/AdminLogin";
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentProfile from "./pages/student/StudentProfile";
import StudentAttendance from "./pages/student/StudentAttendance";
import StudentBills from "./pages/student/StudentBills";
import StudentPayments from "./pages/student/StudentPayments";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminStudents from "./pages/admin/AdminStudents";
import AdminAttendanceRequests from "./pages/admin/AdminAttendanceRequests";
import AdminMessItems from "./pages/admin/AdminMessItems";
import AdminBilling from "./pages/admin/AdminBilling";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminLeaveManagement from "./pages/admin/AdminLeaveManagement";
import NotFound from "./pages/NotFound";
import React from "react";
import { useAutoAttendance } from "./hooks/useAutoAttendance";
import { useAutoBilling } from "./hooks/useAutoBilling";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

const AppContent = () => {
  useAutoAttendance();
  // useAutoBilling(); // Disabled - bills are created when attendance is marked
  
  return (
    <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/student/login" element={<StudentLogin />} />
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/profile" element={<StudentProfile />} />
          <Route path="/student/attendance" element={<StudentAttendance />} />
          <Route path="/student/bills" element={<StudentBills />} />
          <Route path="/student/payments" element={<StudentPayments />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/students" element={<AdminStudents />} />
          <Route path="/admin/attendance-requests" element={<AdminAttendanceRequests />} />
          <Route path="/admin/mess-items" element={<AdminMessItems />} />
          <Route path="/admin/billing" element={<AdminBilling />} />
          <Route path="/admin/payments" element={<AdminPayments />} />
          <Route path="/admin/leave-management" element={<AdminLeaveManagement />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppContent />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
