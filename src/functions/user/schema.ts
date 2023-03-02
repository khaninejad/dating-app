export default {
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
