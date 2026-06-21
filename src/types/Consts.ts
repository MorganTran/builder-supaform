import { type FormSu } from './Form.ts'

export const PATH_FORM_STORAGE = "forms/"
export const PATH_TEMPLATE_STORAGE = "templates/"
export const PATH_FEEDBACK_STORAGE = "feedback/"
export const PREFIX_FORM_ID = "fr_"
export const PREFIX_TEMPLATE_ID = "tp_"

export const INIT_FORM_DEFINITION: FormSu = {
  "display": "form",
  "meta": {
    "display_name": "New Form",
    "description": "",
    "thumbnail_url": "",
    "created_at": "",
    "updated_at": "",
    "form_su": "normal"
  },
  "components": [
    {
      "type": "button",
      "label": "Submit",
      "key": "submit",
      "disableOnInvalid": true,
      "input": true,
      "tableView": false
    }
  ]
}

export const INIT_TEMPLATEFORM_DEFINITION: FormSu = {
  "display": "form",
  "meta": {
    "display_name": "New Template",
    "description": "",
    "thumbnail_url": "",
    "created_at": "",
    "updated_at": "",
    "form_su": "template"
  },
  "components": [
    {
      "type": "button",
      "label": "Submit",
      "key": "submit",
      "disableOnInvalid": true,
      "input": true,
      "tableView": false
    }
  ]
}

export const EVENT_FORMSUSCHEMACHANGE = "onFormSuSchemaChange"
export const EVENT_FORMSUSCHEMACHANGESUCCESSFULLY = "onFormSuSchemaChangeSuccessfully"