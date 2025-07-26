import z from "zod";

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, "Name is required")
      .max(50, "Name must be less than 50 characters"),
    email: z.string().min(1, "Email is required").email("Invalid email format"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters long")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    phoneNumber: z
      .string()
      .min(1, "Phone number is required")
      .regex(/^\+?[0-9]{10,15}$/, "Invalid phone number"),
    countryCode: z.string().min(1, "Country code is required"),

    confirmPassword: z.string().min(1, "Confirm Password is required"),
    role: z.enum(["student", "mentor"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
});

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
});

export const MentorProfileSchema = z.object({
  languages: z.array(z.string()).min(1, "At least one language is required"),
  expertise: z.array(z.string()).min(1, "At least one skill is required"),
  links: z
    .array(z.string().url("Invalid URL"))
    .min(1, "At least one link is required"),
  experience: z.string().min(1, "Experience is required"),
});

export const StudentProfileSchema = z.object({
  education: z.string().min(1, "Education is required"),
  skills: z.array(z.string()).min(1, "At least one skill is required"),
  careerGoals: z.string().min(1, "Career goals are required"),
  cvs: z.array(z.any()).min(1, "At least one CV is required"),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(6, "Password must be at least 6 characters long")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    confirmPassword: z.string().min(1, "Confirm Password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const CreateWorkshopSchema = z
  .object({
    title: z
      .string()
      .min(3, "Title is required")
      .max(100, "Title must be less than 100 characters"),
    description: z
      .string()
      .min(10, "Description is required")
      .max(1000, "Description must be less than 1000 characters"),
    date: z.string().min(1, "Date is required"),
    time: z.string().min(1, "Time is required"),
    duration: z.union([
      z.string().min(1, "Duration is required"),
      z.number().min(1, "Duration is required"),
    ]),
    topic: z.string().min(1, "Topic is required"),
    price: z.union([z.string().min(1, "Price is required"), z.number()]),
    language: z.string().min(1, "Language is required"),
    type: z.string().min(1, "Type is required"),
    location: z.string().optional(), // will refine below
    capacity: z.union([
      z.string().min(1, "Capacity is required"),
      z.number().min(1, "Capacity is required"),
    ]),
    image: z.any().optional(),
  })
  .refine(
    (data) => {
      // Location required if type is 'on-site' or 'offline'
      if (data.type === "on-site" || data.type === "offline") {
        return !!data.location && data.location.trim() !== "";
      }
      return true;
    },
    {
      message: "Location is required for offline workshops",
      path: ["location"],
    }
  );
