"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/app/store/auth";
import { useRulesStore } from "@/app/store/rules";
import { getAccessToken } from "@/app/lib/api";
import Sidebar from "./components/Sidebar";
import DashboardHeader from "./components/DashboardHeader";
import ProfileModal from "./components/ProfileModal";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, fetchCurrentUser, logout } = useAuthStore();
  const { onboardingComplete } = useRulesStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isValidating, setIsValidating] = useState(true);

  const isOnboardingPage = pathname === "/dashboard/onboarding";

  useEffect(() => {
    setMounted(true);
  }, []);

  // Validate authentication on mount
  useEffect(() => {
    const validateAuth = async () => {
      const token = getAccessToken();
      
      if (!token) {
        logout();
        router.push("/login");
        return;
      }

      if (isAuthenticated && user) {
        // Refresh user data from API
        try {
          await fetchCurrentUser();
        } catch {
          // Token invalid, redirect to login
          logout();
          router.push("/login");
          return;
        }
      }
      
      setIsValidating(false);
    };

    if (mounted) {
      validateAuth();
    }
  }, [mounted, isAuthenticated, user, fetchCurrentUser, logout, router]);

  useEffect(() => {
    if (mounted && !isValidating && !isAuthenticated) {
      router.push("/login");
    }
  }, [mounted, isValidating, isAuthenticated, router]);

  useEffect(() => {
    // Show profile modal if profile is not complete
    if (mounted && user && !user.profileComplete && !isOnboardingPage) {
      setShowProfileModal(true);
    } else {
      setShowProfileModal(false);
    }
  }, [mounted, user, user?.profileComplete, isOnboardingPage]);

  // Redirect to onboarding if profile is complete but rules are not set
  useEffect(() => {
    if (mounted && !isValidating && user?.profileComplete && !onboardingComplete && !isOnboardingPage) {
      router.push("/dashboard/onboarding");
    }
  }, [mounted, isValidating, user?.profileComplete, onboardingComplete, isOnboardingPage, router]);

  if (!mounted || isValidating || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // Render onboarding page without sidebar
  if (isOnboardingPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="lg:pl-64">
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>

      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </div>
  );
}
