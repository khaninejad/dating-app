import * as z from 'zod';
export const UserCreateRequest = z.object({
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


export const UserLoginRequest = z.object({
  email: z.string(),
  password: z.string()
});

