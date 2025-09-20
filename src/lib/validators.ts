// src/lib/validators.ts
import { z } from 'zod'

export const credsSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(8).max(128),
})

export const gardenCreateSchema = z.object({
  title: z.string().min(1).max(120).trim(),
  coverUrl: z.string().url().max(2048),
  dataJson: z.any(), // oder konkretisieren
  isPublic: z.boolean().optional().default(true),
})
