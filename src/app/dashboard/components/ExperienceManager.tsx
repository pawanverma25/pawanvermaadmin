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
import { WorkExperience } from "@/types/portfolio";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { Edit, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const experienceSchema = z.object({
  company: z.string().min(2, "Company name must be at least 2 characters"),
  position: z.string().min(2, "Position must be at least 2 characters"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  current: z.boolean(),
  description: z.string().min(10, "Description must be at least 10 characters"),
  location: z.string().optional(),
});

type ExperienceFormValues = z.infer<typeof experienceSchema>;

const initialExperiences: WorkExperience[] = [
  {
    id: "1",
    company: "Tech Corp",
    position: "Senior Software Engineer",
    startDate: "2022-01",
    endDate: "2024-12",
    current: false,
    description: "Led development of multiple web applications using React and Node.js~~~Improved application performance by 40%~~~Mentored junior developers and conducted code reviews~~~Collaborated with cross-functional teams to deliver features",
    location: "San Francisco, CA",
  },
  {
    id: "2",
    company: "StartupXYZ",
    position: "Full Stack Developer",
    startDate: "2024-01",
    current: true,
    description: "Building scalable web applications~~~Managing a team of 5 developers~~~Implementing CI/CD pipelines~~~Designing system architecture",
    location: "Remote",
  },
];

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
  const [experiences, setExperiences] = useState<WorkExperience[]>(initialExperiences);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState<WorkExperience | null>(null);

  const form = useForm<ExperienceFormValues>({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      company: "",
      position: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
      location: "",
    },
  });

  const onSubmit = (data: ExperienceFormValues) => {
    const experienceData: WorkExperience = {
      id: editingExperience?.id || crypto.randomUUID(),
      company: data.company,
      position: data.position,
      startDate: data.startDate,
      endDate: data.current ? undefined : data.endDate,
      current: data.current,
      description: data.description,
      location: data.location || undefined,
    };

    if (editingExperience) {
      setExperiences(
        experiences.map((e) => (e.id === editingExperience.id ? experienceData : e))
      );
    } else {
      setExperiences([...experiences, experienceData]);
    }

    form.reset();
    setIsDialogOpen(false);
    setEditingExperience(null);
  };

  const handleEdit = (experience: WorkExperience) => {
    setEditingExperience(experience);
    form.reset({
      company: experience.company,
      position: experience.position,
      startDate: experience.startDate,
      endDate: experience.endDate || "",
      current: experience.current,
      description: experience.description,
      location: experience.location || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setExperiences(experiences.filter((e) => e.id !== id));
  };

  const handleAddNew = () => {
    setEditingExperience(null);
    form.reset({
      company: "",
      position: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
      location: "",
    });
    setIsDialogOpen(true);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      // Reset form when dialog closes
      setEditingExperience(null);
      form.reset({
        company: "",
        position: "",
        startDate: "",
        endDate: "",
        current: false,
        description: "",
        location: "",
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
                          name="position"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Position</FormLabel>
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
                                <Input {...field} type="month" />
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
                                  type="month"
                                  disabled={form.watch("current")}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="current"
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
                          className="bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                          {editingExperience ? "Update" : "Add"} Experience
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
                    <TableHead className="py-2 text-xs font-medium min-w-[120px]">Company</TableHead>
                    <TableHead className="py-2 text-xs font-medium min-w-[140px] hidden sm:table-cell">Position</TableHead>
                    <TableHead className="py-2 text-xs font-medium min-w-[200px] max-w-[300px]">Description</TableHead>
                    <TableHead className="py-2 text-xs font-medium min-w-[120px] hidden md:table-cell">Duration</TableHead>
                    <TableHead className="py-2 text-xs font-medium min-w-[100px] hidden lg:table-cell">Location</TableHead>
                    <TableHead className="py-2 text-xs font-medium text-right min-w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {experiences.map((experience) => (
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
                        <TableCell className="py-3 text-sm min-w-[140px] hidden sm:table-cell">{experience.position}</TableCell>
                        <TableCell className="py-3 min-w-[200px] max-w-[300px]">
                          <div className="text-wrap break-all">
                            {renderDescription(experience.description)}
                          </div>
                        </TableCell>
                        <TableCell className="py-3 text-sm min-w-[120px] hidden md:table-cell">
                          {experience.startDate} -{" "}
                          {experience.current ? (
                            <span className="text-accent">Present</span>
                          ) : (
                            experience.endDate
                          )}
                        </TableCell>
                        <TableCell className="py-3 text-sm min-w-[100px] hidden lg:table-cell">{experience.location || "—"}</TableCell>
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

