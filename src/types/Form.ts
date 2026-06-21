import { z } from 'zod';

export const MetaSchema = z.object({
    display_name: z.string(),
    description: z.string().optional(),
    updated_at: z.string(),
    created_at: z.string(),
    form_su: z.enum(['template', 'normal']),
    thumbnail_url:z.string().optional(),
    published:z.boolean().optional()
});

export const SettingsSchema = z.object({
    form_su: z.enum(['template', 'normal']),
    description: z.string().optional(),
    thumbnail_url:z.string().optional(),
    published:z.boolean().optional()
});

export const FormSuSchema = z.object({
  display: z.enum(['form', 'wizard']),
  meta: MetaSchema,
  components: z.array(z.record(z.string(), z.any())).min(1, "Components cannot be empty"), 
});

export const TemplateSuSchema = z.object({
    template_id:z.string(),
    form: FormSuSchema
})

export const FeedbackFormSchema = z.object({
    email: z.string().optional(),
    feedback: z.string(),
    updated_at: z.string(),
    created_at: z.string()
});

export type Meta = z.infer<typeof MetaSchema>;
export type FormSu = z.infer<typeof FormSuSchema>;
export type TemplateSu = z.infer<typeof TemplateSuSchema>;
export type FeedbackSu = z.infer<typeof FeedbackFormSchema>;
export interface FileContent {
  name: string;
  fullPath: string;
  content: Record<string, unknown> | null;
}
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};