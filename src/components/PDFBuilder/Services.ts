import { type FormSu, type Field } from '../../types/Form.ts'
import { TEXT_TYPES_PDFFORM, CHECKBOX_TYPES_PDFFORM, RADIO_TYPES_PDFFORM, SUBFIELD_PDFFORM, IMAGE_TYPES_PDFFORM, ENUM_FORMPDFFIELDTYPE } from '../../types/Consts.ts'

export function cloneFormObject(originalForm: FormSu) {
    const clonedForm = {
        ...originalForm,
        // 1. Deep clone the 'meta' object
        meta: {
            ...originalForm.meta
        },
        // 2. Deep clone the 'components' array and its objects
        components: originalForm.components.map(component => ({
            ...component
        }))
    };

    return clonedForm
}

export function mappingFormComponentFieldsAndPDFFields(components: Record<string, any>[]): Field[] {
    const _fields: Field[] = []

    for (let index = 0; index < components.length; index++) {
        const comp = components[index];
        const type = comp.type

        if (TEXT_TYPES_PDFFORM.indexOf(type) != -1) {
            _fields.push({ label: comp.label, type: ENUM_FORMPDFFIELDTYPE.TEXTFIELD, key: comp.key, compkey:comp.key, component: comp })
        } else if (CHECKBOX_TYPES_PDFFORM.indexOf(type) != -1) {
            if (type == 'selectboxes') {
                comp.values.forEach((item: any) => {
                    const label = comp.label + "." + item.label
                    const key = comp.key + "." + item.value
                    _fields.push({ label: label, type: ENUM_FORMPDFFIELDTYPE.CHECKBOX, key: key, compkey:comp.key, component: comp })
                })
            } else if (type == 'checkbox') {
                const label = comp.label
                const key = comp.key
                _fields.push({ label: label, type: ENUM_FORMPDFFIELDTYPE.CHECKBOX, key: key, compkey:comp.key, component: comp })
            }
        } else if (RADIO_TYPES_PDFFORM.indexOf(type) != -1) {
            comp.values.forEach((item: any) => {
                const label = comp.label + "." + item.label
                const key = comp.key + "." + item.value
                _fields.push({ label: label, type: ENUM_FORMPDFFIELDTYPE.RADIOBUTTON, key: key, compkey:comp.key, component: comp })
            })
        } else if (IMAGE_TYPES_PDFFORM.indexOf(type) != -1) {
            _fields.push({ label: comp.label, type: 100, key: comp.key, compkey:comp.key, component: comp })
        } else if (SUBFIELD_PDFFORM.indexOf(type) != -1) {
            if (['fieldset', 'panel', 'well'].indexOf(type) != -1 && Array.isArray(comp?.components) && comp?.components.length > 0) {
                _fields.concat(mappingFormComponentFieldsAndPDFFields(comp?.components))
            } else if ('columns' == type && Array.isArray(comp?.columns) && comp?.columns.length > 0) {
                comp?.columns.forEach((column: Record<string, object>) => {
                    if (Array.isArray(column?.components) && column?.components.length > 0) {
                        _fields.concat(mappingFormComponentFieldsAndPDFFields(column?.components))
                    }
                })
            } else if ('tabs' == type && Array.isArray(comp?.components) && comp?.components.length > 0) {
                comp?.components.forEach((component: Record<string, object>) => {
                    if (Array.isArray(component?.components) && component?.components.length > 0) {
                        _fields.concat(mappingFormComponentFieldsAndPDFFields(component?.components))
                    }
                })
            } else if ('table' == type && Array.isArray(comp?.rows) && comp?.rows.length > 0) {
                comp?.rows.forEach((row: []) => {
                    row.forEach((col: Record<string, object>) => {
                        if (Array.isArray(col?.components) && col?.components.length > 0) {
                            _fields.concat(mappingFormComponentFieldsAndPDFFields(col?.components))
                        }
                    })
                })
            }
        }
    }

    return _fields
}