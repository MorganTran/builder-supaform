import { type FormSu } from '../../types/Form.ts'
import { uploadFileJson } from '../../firebase.ts'
import { PATH_FORM_STORAGE, PREFIX_FORM_ID, PATH_TEMPLATE_STORAGE, PREFIX_TEMPLATE_ID } from '../../types/Consts.ts'


export const createNewForm = (form: FormSu, userId: string): string => {
  const fr_id = PREFIX_FORM_ID + Date.now() + userId

  const path: string = PATH_FORM_STORAGE + fr_id + '.json';

  form.meta.updated_at = (new Date()).toISOString()
  form.meta.created_at = form.meta.updated_at

  uploadFileJson(JSON.stringify(form), path)

  return fr_id
}

export const createNewTemplate = (form: FormSu, userId: string): string => {
  const fr_id = PREFIX_TEMPLATE_ID + Date.now() + userId

  const path: string = PATH_TEMPLATE_STORAGE + fr_id + '.json';

  form.meta.updated_at = (new Date()).toISOString()
  form.meta.created_at = form.meta.updated_at

  uploadFileJson(JSON.stringify(form), path)

  return fr_id
}