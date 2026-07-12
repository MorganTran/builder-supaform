import { useState, type FC, useEffect, memo } from 'react'
import { type FormSu, type Field } from '../../types/Form.ts'
import { mappingFormComponentFieldsAndPDFFields } from './Services.ts'

interface DragAndDropFieldsListProps {
    form: FormSu,
    formId: string,
    onCreatedNewFormField: (_field: Field) => void;
}

const DragAndDropFieldsList: FC<DragAndDropFieldsListProps> = memo(({ form, formId, onCreatedNewFormField }) => {
    const [fields, setFields] = useState<Field[]>([])

    useEffect(() => {
        let _fields: Field[] = []

        _fields = mappingFormComponentFieldsAndPDFFields(form.components)
        setFields(_fields)
    }, [])

    return (
        <div className='container-drap-drop-fields-list'>
            <p>Form Fields</p>
            {fields.map((field) => {
                return <button key={field.key} className="btn btn-outline-primary" onClick={() => {
                    onCreatedNewFormField(field)
                }}>
                    {field.key}
                </button>
            })}
        </div>
    )
})

export default DragAndDropFieldsList