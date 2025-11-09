import z from "zod";

export const loginFormSchema = z.object({
    username: z
        .string()
        .min(2, {
            message: "Username must be at least 2 characters.",
        })
        .max(50, {
            message: "Username cannot be longer than 50 characters.",
        }),
    password: z.string().nonoptional({ message: "Password is required." }),
});
