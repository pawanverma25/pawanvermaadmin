"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Project } from "@/types/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { Edit, ExternalLink, Github, Plus, Trash2, Star } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { projectsApi } from "@/lib/api/projects";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/toast";

const projectSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  techStack: z.string().min(3).refine((value) => value.split(",").length >= 1, {
    message: "Please enter at least one technology",
  }),
  description: z.string().min(10, "Description must be at least 10 characters"),
  githubLink: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  liveLink: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  featured: z.boolean(),
  // Explicit number schema to align with resolver expectations
  displayOrder: z
    .number()
    .int({ message: "Display order must be an integer" })
    .nonnegative({ message: "Display order must be positive" }),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

// Helper function to render description with bullet points (using ~~~ as delimiter)
const renderDescription = (description: string) => {
  if (!description) return null;
  
  // Split by ~~~ delimiter
  const bullets = description.split("~~~").map(b => b.trim()).filter(b => b.length > 0);
  
  if (bullets.length === 0) {
    return <span className="text-sm text-wrap break-all">{description}</span>;
  }
  
  return (
    <ul className="list-none space-y-1 text-sm">
      {bullets.map((bullet, idx) => (
        <li key={idx} className="flex items-start text-wrap break-all">
          <span className="text-accent mr-2 shrink-0">•</span>
          <span className="text-wrap break-all">{bullet}</span>
        </li>
      ))}
    </ul>
  );
};

export default function ProjectsManager() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const userId = user?.id ? Number(user.id) : null;

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      description: "",
      techStack: "",
      githubLink: "",
      liveLink: "",
      featured: false,
      displayOrder: 0,
    },
  });

  const loadProjects = useCallback(async () => {
    if (!userId || Number.isNaN(userId)) {
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const response = await projectsApi.list({ userId });
      setProjects(response.content);
    } catch (err) {
      console.error("Failed to load projects:", err);
      setError("Unable to load projects. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const onSubmit = async (data: ProjectFormValues) => {
    if (!userId || Number.isNaN(userId)) {
      toast({
        title: "Missing user",
        description: "Unable to detect user ID for project requests.",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      userId,
      title: data.title,
      description: data.description,
      githubLink: data.githubLink || undefined,
      liveLink: data.liveLink || undefined,
      featured: data.featured,
      displayOrder: data.displayOrder,
    };

    try {
      setIsSaving(true);
      let updated: Project;
      if (editingProject) {
        updated = await projectsApi.update(editingProject.id, payload);
        setProjects((prev) =>
          prev.map((project) => (project.id === editingProject.id ? updated : project))
        );
        toast({
          title: "Project updated",
          description: `${updated.title} was updated successfully.`,
          variant: "success",
        });
      } else {
        updated = await projectsApi.create(payload);
        setProjects((prev) => [updated, ...prev]);
        toast({
          title: "Project added",
          description: `${updated.title} was added successfully.`,
          variant: "success",
        });
      }

      form.reset();
      setIsDialogOpen(false);
      setEditingProject(null);
    } catch (err) {
      console.error("Failed to save project:", err);
      toast({
        title: "Save failed",
        description: "Unable to save project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    form.reset({
      title: project.title,
      description: project.description,
      githubLink: project.githubLink || "",
      liveLink: project.liveLink || "",
      featured: project.featured,
      displayOrder: project.displayOrder,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      setDeletingId(id);
      await projectsApi.delete(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      toast({
        title: "Project deleted",
        description: "The project has been removed.",
        variant: "success",
      });
    } catch (err) {
      console.error("Failed to delete project:", err);
      toast({
        title: "Delete failed",
        description: "Unable to delete the selected project.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleAddNew = () => {
    setEditingProject(null);
    form.reset({
      title: "",
      description: "",
      githubLink: "",
      liveLink: "",
      featured: false,
      displayOrder: 0,
    });
    setIsDialogOpen(true);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      // Reset form when dialog closes
      setEditingProject(null);
      form.reset({
        title: "",
        description: "",
        techStack: "",
        githubLink: "",
        liveLink: "",
        featured: false,
        displayOrder: 0,
      });
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
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Projects</CardTitle>
                <CardDescription className="text-xs mt-1">Manage your portfolio projects</CardDescription>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
                <DialogTrigger asChild>
                  <Button
                    onClick={handleAddNew}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Project
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader className="pb-2">
                    <DialogTitle className="text-lg">
                      {editingProject ? "Edit Project" : "Add New Project"}
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                      {editingProject
                        ? "Update project details"
                        : "Add a new project to your portfolio"}
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Project Title" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder="Feature 1~~~Feature 2~~~Feature 3"
                                rows={6}
                                className="font-mono text-sm"
                              />
                            </FormControl>
                            <p className="text-xs text-muted-foreground">
                              Use ~~~ to separate bullet points. Each item separated by ~~~ will be displayed as a bullet point.
                            </p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                      name="displayOrder"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Display Order</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" min={0} placeholder="0" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="githubLink"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>GitHub Link</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="https://github.com/..." />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="liveLink"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Live Demo Link</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="https://example.com" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                      <FormField
                        control={form.control}
                        name="featured"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                className="h-4 w-4 rounded border-gray-300"
                              />
                            </FormControl>
                            <FormLabel>Featured Project</FormLabel>
                          </FormItem>
                        )}
                      />
                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                        disabled={isSaving}
                          className="bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                        {isSaving
                          ? "Saving..."
                          : editingProject
                            ? "Update Project"
                            : "Add Project"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="pt-3">
          {error && (
            <div className="mb-3 rounded border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
            <div className="rounded border border-border/30 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/30">
                    <TableHead className="py-2 text-xs font-medium min-w-[120px]">Title</TableHead>
                    <TableHead className="py-2 text-xs font-medium min-w-[200px] max-w-[300px]">Description</TableHead>
                    <TableHead className="py-2 text-xs font-medium min-w-[80px] hidden sm:table-cell">Links</TableHead>
                  <TableHead className="py-2 text-xs font-medium min-w-[80px] hidden md:table-cell">Featured</TableHead>
                  <TableHead className="py-2 text-xs font-medium min-w-[80px] hidden lg:table-cell">Order</TableHead>
                    <TableHead className="py-2 text-xs font-medium text-right min-w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-6 text-center text-sm text-muted-foreground">
                        Loading projects...
                      </TableCell>
                    </TableRow>
                  ) : projects.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-6 text-center text-sm text-muted-foreground">
                        No projects found. Add your first project.
                      </TableCell>
                    </TableRow>
                  ) : (
                    projects.map((project) => (
                      <motion.tr
                        key={project.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="border-border/30"
                      >
                        <TableCell className="py-3 font-medium text-sm min-w-[120px]">{project.title}</TableCell>
                        <TableCell className="py-3 min-w-[200px] max-w-[300px]">
                          <div className="text-wrap break-all">
                            {renderDescription(project.description)}
                          </div>
                        </TableCell>
                        <TableCell className="py-3 min-w-[80px] hidden sm:table-cell">
                          <div className="flex gap-2">
                            {project.githubLink && (
                              <a
                                href={project.githubLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-accent hover:text-accent/80 transition-colors"
                              >
                                <Github className="h-4 w-4" />
                              </a>
                            )}
                            {project.liveLink && (
                              <a
                                href={project.liveLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-accent hover:text-accent/80 transition-colors"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-3 min-w-[80px] hidden md:table-cell">
                          {project.featured ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-accent/30 px-2 py-0.5 text-xs text-accent">
                              <Star className="h-3 w-3" />
                              Featured
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="py-3 min-w-[80px] hidden lg:table-cell">
                          {project.displayOrder}
                        </TableCell>
                        <TableCell className="py-3 text-right min-w-[100px]">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(project)}
                              className="h-7 w-7 p-0"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(project.id)}
                              className="h-7 w-7 p-0"
                              disabled={deletingId === project.id}
                            >
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))
                  )}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

