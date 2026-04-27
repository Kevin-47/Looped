"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTrigger, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { workspaceSchema, WorkspaceSchemaType } from "@/app/schemas/workspace";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";
import { toast } from "sonner";

export function CreateWorkspace() {
    const [open, setOpen] = useState(false);
    const queryClient = useQueryClient();

    const form = useForm<WorkspaceSchemaType>({
        resolver: zodResolver(workspaceSchema),
        defaultValues: {
            name: "",
        },
    });

    const createWorkspaceMutation = useMutation({
        ...orpc.workspace.create.mutationOptions(),
        onSuccess: (newWorkspace) => {
            toast.success(`Workspace "${newWorkspace.workspaceName}" created successfully!`);
            queryClient.invalidateQueries({
                queryKey: orpc.workspace.list.queryKey(),
            });
            form.reset();
            setOpen(false);
        },
        onError: (error: any) => {
            // I thought this would work not sure (kevingeorge)
            // to handle orpc defined errors
            if (error?.code === "RATE_LIMITED") {
                toast.error("You're doing that too fast. Please wait.");
                return;
            }
            toast.error(error?.message ?? "Failed to create workspace, try again!");
        },
    });

    function onSubmit(values: WorkspaceSchemaType) {
        createWorkspaceMutation.mutate(values);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <DialogTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-12 border border-dashed border-muted-foreground/50 text-muted-foreground hover:border-muted-foreground hover:rounded-lg transition-all duration-200"
                        >
                            <PlusIcon className="size-5" />
                        </Button>
                    </DialogTrigger>
                </TooltipTrigger>
                <TooltipContent side="right">
                    <p>Create Workspace</p>
                </TooltipContent>
            </Tooltip>

            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create Workspace</DialogTitle>
                    <DialogDescription>
                        Create a new workspace to get started
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="My Workspace"
                                            disabled={createWorkspaceMutation.isPending}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button
                            type="submit"
                            disabled={createWorkspaceMutation.isPending}
                            className="w-full"
                        >
                            {createWorkspaceMutation.isPending ? "Creating..." : "Create Workspace"}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}