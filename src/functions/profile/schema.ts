import * as z from 'zod';

export const GetProfileRequest = z.object({
  user_id: z.string(),
});