import { useState, type FC, useEffect, memo, useCallback, useRef, useMemo, type ChangeEvent } from 'react'
import { type FormSu, type Field } from '../../types/Form.ts'
import { mappingFormComponentFieldsAndPDFFields } from './Services.ts'
import {
    type PluginRegistry,
    type AnnotationPlugin,
    type ScrollPlugin,
    type PdfWidgetAnnoObject,
    ZoomPlugin,
    ZoomMode
} from '@embedpdf/react-pdf-viewer'
import { type PdfTextWidgetAnnoField, PDF_FORM_FIELD_FLAG } from '@embedpdf/models'
import { v4 as uuidv4 } from 'uuid';
import { ENUM_FORMPDFFIELDTYPE } from '../../types/Consts.ts'
import { type AnnotationApi, type ScrollApi } from '../../types/PdfPlugin.ts'
import Tooltip from '../Tooltip.tsx'

interface DragAndDropFieldsListProps {
    form: FormSu,
    formId: string,
    registryPDFViewer: PluginRegistry;
}

const DragAndDropFieldsList: FC<DragAndDropFieldsListProps> = memo(({ form, formId, registryPDFViewer }) => {
    const [fields, setFields] = useState<Field[]>([])

    const annotationApiRef = useRef<AnnotationApi | null>(null)
    const scrollApiRef = useRef<ScrollApi | null>(null)
    const currentPageNumberPDFRef = useRef<number>(0)
    const [_keysearch, setKeysearch] = useState<string>("")

    const _fieldsFilteredList = useMemo(() => {
        if (!_keysearch) return fields;

        return fields.filter((_field: Field) => {
            return _field.key.toLowerCase().includes(_keysearch.toLowerCase())
        });
    }, [_keysearch, fields]);

    const handleSearch = useCallback((ev: ChangeEvent<HTMLInputElement>) => {
        let _key = ev.target.value
        setKeysearch(_key)
    }, [])

    const handleClearSearch = useCallback(() => {
        setKeysearch('')
    }, [])

    const fitWidth = () => {
        const zoomPlugin = registryPDFViewer?.getPlugin<ZoomPlugin>('zoom')?.provides();
        const docZoom = zoomPlugin?.forDocument(formId);
        docZoom?.requestZoom(ZoomMode.FitWidth);
    };

    useEffect(() => {
        const cleanups: Array<() => void> = []
        let _fields: Field[] = []
        const annotationPlugin = registryPDFViewer?.getPlugin<AnnotationPlugin>('annotation')?.provides()
        if (!annotationPlugin) return

        annotationApiRef.current = annotationPlugin

        const scrollPlugin = registryPDFViewer?.getPlugin<ScrollPlugin>('scroll')?.provides();
        if (!scrollPlugin) return

        scrollApiRef.current = scrollPlugin

        scrollPlugin?.onPageChange((event) => {
            console.log(`Doc: ${event.documentId}`);
            console.log(`Current Page: ${event.pageNumber}`);
            console.log(`Total Pages: ${event.totalPages}`);
            currentPageNumberPDFRef.current = event.pageNumber - 1
        })

        _fields = mappingFormComponentFieldsAndPDFFields(form.components)
        setFields(_fields)

        return () => {
            cleanups.forEach((cleanup) => cleanup())
        }
    }, [])

    const handleCreatedNewFormField = useCallback((field: Field) => {
        if (annotationApiRef.current) {
            fitWidth()
            scrollApiRef.current?.scrollToPage({ pageNumber: currentPageNumberPDFRef.current + 1, behavior: 'instant' })
            const id = uuidv4()
            let strokeColor = "transparent"
            let size = {
                "width": 150,
                "height": 24
            }
            if (field.type == ENUM_FORMPDFFIELDTYPE.CHECKBOX || field.type == ENUM_FORMPDFFIELDTYPE.RADIOBUTTON) {
                strokeColor = 'black'
                size = {
                    "width": 8,
                    "height": 8
                }
            }
            const f: PdfTextWidgetAnnoField = {
                "type": field.type,
                "name": field.key,
                "alternateName": field.key,
                "value": "",
                "flag": PDF_FORM_FIELD_FLAG.NONE,
            }
            let an: PdfWidgetAnnoObject = {
                "type": 20,
                "fontFamily": 4,
                "fontSize": 12,
                "fontColor": "#000000",
                "strokeColor": strokeColor,
                "color": "transparent",
                "strokeWidth": 1,
                "field": f,
                "id": id,
                "pageIndex": currentPageNumberPDFRef.current,
                "rect": {
                    "origin": {
                        "x": 30,
                        "y": 113
                    },
                    "size": size
                },
                "created": (new Date),
                "contents": field.key
            }
            an.field = f

            annotationApiRef.current?.createAnnotation(currentPageNumberPDFRef.current, an)
            annotationApiRef.current?.selectAnnotation(currentPageNumberPDFRef.current, an.id)
        }
    }, []);

    return (
        <div className='container-drap-drop-fields-list'>
            <div className='my-2'>Form Fields:</div>
            {fields.length > 0 &&
                <div className='input-group mb-2'>
                    <input type="text" onChange={handleSearch} value={_keysearch} className="form-control" placeholder='Search by field key' aria-describedby="basic-addon2" />
                    <Tooltip text="Clear search input." position="left">
                        <div className="input-group-append">
                            <span className='input-group-text' onClick={handleClearSearch}>
                                <i className="bi bi-x-circle-fill" id="basic-addon2"></i>
                            </span>
                        </div>
                    </Tooltip>
                </div>
            }
            {_fieldsFilteredList.map((field) => {
                return <button key={field.key} className="btn btn-outline-primary mb-1 me-1" onClick={() => {
                    handleCreatedNewFormField(field)
                }}>
                    {field.key}
                </button>
            })}
        </div>
    )
}, () => { return true })

export default DragAndDropFieldsList