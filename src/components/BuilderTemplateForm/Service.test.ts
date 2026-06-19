/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createNewForm, createNewTemplate } from './Services.ts'
import { type FormSu } from '../../types/Form.ts'
import { INIT_FORM_DEFINITION, INIT_TEMPLATEFORM_DEFINITION } from '../../types/Consts.ts'
import * as firebase from '../../firebase.ts'

vi.mock('../../firebase.ts')

describe('Form Factory Functions', () => {
  const mockUserId = 'user123'
  const mockDate = new Date('2026-06-19T10:00:00Z')

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(mockDate)
    vi.mocked(firebase.uploadFileJson).mockClear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('createNewForm', () => {
    it('generates ID with PREFIX_FORM_ID + timestamp + userId', () => {
      const form = getValidFormStub()
      const id = createNewForm(form, mockUserId)

      expect(id).contain('user123')
    })

    it('sets both created_at and updated_at to ISO string', () => {
      const form = getValidFormStub()
      createNewForm(form, mockUserId)

      expect(form.meta.created_at).toBe('2026-06-19T10:00:00.000Z')
      expect(form.meta.updated_at).toBe('2026-06-19T10:00:00.000Z')
    })

    it('uploads JSON to correct path: PATH_FORM_STORAGE + id + .json', () => {
      const form = getValidFormStub()
      const id = createNewForm(form, mockUserId)

      expect(firebase.uploadFileJson).toHaveBeenCalledWith(
        JSON.stringify(form),
        `forms/${id}.json`
      )
    })

    it('returns the generated ID', () => {
      const form = getValidFormStub()
      const id = createNewForm(form, mockUserId)

      expect(id).toBeDefined()
      expect(typeof id).toBe('string')
      expect(id.length).toBeGreaterThan(0)
    })
  })

  describe('createNewTemplate', () => {
    it('generates ID with PREFIX_TEMPLATE_ID + timestamp + userId', () => {
      const form = getValidTemplateStub()
      const id = createNewTemplate(form, mockUserId)

      expect(id).contain('user123')
    })

    it('uploads to PATH_TEMPLATE_STORAGE path', () => {
      const form = getValidTemplateStub()
      const id = createNewTemplate(form, mockUserId)

      expect(firebase.uploadFileJson).toHaveBeenCalledWith(
        JSON.stringify(form),
        `templates/${id}.json`
      )
    })
  })

  describe('ID uniqueness (regression)', () => {
    it('creates different IDs when called multiple times (timestamps differ)', () => {
      const form1 = getValidFormStub()
      const form2 = getValidFormStub()

      const id1 = createNewForm(form1, mockUserId)
      
      vi.advanceTimersByTime(1) // advance clock
      
      const id2 = createNewForm(form2, mockUserId)

      expect(id1).not.toBe(id2)
    })
  })
})

function getValidFormStub(): FormSu {
  return structuredClone(INIT_FORM_DEFINITION);
}

function getValidTemplateStub(): FormSu {
  return structuredClone(INIT_TEMPLATEFORM_DEFINITION);
}