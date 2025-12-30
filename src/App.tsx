import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Lazy load all pages for better performance
const LandingPage = lazy(() => import("./pages/LandingPage"));
const Index = lazy(() => import("./pages/Index"));
const CoursesPage = lazy(() => import("./pages/CoursesPage"));
const CoursePage = lazy(() => import("./pages/CoursePage"));
const CalendarPage = lazy(() => import("./pages/CalendarPage"));
const MessagesPage = lazy(() => import("./pages/MessagesPage"));
const ProgressPage = lazy(() => import("./pages/ProgressPage"));
const LibraryPage = lazy(() => import("./pages/LibraryPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const CommunityPage = lazy(() => import("./pages/CommunityPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const DevotionalPage = lazy(() => import("./pages/DevotionalPage"));
const BiblePage = lazy(() => import("./pages/BiblePage"));
const CertificatesPage = lazy(() => import("./pages/CertificatesPage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const BlogPage = lazy(() => import("./pages/BlogPage"));
const BlogPostPage = lazy(() => import("./pages/BlogPostPage"));
const ForumPage = lazy(() => import("./pages/ForumPage"));
const FinancePage = lazy(() => import("./pages/FinancePage"));
const TranscriptPage = lazy(() => import("./pages/TranscriptPage"));

// Admin Pages - Lazy loaded
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminUsersPage = lazy(() => import("./pages/admin/AdminUsersPage"));
const AdminCoursesPage = lazy(() => import("./pages/admin/AdminCoursesPage"));
const AdminLibraryPage = lazy(() => import("./pages/admin/AdminLibraryPage"));
const AdminEventsPage = lazy(() => import("./pages/admin/AdminEventsPage"));
const AdminDevotionalsPage = lazy(() => import("./pages/admin/AdminDevotionalsPage"));
const AdminCertificatesPage = lazy(() => import("./pages/admin/AdminCertificatesPage"));
const AdminSettingsPage = lazy(() => import("./pages/admin/AdminSettingsPage"));
const AdminMessagesPage = lazy(() => import("./pages/admin/AdminMessagesPage"));
const AdminQuizzesPage = lazy(() => import("./pages/admin/AdminQuizzesPage"));
const AdminLessonsPage = lazy(() => import("./pages/admin/AdminLessonsPage"));
const AdminStrongsPage = lazy(() => import("./pages/admin/AdminStrongsPage"));
const AdminMaterialsPage = lazy(() => import("./pages/admin/AdminMaterialsPage"));
const AdminEnrollmentsPage = lazy(() => import("./pages/admin/AdminEnrollmentsPage"));
const AdminReportsPage = lazy(() => import("./pages/admin/AdminReportsPage"));
const AdminBlogPage = lazy(() => import("./pages/admin/AdminBlogPage"));
const AdminManualPage = lazy(() => import("./pages/admin/AdminManualPage"));
const AdminFinancePage = lazy(() => import("./pages/admin/AdminFinancePage"));
const AdminAdmissionsPage = lazy(() => import("./pages/admin/AdminAdmissionsPage"));
const AdminForumPage = lazy(() => import("./pages/admin/AdminForumPage"));
const AdminTranscriptsPage = lazy(() => import("./pages/admin/AdminTranscriptsPage"));
const AdminBackupsPage = lazy(() => import("./pages/admin/AdminBackupsPage"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Loading spinner component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-muted-foreground">Carregando...</p>
    </div>
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <PageLoader />;
  }

  if (!user) {
    // Redirect to public landing page instead of auth
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
};

// Admin Route Component
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const { isAdmin, isLoading: loadingRole } = useUserRole();

  if (loading || loadingRole) {
    return <PageLoader />;
  }

  if (!user) {
    return <Navigate to="/home" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Landing Page */}
        <Route path="/home" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Index />
            </ProtectedRoute>
          }
        />
        <Route
          path="/courses"
          element={
            <ProtectedRoute>
              <CoursesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/course/:id"
          element={
            <ProtectedRoute>
              <CoursePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/calendar"
          element={
            <ProtectedRoute>
              <CalendarPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <MessagesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/progress"
          element={
            <ProtectedRoute>
              <ProgressPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/library"
          element={
            <ProtectedRoute>
              <LibraryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/community"
          element={
            <ProtectedRoute>
              <CommunityPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/devotional"
          element={
            <ProtectedRoute>
              <DevotionalPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bible"
          element={
            <ProtectedRoute>
              <BiblePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/certificates"
          element={
            <ProtectedRoute>
              <CertificatesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/blog"
          element={
            <ProtectedRoute>
              <BlogPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/blog/:id"
          element={
            <ProtectedRoute>
              <BlogPostPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/forum"
          element={
            <ProtectedRoute>
              <ForumPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/finance"
          element={
            <ProtectedRoute>
              <FinancePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transcript"
          element={
            <ProtectedRoute>
              <TranscriptPage />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <AdminUsersPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/enrollments"
          element={
            <AdminRoute>
              <AdminEnrollmentsPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/courses"
          element={
            <AdminRoute>
              <AdminCoursesPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/lessons"
          element={
            <AdminRoute>
              <AdminLessonsPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/quizzes"
          element={
            <AdminRoute>
              <AdminQuizzesPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/library"
          element={
            <AdminRoute>
              <AdminLibraryPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/events"
          element={
            <AdminRoute>
              <AdminEventsPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/devotionals"
          element={
            <AdminRoute>
              <AdminDevotionalsPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/messages"
          element={
            <AdminRoute>
              <AdminMessagesPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/certificates"
          element={
            <AdminRoute>
              <AdminCertificatesPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/strongs"
          element={
            <AdminRoute>
              <AdminStrongsPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/materials"
          element={
            <AdminRoute>
              <AdminMaterialsPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <AdminRoute>
              <AdminSettingsPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <AdminRoute>
              <AdminReportsPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/blog"
          element={
            <AdminRoute>
              <AdminBlogPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/manual"
          element={
            <AdminRoute>
              <AdminManualPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/finance"
          element={
            <AdminRoute>
              <AdminFinancePage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/admissions"
          element={
            <AdminRoute>
              <AdminAdmissionsPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/forum"
          element={
            <AdminRoute>
              <AdminForumPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/transcripts"
          element={
            <AdminRoute>
              <AdminTranscriptsPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/backups"
          element={
            <AdminRoute>
              <AdminBackupsPage />
            </AdminRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ErrorBoundary>
            <AppRoutes />
          </ErrorBoundary>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
