export default {
  type: "object",
  properties: {
    name: { type: 'string' },
    email: { type: 'string' },
    password: { type: 'string' },
    gender: { type: 'string' },
    birth_date: { type: 'string' }
  },
  required: ['name', 'email', 'password', 'gender', 'birth_date'],
} as const;
