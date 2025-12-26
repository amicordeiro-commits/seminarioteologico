import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import Index from "./pages/Index";
import CoursesPage from "./pages/CoursesPage";
import CoursePage from "./pages/CoursePage";
import CalendarPage from "./pages/CalendarPage";
import MessagesPage from "./pages/MessagesPage";
import ProgressPage from "./pages/ProgressPage";
import LibraryPage from "./pages/LibraryPage";
import ProfilePage from "./pages/ProfilePage";
import CommunityPage from "./pages/CommunityPage";
import SettingsPage from "./pages/SettingsPage";
import DevotionalPage from "./pages/DevotionalPage";

import CertificatesPage from "./pages/CertificatesPage";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminCoursesPage from "./pages/admin/AdminCoursesPage";
import AdminLibraryPage from "./pages/admin/AdminLibraryPage";
import AdminEventsPage from "./pages/admin/AdminEventsPage";
import AdminDevotionalsPage from "./pages/admin/AdminDevotionalsPage";
import AdminCertificatesPage from "./pages/admin/AdminCertificatesPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";
import AdminMessagesPage from "./pages/admin/AdminMessagesPage";
import AdminQuizzesPage from "./pages/admin/AdminQuizzesPage";
import AdminLessonsPage from "./pages/admin/AdminLessonsPage";


const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-primary">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

// Admin Route Component
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const { isAdmin, isLoading: loadingRole } = useUserRole();

  if (loading || loadingRole) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-primary">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
      <Route path="/courses" element={<ProtectedRoute><CoursesPage /></ProtectedRoute>} />
      <Route path="/course/:id" element={<ProtectedRoute><CoursePage /></ProtectedRoute>} />
      <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
      <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
      <Route path="/progress" element={<ProtectedRoute><ProgressPage /></ProtectedRoute>} />
      <Route path="/library" element={<ProtectedRoute><LibraryPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/community" element={<ProtectedRoute><CommunityPage /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
      <Route path="/devotional" element={<ProtectedRoute><DevotionalPage /></ProtectedRoute>} />
      
      <Route path="/certificates" element={<ProtectedRoute><CertificatesPage /></ProtectedRoute>} />
      
      {/* Admin Routes */}
      <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/admin/users" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
      <Route path="/admin/courses" element={<AdminRoute><AdminCoursesPage /></AdminRoute>} />
      <Route path="/admin/lessons" element={<AdminRoute><AdminLessonsPage /></AdminRoute>} />
      <Route path="/admin/quizzes" element={<AdminRoute><AdminQuizzesPage /></AdminRoute>} />
      <Route path="/admin/library" element={<AdminRoute><AdminLibraryPage /></AdminRoute>} />
      <Route path="/admin/events" element={<AdminRoute><AdminEventsPage /></AdminRoute>} />
      <Route path="/admin/devotionals" element={<AdminRoute><AdminDevotionalsPage /></AdminRoute>} />
      <Route path="/admin/messages" element={<AdminRoute><AdminMessagesPage /></AdminRoute>} />
      <Route path="/admin/certificates" element={<AdminRoute><AdminCertificatesPage /></AdminRoute>} />
      <Route path="/admin/settings" element={<AdminRoute><AdminSettingsPage /></AdminRoute>} />
      
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
