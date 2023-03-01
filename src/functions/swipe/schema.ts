export default {
  type: "object",
  properties: {
    user_id: { type: 'string' },
    profile_id: { type: 'string' },
    preference: { type: 'string' },
  },
  required: ['user_id'],
} as const;
