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
import { Project } from "@/types/portfolio";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { Edit, ExternalLink, Github, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const projectSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  techStack: z.string().min(1, "Please enter at least one technology"),
  githubLink: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  liveLink: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  image: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  featured: z.boolean(),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

const initialProjects: Project[] = [
  {
    id: "1",
    title: "E-Commerce Platform",
    description: "Full-stack e-commerce platform~~~Payment integration with Stripe~~~User authentication and authorization~~~Product catalog management",
    techStack: ["React", "Node.js", "MongoDB", "Stripe"],
    githubLink: "https://github.com/example/ecommerce",
    liveLink: "https://ecommerce.example.com",
    featured: true,
  },
  {
    id: "2",
    title: "Task Management App",
    description: "Collaborative task management~~~Real-time updates~~~Team collaboration features",
    techStack: ["Next.js", "TypeScript", "Prisma"],
    githubLink: "https://github.com/example/tasks",
    featured: false,
  },
];

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
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      description: "",
      techStack: "",
      githubLink: "",
      liveLink: "",
      image: "",
      featured: false,
    },
  });

  const onSubmit = (data: ProjectFormValues) => {
    const techStackArray = data.techStack.split(",").map((tech) => tech.trim());
    const projectData: Project = {
      id: editingProject?.id || crypto.randomUUID(),
      title: data.title,
      description: data.description,    //TODO: Add validation for description  
      techStack: techStackArray,
      githubLink: data.githubLink || undefined, //TODO: Add validation for githubLink
      liveLink: data.liveLink || undefined, //TODO: Add validation for liveLink
      image: data.image || undefined, //TODO: Add validation for image
      featured: data.featured,
    };

    if (editingProject) {
      setProjects(projects.map((p) => (p.id === editingProject.id ? projectData : p)));
    } else {
      setProjects([...projects, projectData]);
    }

    form.reset();
    setIsDialogOpen(false);
    setEditingProject(null);
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    form.reset({
      title: project.title,
      description: project.description,
      techStack: project.techStack.join(", "),
      githubLink: project.githubLink || "",
      liveLink: project.liveLink || "",
      image: project.image || "",
      featured: project.featured,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setProjects(projects.filter((p) => p.id !== id));
  };

  const handleAddNew = () => {
    setEditingProject(null);
    form.reset({
      title: "",
      description: "",
      techStack: "",
      githubLink: "",
      liveLink: "",
      image: "",
      featured: false,
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
        image: "",
        featured: false,
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
                        name="techStack"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tech Stack (comma-separated)</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="React, Node.js, MongoDB"
                              />
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
                        name="image"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Image URL</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="https://example.com/image.jpg" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
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
                          className="bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                          {editingProject ? "Update" : "Add"} Project
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="pt-3">
            <div className="rounded border border-border/30 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/30">
                    <TableHead className="py-2 text-xs font-medium min-w-[120px]">Title</TableHead>
                    <TableHead className="py-2 text-xs font-medium min-w-[200px] max-w-[300px]">Description</TableHead>
                    <TableHead className="py-2 text-xs font-medium min-w-[150px] hidden md:table-cell">Tech Stack</TableHead>
                    <TableHead className="py-2 text-xs font-medium min-w-[80px] hidden sm:table-cell">Links</TableHead>
                    <TableHead className="py-2 text-xs font-medium text-right min-w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {projects.map((project) => (
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
                        <TableCell className="py-3 min-w-[150px] hidden md:table-cell">
                          <div className="flex flex-wrap gap-1">
                            {project.techStack.map((tech, idx) => (
                              <span
                                key={idx}
                                className="px-1.5 py-0.5 text-xs rounded bg-accent/10 text-accent border border-accent/20 whitespace-nowrap"
                              >
                                {tech}
                              </span>
                            ))}
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
                            >
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
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

