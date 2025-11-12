"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileText,
  Download,
  Trash2,
  CheckCircle2,
  Loader2,
  Calendar,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface ResumeData {
  file: File;
  fileName: string;
  lastUpdated: Date;
  fileSize: number;
  url: string;
}

export default function ResumeManager() {
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const { toast } = useToast();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = [".pdf", ".doc", ".docx"];
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
    if (!validTypes.includes(fileExtension)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF, DOC, or DOCX file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "File size must be less than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setIsActive(true);

    // Simulate async upload
    await new Promise((resolve) => setTimeout(resolve, 1500));

    try {
      const mockUrl = URL.createObjectURL(file);
      const resumeData: ResumeData = {
        file,
        fileName: file.name,
        lastUpdated: new Date(),
        fileSize: file.size,
        url: mockUrl,
      };

      setResume(resumeData);
      setIsUploading(false);

      toast({
        title: "Resume uploaded successfully",
        description: `${file.name} has been uploaded.`,
        variant: "success",
      });
    } catch (error) {
      setIsUploading(false);
      setIsActive(false);
      toast({
        title: "Upload failed",
        description: "An error occurred while uploading the resume.",
        variant: "destructive",
      });
    }

    // Reset input
    e.target.value = "";
  };

  const handleDownload = async () => {
    if (!resume) return;

    setIsDownloading(true);

    // Simulate async download
    await new Promise((resolve) => setTimeout(resolve, 800));

    try {
      const link = document.createElement("a");
      link.href = resume.url;
      link.download = resume.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setIsDownloading(false);

      toast({
        title: "Download started",
        description: `${resume.fileName} is being downloaded.`,
        variant: "success",
      });
    } catch (error) {
      setIsDownloading(false);
      toast({
        title: "Download failed",
        description: "An error occurred while downloading the resume.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!resume) return;

    setIsDeleting(true);

    // Simulate async delete
    await new Promise((resolve) => setTimeout(resolve, 800));

    try {
      // Revoke object URL to free memory
      if (resume.url) {
        URL.revokeObjectURL(resume.url);
      }

      setResume(null);
      setIsActive(false);
      setIsDeleting(false);

      toast({
        title: "Resume deleted",
        description: "The resume has been successfully deleted.",
        variant: "success",
      });
    } catch (error) {
      setIsDeleting(false);
      toast({
        title: "Delete failed",
        description: "An error occurred while deleting the resume.",
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-border/30 bg-card/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl">Resume Manager</CardTitle>
            <CardDescription className="text-xs">
              Upload, download, and manage your resume/CV document
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-3">
            <AnimatePresence mode="wait">
              {!resume ? (
                <motion.div
                  key="no-resume"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="border-2 border-dashed border-border/50 rounded-lg p-12 text-center hover:border-accent/50 transition-colors"
                >
                  <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">
                    No Resume Uploaded
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Upload a PDF, DOC, or DOCX file to get started (max 10MB)
                  </p>
                  <label htmlFor="resume-upload">
                    <Button
                      className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
                      disabled={isUploading}
                      asChild
                    >
                      <span>
                        {isUploading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Resume
                          </>
                        )}
                      </span>
                    </Button>
                    <Input
                      id="resume-upload"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      onChange={handleUpload}
                      disabled={isUploading}
                    />
                  </label>
                </motion.div>
              ) : (
                <motion.div
                  key="resume-exists"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border border-border/50 rounded-lg bg-card/30">
                    <div className="flex items-start sm:items-center space-x-4 flex-1">
                      <div className="p-3 rounded-lg bg-accent/20">
                        <FileText className="h-6 w-6 text-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold truncate">
                            {resume.fileName}
                          </h3>
                          <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0" />
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          <span>{formatFileSize(resume.fileSize)}</span>
                          <span className="hidden sm:inline">•</span>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>Updated {formatDate(resume.lastUpdated)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button
                        variant="outline"
                        onClick={handleDownload}
                        disabled={isDownloading}
                        className="border-accent/50 hover:bg-accent/10 hover:border-accent flex-1 sm:flex-initial"
                      >
                        {isDownloading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Downloading...
                          </>
                        ) : (
                          <>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </>
                        )}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            disabled={isDeleting}
                            className="border-destructive/50 hover:bg-destructive/10 hover:border-destructive flex-1 sm:flex-initial"
                          >
                            {isDeleting ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Deleting...
                              </>
                            ) : (
                              <>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </>
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Resume?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{resume.fileName}"?
                              This action cannot be undone and you will need to
                              upload a new resume.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleDelete}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete Resume
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className="border-2 border-dashed border-border/50 rounded-lg p-8 text-center hover:border-accent/50 transition-colors"
                  >
                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">
                      Replace Resume
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Upload a new file to replace the current resume
                    </p>
                    <label htmlFor="resume-replace">
                      <Button
                        variant="outline"
                        className="border-accent/50 hover:bg-accent/10 hover:border-accent cursor-pointer"
                        disabled={isUploading}
                        asChild
                      >
                        <span>
                          {isUploading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="mr-2 h-4 w-4" />
                              Replace File
                            </>
                          )}
                        </span>
                      </Button>
                      <Input
                        id="resume-replace"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        className="hidden"
                        onChange={handleUpload}
                        disabled={isUploading}
                      />
                    </label>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
              <h4 className="font-semibold mb-2 text-sm">Tips:</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Keep your resume updated with your latest experience</li>
                <li>Use PDF format for best compatibility</li>
                <li>Ensure file size is under 10MB</li>
                <li>Include your contact information and key achievements</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

