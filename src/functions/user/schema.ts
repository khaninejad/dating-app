import * as z from 'zod';
export const createUserSchema = {
  type: "object",
  properties: {
    random: { type: 'boolean' },
    name: { type: 'string' },
    email: { type: 'string' },
    password: { type: 'string' },
    gender: { type: 'string' },
    birth_date: { type: 'string' },
    prefer: { type: 'string' }
  },
  required: ['name', 'email', 'password', 'gender', 'birth_date', 'prefer'],
} as const;

export const UserLoginRequest = z.object({
  email: z.string(),
  password: z.string()
});