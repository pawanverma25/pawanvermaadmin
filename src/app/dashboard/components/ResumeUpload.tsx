"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, FileText, Download, Trash2, CheckCircle2 } from "lucide-react";

export default function ResumeUpload() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResumeFile(file);
      // Mock upload - in real app, upload to server
      const mockUrl = URL.createObjectURL(file);
      setResumeUrl(mockUrl);
      console.log("Resume uploaded:", file.name);
    }
  };

  const handleDelete = () => {
    if (resumeUrl) {
      URL.revokeObjectURL(resumeUrl);
    }
    setResumeFile(null);
    setResumeUrl(null);
  };

  const handleDownload = () => {
    if (resumeFile && resumeUrl) {
      const link = document.createElement("a");
      link.href = resumeUrl;
      link.download = resumeFile.name;
      link.click();
    }
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
            <CardTitle className="text-xl">Resume Management</CardTitle>
            <CardDescription className="text-xs">
              Upload and manage your resume/CV document
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-3">
            {!resumeUrl ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="border-2 border-dashed border-border/50 rounded-lg p-12 text-center hover:border-accent/50 transition-colors"
              >
                <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Upload Your Resume</h3>
                <p className="text-muted-foreground mb-6">
                  Upload a PDF, DOC, or DOCX file (max 10MB)
                </p>
                <label htmlFor="resume-upload">
                  <Button
                    className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
                    asChild
                  >
                    <span>
                      <Upload className="mr-2 h-4 w-4" />
                      Choose File
                    </span>
                  </Button>
                  <input
                    id="resume-upload"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between p-4 border border-border/50 rounded-lg bg-card/30">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-lg bg-accent/20">
                      <FileText className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">{resumeFile?.name}</h3>
                        <CheckCircle2 className="h-4 w-4 text-accent" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {(resumeFile?.size || 0) / 1024 / 1024} MB
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handleDownload}
                      className="border-accent/50 hover:bg-accent/10 hover:border-accent"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleDelete}
                      className="border-destructive/50 hover:bg-destructive/10 hover:border-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>

                <div className="border-2 border-dashed border-border/50 rounded-lg p-8 text-center hover:border-accent/50 transition-colors">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Replace Resume</h3>
                  <p className="text-muted-foreground mb-4">
                    Upload a new file to replace the current resume
                  </p>
                  <label htmlFor="resume-replace">
                    <Button
                      variant="outline"
                      className="border-accent/50 hover:bg-accent/10 hover:border-accent cursor-pointer"
                      asChild
                    >
                      <span>
                        <Upload className="mr-2 h-4 w-4" />
                        Replace File
                      </span>
                    </Button>
                    <input
                      id="resume-replace"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>
              </motion.div>
            )}

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

