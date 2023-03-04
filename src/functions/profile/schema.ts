export default {
  type: "object",
  properties: {
    user_id: { type: 'string' },
  },
  required: ['user_id'],
} as const;

import * as z from 'zod';

export const GetProfileRequest = z.object({
  user_id: z.string(),
});