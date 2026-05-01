'use strict';

const { z } = require('zod');

const signupSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['Admin', 'Member']).optional().default('Member'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const projectSchema = z.object({
  name: z.string().min(2).max(200),
  description: z.string().max(2000).optional(),
});

const taskSchema = z.object({
  title: z.string().min(2).max(300),
  description: z.string().max(5000).optional(),
  status: z.enum(['Todo', 'In-Progress', 'Done']).optional().default('Todo'),
  priority: z.enum(['Low', 'Medium', 'High']).optional().default('Medium'),
  due_date: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional().nullable(),
  assigned_to_id: z.string().uuid().optional().nullable(),
});

const taskStatusSchema = z.object({
  status: z.enum(['Todo', 'In-Progress', 'Done']),
});

/**
 * validate(schema) — Zod validation middleware factory.
 * Parses req.body against the schema and attaches the parsed result
 * back to req.body (coercion applied). Throws ZodError on failure.
 */
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed.',
      errors: result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }
  req.body = result.data;
  next();
};

module.exports = { signupSchema, loginSchema, projectSchema, taskSchema, taskStatusSchema, validate };
