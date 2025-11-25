"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { User, Briefcase, GraduationCap, FolderOpen, FileText, LogOut, Code } from "lucide-react";
import ProfileForm from "./components/ProfileForm";
import ProjectsManager from "./components/ProjectsManager";
import ExperienceManager from "./components/ExperienceManager";
import EducationManager from "./components/EducationManager";
import ResumeManager from "./components/ResumeManager";
import LaTeXEditor from "./components/LaTeXEditor";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { logout, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  const handleLogout = () => {
    logout();
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-navy">
        <div className="text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-navy">
        <div className="text-center">
          <p className="text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-navy">
      <div className="container mx-auto p-6 md:p-12 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-shadow-sm mb-1">
                Portfolio Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Manage your portfolio content and settings
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <ThemeToggle />
              <Button
                variant="outline"
                onClick={handleLogout}
                className="border-accent/50 hover:bg-accent/10 hover:border-accent text-xs sm:text-sm flex-1 sm:flex-initial"
              >
                <LogOut className="mr-2 h-3.5 w-3.5" />
                Logout
              </Button>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 mb-4 bg-card/30 border-border/30 h-10">
              <TabsTrigger value="profile" className="data-[state=active]:text-accent text-xs md:text-sm">
                <User className="mr-1.5 h-3.5 w-3.5" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="projects" className="data-[state=active]:text-accent text-xs md:text-sm">
                <FolderOpen className="mr-1.5 h-3.5 w-3.5" />
                <span className="hidden sm:inline">Projects</span>
              </TabsTrigger>
              <TabsTrigger value="experience" className="data-[state=active]:text-accent text-xs md:text-sm">
                <Briefcase className="mr-1.5 h-3.5 w-3.5" />
                <span className="hidden sm:inline">Experience</span>
              </TabsTrigger>
              <TabsTrigger value="education" className="data-[state=active]:text-accent text-xs md:text-sm">
                <GraduationCap className="mr-1.5 h-3.5 w-3.5" />
                <span className="hidden sm:inline">Education</span>
              </TabsTrigger>
              <TabsTrigger value="resume" className="data-[state=active]:text-accent text-xs md:text-sm">
                <FileText className="mr-1.5 h-3.5 w-3.5" />
                <span className="hidden sm:inline">Resume</span>
              </TabsTrigger>
              <TabsTrigger value="latex" className="data-[state=active]:text-accent text-xs md:text-sm">
                <Code className="mr-1.5 h-3.5 w-3.5" />
                <span className="hidden sm:inline">LaTeX</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-4">
              <ProfileForm />
            </TabsContent>

            <TabsContent value="projects" className="mt-4">
              <ProjectsManager />
            </TabsContent>

            <TabsContent value="experience" className="mt-4">
              <ExperienceManager />
            </TabsContent>

            <TabsContent value="education" className="mt-4">
              <EducationManager />
            </TabsContent>

            <TabsContent value="resume" className="mt-4">
              <ResumeManager />
            </TabsContent>

            <TabsContent value="latex" className="mt-4">
              <LaTeXEditor />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}

