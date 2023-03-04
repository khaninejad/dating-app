import * as z from 'zod';
export const UserCreateRequest = z.object({
  random: z.boolean(),
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
  gender: z.enum(["male", "female"]),
  birth_date: z.string(),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
});


export const createUserSchema = {
  type: "object",
  properties: {
    random: { type: 'boolean' },
    name: { type: 'string' },
    email: { type: 'string' },
    password: { type: 'string' },
    gender: { type: 'string' },
    birth_date: { type: 'string' },
  },
  required: ['name', 'email', 'password', 'gender', 'birth_date', 'prefer'],
} as const;

export const UserLoginRequest = z.object({
  email: z.string(),
  password: z.string()
});

