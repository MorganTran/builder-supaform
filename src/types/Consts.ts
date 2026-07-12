import { type FormSu } from './Form.ts'

export const PATH_FORM_STORAGE = "forms/"
export const PATH_TEMPLATE_STORAGE = "templates/"
export const PATH_FEEDBACK_STORAGE = "feedback/"
export const PATH_PDF_STORAGE = "pdfs/"
export const PREFIX_FORM_ID = "fr_"
export const PREFIX_TEMPLATE_ID = "tp_"
// "address", "survey", "datagrid", "editgrid", "container", "datamap" don't support yet.
// "day" is not supported format string
// "currency" needs to add symbol of currency in font of.
export const TEXT_TYPES_PDFFORM = ['textfield', 'textarea', 'number', 'password',
                                  'day', 'email', 'select', 'url', 'phoneNumber',
                                  'tags', 'day', 'time', 'currency', 'hide']
export const CHECKBOX_TYPES_PDFFORM = ['selectboxes', 'checkbox']

//"radio": "value"
export const RADIO_TYPES_PDFFORM = ['radio']
//"signature": "data:image/png;base64,iVBORw0KGgoAAAANSUhII=",
export const IMAGE_TYPES_PDFFORM = ['signature']
export const SUBFIELD_PDFFORM = ['columns', 'fieldset', 'panel', 'table', 'tabs', 'well']

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


export const ENUM_FORMPDFFIELDTYPE = {
    /**
     * Unknow
     */
    UNKNOWN : 0,
    /**
     * push button type
     */
    PUSHBUTTON : 1,
    /**
     * check box type.
     */
    CHECKBOX : 2,
    /**
     * radio button type.
     */
    RADIOBUTTON : 3,
    /**
     * combo box type.
     */
    COMBOBOX : 4,
    /**
     * list box type.
     */
    LISTBOX : 5,
    /**
     *  text field type
     */
    TEXTFIELD : 6,
    /**
     * signature field type.
     */
    SIGNATURE : 7,
    /**
     * Generic XFA type.
     */
    XFA : 8,
    /**
     * XFA check box type.
     */
    XFA_CHECKBOX : 9,
    /**
     * XFA combo box type.
     */
    XFA_COMBOBOX : 10,
    /**
     * XFA image field type.
     */
    XFA_IMAGEFIELD : 11,
    /**
     * XFA list box type.
     */
    XFA_LISTBOX : 12,
    /**
     * XFA push button type.
     */
    XFA_PUSHBUTTON : 13,
    /**
     * XFA signture field type.
     */
    XFA_SIGNATURE : 14,
    /**
     * XFA text field type.
     */
    XFA_TEXTFIELD : 15,
    /**
     * Image field type.
     */
    IMAGE : 16
} as const;