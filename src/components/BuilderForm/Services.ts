
import { uploadFileJson } from '../../firebase.ts'
import { type FormSu, type DeepPartial } from '../../types/Form.ts'
import { PATH_FORM_STORAGE, PATH_TEMPLATE_STORAGE } from '../../types/Consts.ts'

export const updateForm = async (form: FormSu, formId: string): Promise<string> => {
  const jsStr = JSON.stringify(form);
  let fileName = PATH_FORM_STORAGE + formId + ".json"
  if (form.meta.form_su == 'template') {
    fileName = PATH_TEMPLATE_STORAGE + formId + ".json"
  }

  await uploadFileJson(jsStr, fileName)

  return formId
}

export const mergeFormUpdate = (form: FormSu, update: DeepPartial<FormSu>): FormSu => {
  const result = structuredClone(form);
  const meta = update.meta;
  if (meta) {
    result.meta = { ...result.meta, ...meta, updated_at: new Date().toISOString() };
  } else {
    result.meta = { ...result.meta, updated_at: new Date().toISOString() };
  }
  delete update.meta // Don't double-merge
  Object.assign(result, update);
  return result;
}
