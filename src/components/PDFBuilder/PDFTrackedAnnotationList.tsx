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
import Tooltip from '../Tooltip.tsx'
import { modal, type DataRenderModal, type ButtonRender } from '../../components/ConfirmModal.tsx'

interface FieldsListProps {
    registryPDFViewer: PluginRegistry
}

const PDFTrackedAnnotationList: FC<FieldsListProps> = memo(({ registryPDFViewer }) => {
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
                event.type != 'loaded'
            ) {
                const annotations = annotationPlugin.getAnnotations()
                // console.log("annotations", annotations)
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
        const result: ButtonRender = await modal({
            title: "",
            body: "Are you sure you want to delete all annotations? You won't be able to roll back or recover them after this.",
            show: true,
            buttons: [
                { class: "btn-secondary", text: "No", key: "no" },
                { class: "btn-primary", text: "Yes", key: "yes" }
            ]
        } as DataRenderModal)

        if (result.key == 'yes') {
            annotationApiRef.current?.deleteAllAnnotations()
            // if (annotationApiRef.current) {
            //     let annots: TrackedAnnotation[] = annotationApiRef.current?.getAnnotations();
            //     annots?.forEach((annot: TrackedAnnotation) => {
            //         console.log('handleRemovedAllTrackedAnnotation', annot)
            //         annotationApiRef.current?.deleteAnnotation(annot.object.pageIndex, annot.object.id)
            //     })
            // }
        }
    }, [])

    const handleSearch = useCallback((ev: ChangeEvent<HTMLInputElement>) => {
        let _key = ev.target.value
        setKeysearch(_key)
    }, [])

    const handleClearSearch = useCallback(() => {
        setKeysearch('')
    }, [])

    return (
        <div className='container-annotation-list'>
            {_annotations.length > 0 &&
                <div className='input-group'>
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
            {_annotations.length > 0 && <div className='d-grid gap-2 d-md-flex mb-2 mt-2'>Annotations:
                <Tooltip text="Remove all annotations in the current files." position="left">
                    <button className="btn btn-outline-danger btn-sm" onClick={handleRemovedAllTrackedAnnotation}>Remove All</button>
                </Tooltip>
            </div>}
            <div className="d-grid gap-2 d-md-block">
                {_annotations.length > 0 ? _annotationsFilteredList.map((_annotation) => {
                    let field = _annotation.object as unknown as PdfWidgetAnnoObject
                    return <button key={field.id} className="btn btn-sm btn-outline-secondary position-relative mb-1 me-1" onClick={() => {
                        handleSelectedTrackedAnnotation(_annotation)
                    }}>
                        {field.contents ? field.contents : field?.field.name}
                        {"(p " + (field?.pageIndex + 1) + ")"}
                        <span onClick={() => {
                            handleRemovedTrackedAnnotation(_annotation)
                        }} className="position-absolute top-0 start-100 translate-middle p-2 danger-text">
                            <i className="bi bi-x-circle-fill"></i>
                        </span>
                    </button>
                }) : "No Annotation."}
            </div>
        </div>
    )
}, () => { return true })

export default PDFTrackedAnnotationList