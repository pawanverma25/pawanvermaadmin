"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { motion } from "framer-motion";
import { 
  FileText, 
  Download, 
  Upload, 
  FileCode, 
  Loader2,
  CheckCircle2,
  AlertCircle,
  Settings
} from "lucide-react";

const DEFAULT_LATEX_TEMPLATE = `\\documentclass[11pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage{amsmath}
\\usepackage{amsfonts}
\\usepackage{amssymb}
\\usepackage{graphicx}
\\usepackage{geometry}
\\geometry{margin=1in}

\\begin{document}

\\title{Your Document Title}
\\author{Your Name}
\\date{\\today}
\\maketitle

\\section{Introduction}
This is a sample LaTeX document. You can write your content here.

\\section{Main Content}
\\begin{itemize}
    \\item First item
    \\item Second item
    \\item Third item
\\end{itemize}

\\section{Conclusion}
This is the conclusion of your document.

\\end{document}`;

export default function LaTeXEditor() {
  const [latexCode, setLatexCode] = useState<string>(DEFAULT_LATEX_TEMPLATE);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"success" | "error" | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string>("");
  const [uploadServerUrl, setUploadServerUrl] = useState<string>("");
  const [latexApiUrl, setLatexApiUrl] = useState<string>("");
  const [showSettings, setShowSettings] = useState(false);

  // Generate PDF from LaTeX
  const handleGeneratePDF = async () => {
    if (!latexCode.trim()) {
      setUploadMessage("Please enter some LaTeX code first.");
      setUploadStatus("error");
      return;
    }

    setIsGenerating(true);
    setUploadStatus(null);
    setUploadMessage("");

    try {
      // Option 1: Use external LaTeX compilation API
      if (latexApiUrl) {
        const response = await fetch(latexApiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ latex: latexCode }),
        });

        if (!response.ok) {
          throw new Error("Failed to generate PDF from API");
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
        setIsGenerating(false);
        return;
      }

      // Option 2: Use a client-side LaTeX to PDF service
      // For now, we'll create a mock PDF or use a service
      // In production, you would use a proper LaTeX compilation service
      
      // Example: Using a public LaTeX compilation API (you can replace this)
      const response = await fetch("https://latex.ytotech.com/builds/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resources: [
            {
              content: latexCode,
            },
          ],
        }),
      });

      if (!response.ok) {
        // If the API doesn't work, show instructions
        setUploadMessage(
          "Please configure a LaTeX compilation API endpoint in settings. " +
          "You can use services like Overleaf API, LaTeX.Online, or your own backend."
        );
        setUploadStatus("error");
        setIsGenerating(false);
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (error) {
      console.error("Error generating PDF:", error);
      setUploadMessage(
        "Failed to generate PDF. Please check your LaTeX code for errors or configure a LaTeX compilation API in settings."
      );
      setUploadStatus("error");
    } finally {
      setIsGenerating(false);
    }
  };

  // Upload PDF to external server
  const handleUploadPDF = async () => {
    if (!pdfUrl) {
      setUploadMessage("Please generate a PDF first.");
      setUploadStatus("error");
      return;
    }

    if (!uploadServerUrl) {
      setUploadMessage("Please configure the upload server URL in settings.");
      setUploadStatus("error");
      return;
    }

    setIsUploading(true);
    setUploadStatus(null);
    setUploadMessage("");

    try {
      // Fetch the PDF blob
      const response = await fetch(pdfUrl);
      const blob = await response.blob();

      // Create FormData for file upload
      const formData = new FormData();
      formData.append("file", blob, "document.pdf");
      formData.append("filename", "document.pdf");
      formData.append("contentType", "application/pdf");

      // Upload to external server
      const uploadResponse = await fetch(uploadServerUrl, {
        method: "POST",
        body: formData,
        // Note: Don't set Content-Type header when using FormData
        // The browser will set it automatically with the boundary
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(`Upload failed: ${uploadResponse.status} - ${errorText}`);
      }

      const result = await uploadResponse.json().catch(() => ({
        message: "Upload successful",
      }));

      setUploadMessage(
        result.message || `PDF uploaded successfully to ${uploadServerUrl}`
      );
      setUploadStatus("success");
    } catch (error) {
      console.error("Error uploading PDF:", error);
      setUploadMessage(
        error instanceof Error
          ? error.message
          : "Failed to upload PDF. Please check your server URL and try again."
      );
      setUploadStatus("error");
    } finally {
      setIsUploading(false);
    }
  };

  // Download PDF
  const handleDownloadPDF = () => {
    if (pdfUrl) {
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = "document.pdf";
      link.click();
    }
  };

  // Clear PDF
  const handleClearPDF = () => {
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
    }
    setPdfUrl(null);
    setUploadStatus(null);
    setUploadMessage("");
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
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">LaTeX Editor & PDF Generator</CardTitle>
                <CardDescription className="text-xs">
                  Write LaTeX code, generate PDF, and upload to your server
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
                className="border-accent/50 hover:bg-accent/10 hover:border-accent"
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-3">
            {/* Settings Panel */}
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 bg-muted/30 rounded-lg border border-border/50 space-y-3"
              >
                <div className="space-y-2">
                  <Label htmlFor="latex-api">LaTeX Compilation API URL (Optional)</Label>
                  <Input
                    id="latex-api"
                    type="url"
                    placeholder="https://your-latex-api.com/compile"
                    value={latexApiUrl}
                    onChange={(e) => setLatexApiUrl(e.target.value)}
                    className="bg-background"
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave empty to use default service, or provide your own LaTeX compilation endpoint
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="upload-server">Upload Server URL (Required for upload)</Label>
                  <Input
                    id="upload-server"
                    type="url"
                    placeholder="https://your-server.com/api/upload"
                    value={uploadServerUrl}
                    onChange={(e) => setUploadServerUrl(e.target.value)}
                    className="bg-background"
                  />
                  <p className="text-xs text-muted-foreground">
                    The endpoint where PDFs will be uploaded via HTTP POST
                  </p>
                </div>
              </motion.div>
            )}

            {/* LaTeX Editor */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="latex-editor" className="flex items-center gap-2">
                  <FileCode className="h-4 w-4" />
                  LaTeX Code
                </Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLatexCode(DEFAULT_LATEX_TEMPLATE)}
                  className="text-xs"
                >
                  Reset Template
                </Button>
              </div>
              <Textarea
                id="latex-editor"
                value={latexCode}
                onChange={(e) => setLatexCode(e.target.value)}
                className="font-mono text-sm min-h-[400px] bg-background"
                placeholder="Enter your LaTeX code here..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={handleGeneratePDF}
                disabled={isGenerating || !latexCode.trim()}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Generate PDF
                  </>
                )}
              </Button>

              {pdfUrl && (
                <>
                  <Button
                    variant="outline"
                    onClick={handleDownloadPDF}
                    className="border-accent/50 hover:bg-accent/10 hover:border-accent"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleUploadPDF}
                    disabled={isUploading || !uploadServerUrl}
                    className="border-accent/50 hover:bg-accent/10 hover:border-accent"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload to Server
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleClearPDF}
                    className="border-destructive/50 hover:bg-destructive/10 hover:border-destructive"
                  >
                    Clear PDF
                  </Button>
                </>
              )}
            </div>

            {/* Status Messages */}
            {uploadStatus && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg border ${
                  uploadStatus === "success"
                    ? "bg-green-500/10 border-green-500/50 text-green-600 dark:text-green-400"
                    : "bg-red-500/10 border-red-500/50 text-red-600 dark:text-red-400"
                }`}
              >
                <div className="flex items-center gap-2">
                  {uploadStatus === "success" ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <AlertCircle className="h-5 w-5" />
                  )}
                  <p className="text-sm font-medium">{uploadMessage}</p>
                </div>
              </motion.div>
            )}

            {/* PDF Preview */}
            {pdfUrl && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="border border-border/50 rounded-lg p-4 bg-card/30"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <FileText className="h-5 w-5 text-accent" />
                    Generated PDF Preview
                  </h3>
                  <CheckCircle2 className="h-5 w-5 text-accent" />
                </div>
                <iframe
                  src={pdfUrl}
                  className="w-full h-[600px] border border-border/30 rounded"
                  title="PDF Preview"
                />
              </motion.div>
            )}

            {/* Help Section */}
            <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
              <h4 className="font-semibold mb-2 text-sm">Tips:</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Configure your upload server URL in settings before uploading</li>
                <li>Use a LaTeX compilation API if the default service doesn&apos;t work</li>
                <li>Check your LaTeX syntax - common errors include missing backslashes and unclosed environments</li>
                <li>The PDF will be uploaded as a multipart/form-data file named &quot;document.pdf&quot;</li>
                <li>Your server should accept POST requests with Content-Type: multipart/form-data</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

