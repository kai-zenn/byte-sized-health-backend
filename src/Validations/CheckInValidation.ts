import { z } from 'zod';

export const createCheckInSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)').optional(),
  sleepHours: z.number().min(0).max(24, 'Sleep hours must be between 0-24'),
  workHours: z.number().min(0).max(24, 'Work hours must be between 0-24'),
  moodLevel: z.number().int().min(1).max(10, 'Mood level must be between 1-10'),
  stressLevel: z.number().int().min(1).max(10, 'Stress level must be between 1-10'),
  activityMinutes: z.number().min(0).max(1440, 'Activity minutes must be between 0-1440').default(0),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
});

export const updateCheckInSchema = createCheckInSchema.partial();

export type CreateCheckInInput = z.infer<typeof createCheckInSchema>;
export type UpdateCheckInInput = z.infer<typeof updateCheckInSchema>;
