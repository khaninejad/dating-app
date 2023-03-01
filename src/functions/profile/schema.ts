export default {
  type: "object",
  properties: {
    user_id: { type: 'string' },
  },
  required: ['user_id'],
} as const;
