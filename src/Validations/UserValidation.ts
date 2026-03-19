import { z } from "zod";
import { Roles } from "@prisma/client";

const phoneRegex = /^(?:\+62|62|0)8[1-9][0-9]{6,10}$/;

export const createUserSchema = z.object({
  name: z.string().min(1, { message: "Must contain at least 1 character" }),
  phone: z.string().regex(phoneRegex, "Must be a valid Indonesian phone number"),
  email: z.string().email({ message: "Must be a valid email address" }),
  password: z.string().min(6, { message: "Must be at least 6 characters long" }),
  roles: z.array(z.enum([Roles.ADMIN, Roles.USER])).optional(),
  refreshToken: z.string().optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = createUserSchema.partial();

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export const registerUserSchema = createUserSchema.omit({
  roles: true,
  refreshToken: true,
});

export type RegisterUserInput = z.infer<typeof registerUserSchema>;

export const loginUserSchema = registerUserSchema.omit({ name: true }).extend({
  phone: z.string().regex(phoneRegex, "Must be a valid Indonesian phone number"),
  email: z.string().email({ message: "Must be a valid email address" }),
})

export type LoginUserInput = z.infer<typeof loginUserSchema>;
