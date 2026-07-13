import { useState, type FC, memo, useCallback, type ChangeEvent, useEffect, useRef, useMemo } from 'react'
import {
    type TrackedAnnotation,
    type PdfWidgetAnnoObject,
    type PluginRegistry,
    AnnotationPlugin,
    ScrollPlugin,
    LockModeType
} from '@embedpdf/react-pdf-viewer'
import { type AnnotationApi, type ScrollApi } from '../../types/PdfPlugin.ts'

interface FieldsListProps {
    registryPDFViewer: PluginRegistry
}

const PDFTrackedAnnotationList: FC<FieldsListProps> = memo(({ registryPDFViewer }) => {
    console.log("PDFTrackedAnnotationList")
    const [_annotations, setAnnotations] = useState<TrackedAnnotation[]>([])
    const [_keysearch, setKeysearch] = useState<string>("")

    const annotationApiRef = useRef<AnnotationApi | null>(null)
    const scrollApiRef = useRef<ScrollApi | null>(null)

    const _annotationsFilteredList = useMemo(() => {
        if (!_keysearch) return _annotations;

        return _annotations.filter((_annotation: TrackedAnnotation) => {
            let field: PdfWidgetAnnoObject = _annotation.object as unknown as PdfWidgetAnnoObject
            let name: string = field.contents ? field.contents : field?.field.name
            return name.toLowerCase().includes(_keysearch.toLowerCase())
        });
    }, [_keysearch, _annotations]);

    useEffect(() => {
        const cleanups: Array<() => void> = []
        const annotationPlugin = registryPDFViewer?.getPlugin<AnnotationPlugin>('annotation')?.provides()
        if (!annotationPlugin) return

        annotationApiRef.current = annotationPlugin


        annotationPlugin.setLocked({ type: LockModeType.None })

        const scrollPlugin = registryPDFViewer?.getPlugin<ScrollPlugin>('scroll')?.provides();
        if (!scrollPlugin) return

        scrollApiRef.current = scrollPlugin

        const annotations = annotationPlugin.getAnnotations()
        setAnnotations(annotations)

        cleanups.push(annotationPlugin.onAnnotationEvent((event) => {
            if (
                event.type === 'create' ||
                event.type === 'delete' ||
                event.type === 'loaded'
            ) {
                const annotations = annotationPlugin.getAnnotations()
                console.log("annotations", annotations)
                setAnnotations(annotations)
            }
        }))
        return () => {
            cleanups.forEach((cleanup) => cleanup())
        }
    }, [])


    const handleSelectedTrackedAnnotation = useCallback(async (_annotation: TrackedAnnotation) => {
        scrollApiRef.current?.scrollToPage({ pageNumber: _annotation.object.pageIndex + 1, behavior: 'instant' })
        annotationApiRef.current?.selectAnnotation(_annotation.object.pageIndex, _annotation.object.id)
    }, [])

    const handleRemovedTrackedAnnotation = useCallback(async (_annotation: TrackedAnnotation) => {
        scrollApiRef.current?.scrollToPage({ pageNumber: _annotation.object.pageIndex + 1, behavior: 'instant' })
        annotationApiRef.current?.deleteAnnotation(_annotation.object.pageIndex, _annotation.object.id)
    }, [])

    const handleRemovedAllTrackedAnnotation = useCallback(async () => {
        if (confirm("Are you sure you want to delete all annotations? You won't be able to roll back or recover them after this."))
            annotationApiRef.current?.deleteAllAnnotations()
    }, [])

    const handleSearch = useCallback((ev: ChangeEvent<HTMLInputElement>) => {
        let _key = ev.target.value
        setKeysearch(_key)
        // let result: TrackedAnnotation[] = _annotations.filter((_annotation: TrackedAnnotation) => {
        //     let field: PdfWidgetAnnoObject = _annotation.object as unknown as PdfWidgetAnnoObject
        //     let name: string = field.contents ? field.contents : field?.field.name
        //     return name.indexOf(_key) > -1
        // })

        // setAnnotations(result)
    }, [])

    return (
        <div className='container-annotation-list'>
            {_annotations.length > 0 && <input type="text" onChange={handleSearch} value={_keysearch} placeholder='Search by field key' />}
            <p>Annotations:
                {_annotations.length > 0 && <button className="btn btn-outline-danger" onClick={handleRemovedAllTrackedAnnotation}>Remove All</button>}
            </p>
            {_annotations.length > 0 ? _annotationsFilteredList.map((_annotation) => {
                let field = _annotation.object as unknown as PdfWidgetAnnoObject
                return <button key={field.id} className="btn btn-outline-secondary position-relative" onClick={() => {
                    handleSelectedTrackedAnnotation(_annotation)
                }}>
                    {field.contents ? field.contents : field?.field.name}
                    {"(page " + (field?.pageIndex + 1) + ")"}
                    <span onClick={() => {
                        handleRemovedTrackedAnnotation(_annotation)
                    }} className="position-absolute top-0 start-100 translate-middle p-2 danger-text">
                        <i className="bi bi-x-circle-fill"></i>
                    </span>
                </button>
            }) : "No Annotation."}
        </div>
    )
}, () => { return true })

export default PDFTrackedAnnotationList