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
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Education } from "@/types/api";
import { educationsApi } from "@/lib/api/educations";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/toast";

const educationSchema = z.object({
  institution: z.string().min(2, "Institution name must be at least 2 characters"),
  degree: z.string().min(2, "Degree must be at least 2 characters"),
  field: z.string().min(2, "Field of study must be at least 2 characters"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  isCurrent: z.boolean().default(false),
  description: z.string().optional(),
  location: z.string().optional(),
  displayOrder: z.coerce
    .number({
      required_error: "Display order is required",
      invalid_type_error: "Display order must be a number",
    })
    .int("Display order must be an integer")
    .nonnegative("Display order must be positive"),
});

type EducationFormValues = z.infer<typeof educationSchema>;

export default function EducationManager() {
  const [educations, setEducations] = useState<Education[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEducation, setEditingEducation] = useState<Education | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const userId = user?.id ? Number(user.id) : null;

  const form = useForm<EducationFormValues>({
    resolver: zodResolver(educationSchema),
    defaultValues: {
      institution: "",
      degree: "",
      field: "",
      startDate: "",
      endDate: "",
      isCurrent: false,
      description: "",
      location: "",
      displayOrder: 0,
    },
  });

  const loadEducations = useCallback(async () => {
    if (!userId || Number.isNaN(userId)) {
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const response = await educationsApi.list({ userId });
      setEducations(response.content);
    } catch (err) {
      console.error("Failed to load educations:", err);
      setError("Unable to load education entries. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadEducations();
  }, [loadEducations]);

  const onSubmit = async (data: EducationFormValues) => {
    if (!userId || Number.isNaN(userId)) {
      toast({
        title: "Missing user",
        description: "Unable to detect user ID for education requests.",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      userId,
      institution: data.institution,
      degree: data.degree,
      field: data.field,
      startDate: data.startDate,
      endDate: data.isCurrent ? null : data.endDate || null,
      isCurrent: data.isCurrent,
      description: data.description || undefined,
      location: data.location || undefined,
      displayOrder: data.displayOrder,
    };

    try {
      setIsSaving(true);
      let updated: Education;
      if (editingEducation) {
        updated = await educationsApi.update(editingEducation.id, payload);
        setEducations((prev) =>
          prev.map((edu) => (edu.id === editingEducation.id ? updated : edu))
        );
        toast({
          title: "Education updated",
          description: `${updated.institution} was updated successfully.`,
          variant: "success",
        });
      } else {
        updated = await educationsApi.create(payload);
        setEducations((prev) => [updated, ...prev]);
        toast({
          title: "Education added",
          description: `${updated.institution} was added successfully.`,
          variant: "success",
        });
      }

      form.reset();
      setIsDialogOpen(false);
      setEditingEducation(null);
    } catch (err) {
      console.error("Failed to save education:", err);
      toast({
        title: "Save failed",
        description: "Unable to save education entry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (education: Education) => {
    setEditingEducation(education);
    form.reset({
      institution: education.institution,
      degree: education.degree,
      field: education.field,
      startDate: education.startDate,
      endDate: education.endDate || "",
      isCurrent: education.isCurrent,
      description: education.description || "",
      location: education.location || "",
      displayOrder: education.displayOrder,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      setDeletingId(id);
      await educationsApi.delete(id);
      setEducations((prev) => prev.filter((e) => e.id !== id));
      toast({
        title: "Education deleted",
        description: "The education entry has been removed.",
        variant: "success",
      });
    } catch (err) {
      console.error("Failed to delete education:", err);
      toast({
        title: "Delete failed",
        description: "Unable to delete the selected education entry.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleAddNew = () => {
    setEditingEducation(null);
    form.reset();
    setIsDialogOpen(true);
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
                <CardTitle className="text-xl">Education</CardTitle>
                <CardDescription className="text-xs mt-1">Manage your education entries</CardDescription>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    onClick={handleAddNew}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Education
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader className="pb-2">
                    <DialogTitle className="text-lg">
                      {editingEducation ? "Edit Education" : "Add New Education"}
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                      {editingEducation
                        ? "Update education details"
                        : "Add a new education entry"}
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                      <FormField
                        control={form.control}
                        name="institution"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Institution</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="University Name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="degree"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Degree</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Bachelor of Science" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="field"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Field of Study</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Computer Science" />
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
                                min={0}
                                placeholder="0"
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
                            <FormLabel>Currently Enrolled</FormLabel>
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
                            <FormLabel>Description (Optional)</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder="Additional details about your education..."
                                rows={3}
                              />
                            </FormControl>
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
                            : editingEducation
                              ? "Update Education"
                              : "Add Education"}
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
                    <TableHead className="py-2 text-xs font-medium min-w-[150px]">Institution</TableHead>
                    <TableHead className="py-2 text-xs font-medium min-w-[120px] hidden sm:table-cell">Degree</TableHead>
                    <TableHead className="py-2 text-xs font-medium min-w-[120px] hidden md:table-cell">Field</TableHead>
                    <TableHead className="py-2 text-xs font-medium min-w-[120px]">Duration</TableHead>
                    <TableHead className="py-2 text-xs font-medium min-w-[120px] hidden lg:table-cell">Location</TableHead>
                    <TableHead className="py-2 text-xs font-medium min-w-[80px] hidden lg:table-cell">Order</TableHead>
                    <TableHead className="py-2 text-xs font-medium text-right min-w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="py-6 text-center text-sm text-muted-foreground">
                          Loading education entries...
                        </TableCell>
                      </TableRow>
                    ) : educations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="py-6 text-center text-sm text-muted-foreground">
                          No education entries found. Add your first entry.
                        </TableCell>
                      </TableRow>
                    ) : (
                      educations.map((education) => (
                      <motion.tr
                        key={education.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="border-border/30"
                      >
                        <TableCell className="py-3 font-medium text-sm min-w-[150px] break-words">
                          {education.institution}
                        </TableCell>
                        <TableCell className="py-3 text-sm min-w-[120px] hidden sm:table-cell break-words">{education.degree}</TableCell>
                        <TableCell className="py-3 text-sm min-w-[120px] hidden md:table-cell break-words">{education.field}</TableCell>
                        <TableCell className="py-3 text-sm min-w-[120px]">
                          {education.startDate} -{" "}
                          {education.isCurrent ? (
                            <span className="text-accent">Present</span>
                          ) : (
                            education.endDate
                          )}
                        </TableCell>
                        <TableCell className="py-3 text-sm min-w-[120px] hidden lg:table-cell">
                          {education.location || "—"}
                        </TableCell>
                        <TableCell className="py-3 text-sm min-w-[80px] hidden lg:table-cell">
                          {education.displayOrder}
                        </TableCell>
                        <TableCell className="py-3 text-right min-w-[100px]">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(education)}
                              className="h-7 w-7 p-0"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(education.id)}
                              className="h-7 w-7 p-0"
                              disabled={deletingId === education.id}
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

