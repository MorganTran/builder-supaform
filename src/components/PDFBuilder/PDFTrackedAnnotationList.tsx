import { useState, type FC, memo } from 'react'
import {
  type TrackedAnnotation,
  type PdfWidgetAnnoObject,
} from '@embedpdf/react-pdf-viewer'

interface FieldsListProps {
    annotations: TrackedAnnotation[],
    onSelectedTrackedAnnotation: (_field: TrackedAnnotation) => void;
}

const PDFTrackedAnnotationList: FC<FieldsListProps> = memo(({ annotations, onSelectedTrackedAnnotation }) => {
    // const [formFields, setFormFields] = useState<TrackedAnnotation[]>(annotations)

    return (
        <div className='container-annotation-list'>
        <p>Annotations:</p>
        {annotations.map((_field) => {
            let field = _field.object as unknown as PdfWidgetAnnoObject
            return <button key={field.id} className="btn btn-outline-secondary" onClick={() => {
                onSelectedTrackedAnnotation(_field)
            }}>
                {field.contents ? field.contents : field?.field.name}
                {"(page "+(field?.pageIndex+1)+")"}
            </button>
        })}
        </div>
    )
})

export default PDFTrackedAnnotationList