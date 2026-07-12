import {
  PDFViewer,
  FormPlugin,
  type PdfWidgetAnnoObject,
  AnnotationPlugin,
  type FormScope,
  LockModeType,
  ZoomMode,
  ExportPlugin,
  ScrollPlugin,
  type TrackedAnnotation,
  type PluginRegistry
} from '@embedpdf/react-pdf-viewer'
import { type PdfTextWidgetAnnoField, PDF_FORM_FIELD_FLAG } from '@embedpdf/models'
import { useEffect, useRef, useCallback, type FC, useState, memo } from 'react'
import { type FormSu, type Field } from '../../types/Form.ts'
import PDFTrackedAnnotationList from './PDFTrackedAnnotationList.tsx'
import DragAndDropFieldsList from './DragAndDropFieldsList.tsx'
import PDFUploader from './PDFUploaderFile.tsx'
import { v4 as uuidv4 } from 'uuid';
import { uploadFilePDF } from '../../firebase.ts'
import { PATH_PDF_STORAGE } from '../../types/Consts.ts'
import { EVENT_FORMSUSCHEMACHANGE, ENUM_FORMPDFFIELDTYPE } from '../../types/Consts.ts'

type AnnotationApi = ReturnType<AnnotationPlugin['provides']>
type ScrollApi = ReturnType<ScrollPlugin['provides']>


interface PDFBuilderProps {
  form: FormSu,
  formId: string
}


const PDFBuilder: FC<PDFBuilderProps> = memo(({ form, formId }) => {
  const registryPDFViewerRef = useRef<PluginRegistry>(null)
  const [urlPdf, setUrlPdf] = useState(form?.meta?.pdf_url)
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success'>('idle')
  const formScopeRef = useRef<FormScope>(null)
  const currentPageNumberPDFRef = useRef<number>(0)
  const annotationApiRef = useRef<AnnotationApi | null>(null)
  const scrollApiRef = useRef<ScrollApi | null>(null)
  const cancelledRef = useRef<boolean>(false)
  const cleanupsRef = useRef<Array<() => void>>([])

  const [trackedAnnotations, setTrackedAnnotations] = useState<TrackedAnnotation[]>([])

  const getExportScope = async () => {
    const registry = registryPDFViewerRef.current
    if (!registry) return null


    const exportPlugin = registry.getPlugin<ExportPlugin>('export')?.provides()


    if (exportPlugin) {
      return exportPlugin.forDocument(formId)
    }
    return null
  }

  const handleUploadNewPdf = useCallback(async (url_pdf: string) => {
    setUrlPdf(url_pdf)
    setLoading(false)
    window.dispatchEvent(new CustomEvent(EVENT_FORMSUSCHEMACHANGE, { detail: { meta: { "pdf_url": url_pdf } } }));
  }, [])

  const handleSelectedTrackedAnnotation = useCallback(async (_annotation: TrackedAnnotation) => {
    scrollApiRef.current?.scrollToPage({ pageNumber: _annotation.object.pageIndex + 1, behavior: 'instant' })
    annotationApiRef.current?.selectAnnotation(_annotation.object.pageIndex, _annotation.object.id)
  }, [])

  const handleSavePdf = useCallback(async () => {
    const scope = await getExportScope()
    if (!scope) return

    setIsSaving(true)

    const arrayBuffer = await scope.saveAsCopy().toPromise()


    const blob = new Blob([arrayBuffer], { type: 'application/pdf' })
    // const file = new File([blob], formId+'.pdf')
    await uploadFilePDF(blob, PATH_PDF_STORAGE + formId + ".pdf")


    console.log(`Successfully upload.`)
    setSaveStatus('success')
    setTimeout(() => setSaveStatus('idle'), 3000)
    setIsSaving(false)
  }, [])
  const handleCreatedNewFormField = useCallback((field: Field) => {
    if (annotationApiRef.current) {
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

  const handlePDFViewerOnready = useCallback((registry: PluginRegistry) => {
    // using import.meta.env.DEV because in dev mode, cancelledRef.current is alway true for unmount callback called 2 times.
    if (cancelledRef.current && !import.meta.env.DEV) return

    registryPDFViewerRef.current = registry

    const annotationPlugin = registry?.getPlugin<AnnotationPlugin>('annotation')?.provides()
    if (!annotationPlugin) return

    annotationApiRef.current = annotationPlugin
    annotationPlugin.setLocked({ type: LockModeType.None })

    const scrollPlugin = registry?.getPlugin<ScrollPlugin>('scroll')?.provides();
    if (!scrollPlugin) return

    scrollApiRef.current = scrollPlugin

    scrollPlugin?.onPageChange((event) => {
      console.log(`Doc: ${event.documentId}`);
      console.log(`Current Page: ${event.pageNumber}`);
      console.log(`Total Pages: ${event.totalPages}`);
      currentPageNumberPDFRef.current = event.pageNumber - 1
    })

    cleanupsRef.current.push(annotationPlugin.onAnnotationEvent((event) => {
      if (
        event.type === 'create' ||
        event.type === 'delete' ||
        event.type === 'loaded'
      ) {
        const annotations = annotationPlugin.getAnnotations()
        console.log("annotations", annotations)
        setTrackedAnnotations(annotations)
      }
    }))

    const formPlugin = registry?.getPlugin<FormPlugin>('form')?.provides()
    const formScope = formPlugin?.forDocument(formId)

    formScope?.getPageFormAnnoWidgets(0)

    if (!formScope) return
    if (!formPlugin) return

    formScopeRef.current = formScope

    cleanupsRef.current.push(
      formScope.onFormReady(async (nextFields) => {
        console.log("fields", nextFields, await formScope?.getPageFormAnnoWidgets(0).toPromise())
        setLoading(false)
      }),
    )
  }, []);

  useEffect(() => {

    return () => {
      cancelledRef.current = true
      cleanupsRef.current.forEach((cleanup) => cleanup())
    }
  }, [])

  return (
    <div className="row">
      {urlPdf ? <div className="row">
        <div className='col-2'>
          {!loading && <div className='container-field-list'>
            <p>
              <button onClick={handleSavePdf} className={'btn btn-primary'}>
                {isSaving
                  ? 'Saving...'
                  : saveStatus === 'success'
                    ? 'Saved!'
                    : 'Save'}
              </button>
            </p>
            <DragAndDropFieldsList form={form} formId={formId} onCreatedNewFormField={handleCreatedNewFormField} />
          </div>}
        </div>
        <div className='col-8'>
          <div className="pdf-builder-container">
            <PDFViewer
              onReady={handlePDFViewerOnready}
              config={{
                zoom: {
                  defaultZoomLevel: ZoomMode.FitWidth,
                  minZoom: 0.5,
                  maxZoom: 3.0
                },
                documentManager: {
                  initialDocuments: [
                    {
                      url: urlPdf,
                      documentId: formId,
                    },
                  ],
                },
                // disabledCategories: ["zoom", "zoom-in", "zoom-out", "zoom-fit-page", "zoom-fit-width", "zoom-marquee", "zoom-level",
                //   "annotation", "annotation-markup", "annotation-highlight", "annotation-underline", "annotation-strikeout", "annotation-squiggly", "annotation-ink", "annotation-text", "annotation-stamp",
                //   "form", "form-textfield", "form-checkbox", "form-radio", "form-select", "form-listbox", "form-fill-mode",
                //   "annotation-shape", "annotation-rectangle", "annotation-circle", "annotation-line", "annotation-arrow", "annotation-polygon", "annotation-polyline",
                //   "redaction", "redaction-area", "redaction-text", "redaction-apply", "redaction-clear",
                //   "document", "document-open", "document-close", "document-print", "document-capture", "document-export", "document-fullscreen", "document-protect",
                //   "page", "spread", "rotate", "scroll", "navigation",
                //   "panel", "panel-sidebar", "panel-search", "panel-comment",
                //   "tools", "pan", "pointer", "capture",
                //   "selection", "selection-copy",
                //   "history", "history-undo", "history-redo",
                //   "insert", "insert-rubber-stamp", "insert-signature", "insert-image",
                //   "security", "security-unlock-overlay"]
              }}
            />
          </div>
        </div>
        <div className='col-2'>
          <PDFTrackedAnnotationList annotations={trackedAnnotations} onSelectedTrackedAnnotation={handleSelectedTrackedAnnotation} />
        </div>
      </div> :
        <PDFUploader formId={formId} onUploadNewPDF={handleUploadNewPdf} />
      }
    </div>
  );
})

export default PDFBuilder