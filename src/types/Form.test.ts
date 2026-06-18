import { describe, it, expect } from 'vitest';
import {
  MetaSchema,
  SettingsSchema,
  FormSuSchema,
  TemplateSuSchema,
  type Meta,
  type FormSu,
  type TemplateSu,
} from '../types/Form';

describe('Form Types and Validation', () => {
  describe('MetaSchema', () => {
    it('should validate correct meta object', () => {
      const validMeta = {
        display_name: 'Contact Form',
        description: 'A simple contact form',
        updated_at: '2024-01-01T00:00:00Z',
        created_at: '2024-01-01T00:00:00Z',
        form_su: 'normal' as const,
        thumbnail_url: 'https://example.com/thumb.png',
        published: true,
      };

      const result = MetaSchema.safeParse(validMeta);
      expect(result.success).toBe(true);
    });

    it('should require display_name', () => {
      const invalidMeta = {
        description: 'A simple contact form',
        updated_at: '2024-01-01T00:00:00Z',
        created_at: '2024-01-01T00:00:00Z',
        form_su: 'normal' as const,
      };

      const result = MetaSchema.safeParse(invalidMeta);
      expect(result.success).toBe(false);
    });

    it('should require updated_at and created_at', () => {
      const invalidMeta = {
        display_name: 'Contact Form',
        form_su: 'normal' as const,
      };

      const result = MetaSchema.safeParse(invalidMeta);
      expect(result.success).toBe(false);
    });

    it('should validate form_su enum values', () => {
      const validTemplate = {
        display_name: 'Template',
        updated_at: '2024-01-01T00:00:00Z',
        created_at: '2024-01-01T00:00:00Z',
        form_su: 'template' as const,
      };

      const result = MetaSchema.safeParse(validTemplate);
      expect(result.success).toBe(true);
    });

    it('should reject invalid form_su values', () => {
      const invalidMeta = {
        display_name: 'Contact Form',
        updated_at: '2024-01-01T00:00:00Z',
        created_at: '2024-01-01T00:00:00Z',
        form_su: 'invalid' as any,
      };

      const result = MetaSchema.safeParse(invalidMeta);
      expect(result.success).toBe(false);
    });

    it('should make optional fields truly optional', () => {
      const minimalMeta = {
        display_name: 'Simple Form',
        updated_at: '2024-01-01T00:00:00Z',
        created_at: '2024-01-01T00:00:00Z',
        form_su: 'normal' as const,
      };

      const result = MetaSchema.safeParse(minimalMeta);
      expect(result.success).toBe(true);
    });
  });

  describe('SettingsSchema', () => {
    it('should validate settings object', () => {
      const validSettings = {
        form_su: 'normal' as const,
        description: 'Form settings',
        thumbnail_url: 'https://example.com/thumb.png',
        published: true,
      };

      const result = SettingsSchema.safeParse(validSettings);
      expect(result.success).toBe(true);
    });

    it('should require form_su', () => {
      const invalidSettings = {
        description: 'Form settings',
        published: true,
      };

      const result = SettingsSchema.safeParse(invalidSettings);
      expect(result.success).toBe(false);
    });

    it('should allow minimal settings', () => {
      const minimalSettings = {
        form_su: 'template' as const,
      };

      const result = SettingsSchema.safeParse(minimalSettings);
      expect(result.success).toBe(true);
    });

    it('should validate form_su enum in settings', () => {
      const validSettings = {
        form_su: 'template' as const,
        description: 'Template settings',
      };

      const result = SettingsSchema.safeParse(validSettings);
      expect(result.success).toBe(true);
    });

    it('should reject invalid form_su in settings', () => {
      const invalidSettings = {
        form_su: 'unknown' as any,
      };

      const result = SettingsSchema.safeParse(invalidSettings);
      expect(result.success).toBe(false);
    });
  });

  describe('FormSuSchema', () => {
    it('should validate complete form object', () => {
      const validForm: FormSu = {
        display: 'form',
        meta: {
          display_name: 'Contact Form',
          description: 'A contact form',
          updated_at: '2024-01-01T00:00:00Z',
          created_at: '2024-01-01T00:00:00Z',
          form_su: 'normal',
        },
        components: [
          {
            type: 'textfield',
            label: 'Name',
            key: 'name',
          },
        ],
      };

      const result = FormSuSchema.safeParse(validForm);
      expect(result.success).toBe(true);
    });

    it('should require components array', () => {
      const invalidForm = {
        display: 'form',
        meta: {
          display_name: 'Contact Form',
          updated_at: '2024-01-01T00:00:00Z',
          created_at: '2024-01-01T00:00:00Z',
          form_su: 'normal',
        },
        components: [],
      };

      const result = FormSuSchema.safeParse(invalidForm);
      expect(result.success).toBe(false);
    });

    it('should require at least one component', () => {
      const invalidForm = {
        display: 'form',
        meta: {
          display_name: 'Contact Form',
          updated_at: '2024-01-01T00:00:00Z',
          created_at: '2024-01-01T00:00:00Z',
          form_su: 'normal',
        },
        components: [],
      };

      const result = FormSuSchema.safeParse(invalidForm);
      expect(result.success).toBe(false);
    });

    it('should validate display enum values', () => {
      const validForm: FormSu = {
        display: 'wizard',
        meta: {
          display_name: 'Wizard Form',
          updated_at: '2024-01-01T00:00:00Z',
          created_at: '2024-01-01T00:00:00Z',
          form_su: 'normal',
        },
        components: [
          {
            type: 'textfield',
            label: 'Name',
          },
        ],
      };

      const result = FormSuSchema.safeParse(validForm);
      expect(result.success).toBe(true);
    });

    it('should reject invalid display values', () => {
      const invalidForm = {
        display: 'invalid',
        meta: {
          display_name: 'Form',
          updated_at: '2024-01-01T00:00:00Z',
          created_at: '2024-01-01T00:00:00Z',
          form_su: 'normal',
        },
        components: [
          {
            type: 'textfield',
            label: 'Name',
          },
        ],
      };

      const result = FormSuSchema.safeParse(invalidForm);
      expect(result.success).toBe(false);
    });

    it('should support multiple components', () => {
      const validForm: FormSu = {
        display: 'form',
        meta: {
          display_name: 'Complex Form',
          updated_at: '2024-01-01T00:00:00Z',
          created_at: '2024-01-01T00:00:00Z',
          form_su: 'normal',
        },
        components: [
          {
            type: 'textfield',
            label: 'First Name',
            key: 'firstName',
          },
          {
            type: 'email',
            label: 'Email',
            key: 'email',
          },
          {
            type: 'textarea',
            label: 'Message',
            key: 'message',
          },
        ],
      };

      const result = FormSuSchema.safeParse(validForm);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.components).toHaveLength(3);
      }
    });

    it('should allow flexible component properties', () => {
      const formWithFlexibleComponents: FormSu = {
        display: 'form',
        meta: {
          display_name: 'Flexible Form',
          updated_at: '2024-01-01T00:00:00Z',
          created_at: '2024-01-01T00:00:00Z',
          form_su: 'normal',
        },
        components: [
          {
            type: 'textfield',
            label: 'Name',
            key: 'name',
            placeholder: 'Enter your name',
            required: true,
            validate: {
              minLength: 2,
              maxLength: 100,
            },
            customProperty: 'customValue',
          },
        ],
      };

      const result = FormSuSchema.safeParse(formWithFlexibleComponents);
      expect(result.success).toBe(true);
    });
  });

  describe('TemplateSuSchema', () => {
    it('should validate complete template object', () => {
      const validTemplate: TemplateSu = {
        template_id: 'contact-form-template-1',
        form: {
          display: 'form',
          meta: {
            display_name: 'Contact Template',
            updated_at: '2024-01-01T00:00:00Z',
            created_at: '2024-01-01T00:00:00Z',
            form_su: 'template',
          },
          components: [
            {
              type: 'textfield',
              label: 'Name',
              key: 'name',
            },
          ],
        },
      };

      const result = TemplateSuSchema.safeParse(validTemplate);
      expect(result.success).toBe(true);
    });

    it('should require template_id', () => {
      const invalidTemplate = {
        form: {
          display: 'form',
          meta: {
            display_name: 'Contact Template',
            updated_at: '2024-01-01T00:00:00Z',
            created_at: '2024-01-01T00:00:00Z',
            form_su: 'template',
          },
          components: [
            {
              type: 'textfield',
              label: 'Name',
            },
          ],
        },
      };

      const result = TemplateSuSchema.safeParse(invalidTemplate);
      expect(result.success).toBe(false);
    });

    it('should require valid form in template', () => {
      const invalidTemplate = {
        template_id: 'template-1',
        form: {
          display: 'form',
          meta: {
            display_name: 'Form',
            updated_at: '2024-01-01T00:00:00Z',
            created_at: '2024-01-01T00:00:00Z',
            form_su: 'normal',
          },
          components: [], // Empty components - invalid
        },
      };

      const result = TemplateSuSchema.safeParse(invalidTemplate);
      expect(result.success).toBe(false);
    });

    it('should validate nested form structure', () => {
      const validTemplate: TemplateSu = {
        template_id: 'survey-template',
        form: {
          display: 'wizard',
          meta: {
            display_name: 'Survey Template',
            description: 'A survey template',
            updated_at: '2024-01-01T00:00:00Z',
            created_at: '2024-01-01T00:00:00Z',
            form_su: 'template',
            published: true,
          },
          components: [
            {
              type: 'select',
              label: 'Question 1',
              key: 'q1',
              options: [
                { label: 'Yes', value: 'yes' },
                { label: 'No', value: 'no' },
              ],
            },
          ],
        },
      };

      const result = TemplateSuSchema.safeParse(validTemplate);
      expect(result.success).toBe(true);
    });
  });

  describe('Type Inference', () => {
    it('should correctly infer Meta type', () => {
      const meta: Meta = {
        display_name: 'Test',
        updated_at: '2024-01-01T00:00:00Z',
        created_at: '2024-01-01T00:00:00Z',
        form_su: 'normal',
      };

      expect(meta.display_name).toBe('Test');
      expect(meta.form_su).toBe('normal');
    });

    it('should correctly infer FormSu type', () => {
      const form: FormSu = {
        display: 'form',
        meta: {
          display_name: 'Form',
          updated_at: '2024-01-01T00:00:00Z',
          created_at: '2024-01-01T00:00:00Z',
          form_su: 'normal',
        },
        components: [
          {
            type: 'textfield',
            label: 'Name',
          },
        ],
      };

      expect(form.display).toBe('form');
      expect(form.components.length).toBe(1);
    });

    it('should correctly infer TemplateSu type', () => {
      const template: TemplateSu = {
        template_id: 'test-template',
        form: {
          display: 'form',
          meta: {
            display_name: 'Template',
            updated_at: '2024-01-01T00:00:00Z',
            created_at: '2024-01-01T00:00:00Z',
            form_su: 'template',
          },
          components: [
            {
              type: 'textfield',
              label: 'Name',
            },
          ],
        },
      };

      expect(template.template_id).toBe('test-template');
      expect(template.form.meta.form_su).toBe('template');
    });
  });

  describe('Schema Error Handling', () => {
    it('should provide detailed error messages', () => {
      const invalidMeta = {
        display_name: 123, // Should be string
        updated_at: '2024-01-01T00:00:00Z',
        created_at: '2024-01-01T00:00:00Z',
        form_su: 'normal',
      };

      const result = MetaSchema.safeParse(invalidMeta);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });

    it('should validate all schema constraints', () => {
      const invalidForm = {
        display: 'form',
        meta: {
          display_name: '',
          updated_at: '',
          created_at: '',
          form_su: 'normal',
        },
        components: [],
      };

      const result = FormSuSchema.safeParse(invalidForm);
      expect(result.success).toBe(false);
    });
  });
});
