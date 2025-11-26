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
import { WorkExperience } from "@/types/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { Edit, Plus, Trash2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { experiencesApi } from "@/lib/api/experiences";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/toast";

const experienceSchema = z.object({
  company: z.string().min(2, "Company name must be at least 2 characters"),
  designation: z.string().min(2, "Designation must be at least 2 characters"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  isCurrent: z.boolean(),
  description: z.string().min(10, "Description must be at least 10 characters"),
  location: z.string().optional(),
  // Explicit number schema to ensure correct inference
  displayOrder: z
    .number()
    .int({ message: "Display order must be an integer" })
    .nonnegative({ message: "Display order must be positive" }),
});

type ExperienceFormValues = z.infer<typeof experienceSchema>;

// Helper function to render description with bullet points (using ~~~ as delimiter)
const renderDescription = (description: string) => {
  if (!description) return null;
  
  // Split by ~~~ delimiter
  const bullets = description.split("~~~").map(b => b.trim()).filter(b => b.length > 0);
  
  if (bullets.length === 0) {
    return <span className="text-sm text-wrap break-keep">{description}</span>;
  }
  
  return (
      <ul className="list-none space-y-1 text-sm">
          {bullets.map((bullet, idx) => (
              <li key={idx} className="flex items-start text-wrap break-keep">
                  <span className="text-accent mr-2 shrink-0">•</span>
                  <span className="text-wrap break-all">{bullet}</span>
              </li>
          ))}
      </ul>
  );
};

export default function ExperienceManager() {
  const [experiences, setExperiences] = useState<WorkExperience[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState<WorkExperience | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const userId = user?.id ? Number(user.id) : null;

  const form = useForm<ExperienceFormValues>({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      company: "",
      designation: "",
      startDate: "",
      endDate: "",
      isCurrent: false,
      description: "",
      location: "",
      displayOrder: 0,
    },
  });

  const loadExperiences = useCallback(async () => {
    if (!userId || Number.isNaN(userId)) {
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const response = await experiencesApi.list({ userId });
      setExperiences(response.content);
    } catch (err) {
      console.error("Failed to load experiences:", err);
      setError("Unable to load experiences. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadExperiences();
  }, [loadExperiences]);

  const onSubmit = async (data: ExperienceFormValues) => {
    if (!userId || Number.isNaN(userId)) {
      toast({
        title: "Missing user",
        description: "Unable to detect user ID for experience requests.",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      userId,
      company: data.company,
      designation: data.designation,
      startDate: data.startDate,
      endDate: data.isCurrent ? null : data.endDate || null,
      isCurrent: data.isCurrent,
      description: data.description,
      location: data.location || undefined,
      displayOrder: data.displayOrder,
    };

    try {
      setIsSaving(true);
      let updated: WorkExperience;
      if (editingExperience) {
        updated = await experiencesApi.update(editingExperience.id, payload);
        setExperiences((prev) =>
          prev.map((exp) => (exp.id === editingExperience.id ? updated : exp))
        );
        toast({
          title: "Experience updated",
          description: `${updated.company} was updated successfully.`,
          variant: "success",
        });
      } else {
        updated = await experiencesApi.create(payload);
        setExperiences((prev) => [updated, ...prev]);
        toast({
          title: "Experience added",
          description: `${updated.company} was added successfully.`,
          variant: "success",
        });
      }

      form.reset();
      setIsDialogOpen(false);
      setEditingExperience(null);
    } catch (err) {
      console.error("Failed to save experience:", err);
      toast({
        title: "Save failed",
        description: "Unable to save experience. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (experience: WorkExperience) => {
    setEditingExperience(experience);
    form.reset({
      company: experience.company,
      designation: experience.designation,
      startDate: experience.startDate,
      endDate: experience.endDate || "",
      isCurrent: experience.isCurrent,
      description: experience.description,
      location: experience.location || "",
      displayOrder: experience.displayOrder,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      setDeletingId(id);
      await experiencesApi.delete(id);
      setExperiences((prev) => prev.filter((e) => e.id !== id));
      toast({
        title: "Experience deleted",
        description: "The experience entry has been removed.",
        variant: "success",
      });
    } catch (err) {
      console.error("Failed to delete experience:", err);
      toast({
        title: "Delete failed",
        description: "Unable to delete the selected experience.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleAddNew = () => {
    setEditingExperience(null);
    form.reset({
      company: "",
      designation: "",
      startDate: "",
      endDate: "",
      isCurrent: false,
      description: "",
      location: "",
      displayOrder: 0,
    });
    setIsDialogOpen(true);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      // Reset form when dialog closes
      setEditingExperience(null);
      form.reset();
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
                <CardTitle className="text-xl">Work Experience</CardTitle>
                <CardDescription className="text-xs mt-1">Manage your work experience entries</CardDescription>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
                <DialogTrigger asChild>
                  <Button
                    onClick={handleAddNew}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Experience
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader className="pb-2">
                    <DialogTitle className="text-lg">
                      {editingExperience ? "Edit Experience" : "Add New Experience"}
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                      {editingExperience
                        ? "Update work experience details"
                        : "Add a new work experience entry"}
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="company"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Company</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Company Name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="designation"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Designation</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Job Title" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="startDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Start Date</FormLabel>
                              <FormControl>
                                <Input {...field} type="date" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="endDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>End Date</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="date"
                                  disabled={form.watch("isCurrent")}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="displayOrder"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Display Order</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                placeholder="0"
                                min={0}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="isCurrent"
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
                            <FormLabel>Current Position</FormLabel>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="City, State/Country" />
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
                                placeholder="Achievement 1~~~Achievement 2~~~Achievement 3"
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
                            : editingExperience
                              ? "Update Experience"
                              : "Add Experience"}
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
                    <TableHead className="py-2 text-xs font-medium min-w-[120px]">Company</TableHead>
                    <TableHead className="py-2 text-xs font-medium min-w-[140px] hidden sm:table-cell">Designation</TableHead>
                    <TableHead className="py-2 text-xs font-medium min-w-[200px] max-w-[300px]">Description</TableHead>
                    <TableHead className="py-2 text-xs font-medium min-w-[120px] hidden md:table-cell">Duration</TableHead>
                    <TableHead className="py-2 text-xs font-medium min-w-[100px] hidden lg:table-cell">Location</TableHead>
                    <TableHead className="py-2 text-xs font-medium min-w-[80px] hidden lg:table-cell">Order</TableHead>
                    <TableHead className="py-2 text-xs font-medium text-right min-w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="py-6 text-center text-sm text-muted-foreground">
                          Loading experiences...
                        </TableCell>
                      </TableRow>
                    ) : experiences.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="py-6 text-center text-sm text-muted-foreground">
                          No experiences found. Add your first entry.
                        </TableCell>
                      </TableRow>
                    ) : (
                      experiences.map((experience) => (
                      <motion.tr
                        key={experience.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="border-border/30"
                      >
                        <TableCell className="py-3 font-medium text-sm min-w-[120px]">
                          {experience.company}
                        </TableCell>
                        <TableCell className="py-3 text-sm min-w-[140px] hidden sm:table-cell">{experience.designation}</TableCell>
                        <TableCell className="py-3 min-w-[200px] max-w-[300px]">
                          <div className="text-wrap break-all">
                            {renderDescription(experience.description)}
                          </div>
                        </TableCell>
                        <TableCell className="py-3 text-sm min-w-[120px] hidden md:table-cell">
                          {experience.startDate} -{" "}
                          {experience.isCurrent ? (
                            <span className="text-accent">Present</span>
                          ) : (
                            experience.endDate
                          )}
                        </TableCell>
                        <TableCell className="py-3 text-sm min-w-[100px] hidden lg:table-cell">{experience.location || "—"}</TableCell>
                        <TableCell className="py-3 text-sm min-w-[80px] hidden lg:table-cell">{experience.displayOrder}</TableCell>
                        <TableCell className="py-3 text-right min-w-[100px]">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(experience)}
                              className="h-7 w-7 p-0"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(experience.id)}
                              className="h-7 w-7 p-0"
                              disabled={deletingId === experience.id}
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

