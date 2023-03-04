import * as z from 'zod';

export const UserSwipeRequest = z.object({
  user_id: z.string(),
  profile_id: z.string(),
  preference: z.enum(["YES", "NO"]),
});

export interface UserSwipeDto {
  user_id: string;
  profile_id: string;
  preference: string;
}