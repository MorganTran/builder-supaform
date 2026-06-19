/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateForm, mergeFormUpdate } from './Services.ts';
import * as firebase from '../../firebase.ts';
import { type FormSu } from '../../types/Form.ts';
import { PATH_FORM_STORAGE, PATH_TEMPLATE_STORAGE, INIT_FORM_DEFINITION } from '../../types/Consts.ts';

vi.mock('../../firebase.ts');

describe('updateForm', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('uploads to form storage for normal forms', async () => {
        const form: FormSu = {
            display: 'form',
            meta: { display_name: 'Test', form_su: 'normal', created_at: '2026-01-01', updated_at: '2026-01-01' },
            components: [{ type: 'text', key: 'name' }],
        };

        await updateForm(form, 'form-123');

        expect(firebase.uploadFileJson).toHaveBeenCalledWith(
            JSON.stringify(form),
            `${PATH_FORM_STORAGE}form-123.json`
        );
    });

    it('uploads to template storage for template forms', async () => {
        const form: FormSu = {
            display: 'form',
            meta: { display_name: 'Test', form_su: 'template', created_at: '2026-01-01', updated_at: '2026-01-01' },
            components: [{ type: 'text', key: 'name' }],
        };

        await updateForm(form, 'tmpl-456');

        expect(firebase.uploadFileJson).toHaveBeenCalledWith(
            JSON.stringify(form),
            `${PATH_TEMPLATE_STORAGE}tmpl-456.json`
        );
    });

    it('returns formId', async () => {
        const form: FormSu = {
            display: 'form',
            meta: { display_name: 'Test', form_su: 'normal', created_at: '2026-01-01', updated_at: '2026-01-01' },
            components: [{ type: 'text' }],
        };

        const result = await updateForm(form, 'form-789');
        expect(result).toBe('form-789');
    });
});
describe('mergeFormUpdate', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('update component of form', () => {
        const form: FormSu = structuredClone(INIT_FORM_DEFINITION);
        const updated = mergeFormUpdate(form, { components: [{ type: 'text' }] });

        expect((new Date(updated.meta.updated_at).getTime() / 10000).toFixed()).toEqual((((new Date()).getTime() / 10000).toFixed()));
        expect(updated.components).toEqual([{ type: 'text' }]);
    });

    it('update name of form', () => {
        const form: FormSu = structuredClone(INIT_FORM_DEFINITION);
        const newMeta = { display_name: 'new display name' }
        const updated = mergeFormUpdate(form, { meta: newMeta });

        expect((new Date(updated.meta.updated_at)).getTime() / 10000).toEqual((new Date()).getTime() / 10000);
        expect(updated.meta.display_name).toEqual(newMeta.display_name);
    });
})
