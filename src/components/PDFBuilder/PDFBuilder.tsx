import {
  PDFViewer,
  FormPlugin,
  type FormScope,
  ZoomMode,
  ExportPlugin,
  type PluginRegistry,
  type AnnotationPlugin,
  type AnnotationTransferItem
} from '@embedpdf/react-pdf-viewer'
import { useEffect, useRef, useCallback, type FC, useState, memo } from 'react'
import { type FormSu } from '../../types/Form.ts'
import PDFTrackedAnnotationList from './PDFTrackedAnnotationList.tsx'
import DragAndDropFieldsList from './DragAndDropFieldsList.tsx'
import PDFUploader from './PDFUploaderFile.tsx'
import { uploadFilePDF } from '../../firebase.ts'
import { PATH_PDF_STORAGE } from '../../types/Consts.ts'
import { EVENT_FORMSUSCHEMACHANGE } from '../../types/Consts.ts'
import Tooltip from '../Tooltip.tsx'
import { type AnnotationApi } from '../../types/PdfPlugin.ts'
import { modal, type DataRenderModal, type ButtonRender } from '../../components/ConfirmModal.tsx'

interface PDFBuilderProps {
  form: FormSu,
  formId: string,
  onDirty: (dirty: boolean) => void;
}


const PDFBuilder: FC<PDFBuilderProps> = memo(({ form, formId, onDirty }) => {
  const registryPDFViewerRef = useRef<PluginRegistry>(null)
  const [urlPdf, setUrlPdf] = useState(form?.meta?.pdf_url)
  const [reuploading, setReuploading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success'>('idle')
  const formScopeRef = useRef<FormScope>(null)
  const cancelledRef = useRef<boolean>(false)
  const dirtyRef = useRef<boolean>(false)
  const cleanupsRef = useRef<Array<() => void>>([])
  const annotationApiRef = useRef<AnnotationApi | null>(null)
  const oldAnnotationTransferItems = useRef<AnnotationTransferItem[] | null | undefined>(null)

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
    registryPDFViewerRef.current = null
    cleanupsRef.current.forEach((cleanup) => cleanup())
    setLoading(true)
    setReuploading(true)
    setTimeout(() => {
      setUrlPdf(url_pdf)
      setReuploading(false)
      window.dispatchEvent(new CustomEvent(EVENT_FORMSUSCHEMACHANGE, { detail: { meta: { "pdf_url": url_pdf } } }));
    }, 500)
  }, [])

  const handleSavePdf = useCallback(async () => {
    const scope = await getExportScope()
    if (!scope) return

    setIsSaving(true)

    const arrayBuffer = await scope.saveAsCopy().toPromise()


    const blob = new Blob([arrayBuffer], { type: 'application/pdf' })
    // const file = new File([blob], formId+'.pdf')
    await uploadFilePDF(blob, PATH_PDF_STORAGE + formId + ".pdf")

    dirtyRef.current = false
    onDirty(false)

    console.log(`Successfully upload.`)
    setSaveStatus('success')
    setTimeout(() => setSaveStatus('idle'), 3000)
    setIsSaving(false)
  }, [])

  const handlePreUploadNewPDF = useCallback(async () => {
    if (urlPdf && annotationApiRef.current && annotationApiRef.current?.getAnnotations().length > 0) {
      const result: ButtonRender = await modal({
        title: "",
        body: "Do you want to keep your all old annotations?",
        show: true,
        buttons: [
          { class: "btn-secondary", text: "No", key: "no" },
          { class: "btn-primary", text: "Yes", key: "yes" }
        ]
      } as DataRenderModal)

      if (result.key == 'yes') {
        oldAnnotationTransferItems.current = await annotationApiRef.current?.exportAnnotations().toPromise()
      }
    }

    return true
  }, [])

  const handlePDFViewerOnready = useCallback((registry: PluginRegistry) => {
    // using import.meta.env.DEV because in dev mode, cancelledRef.current is alway true for unmount callback called 2 times.
    if (cancelledRef.current && !import.meta.env.DEV) return

    registryPDFViewerRef.current = registry

    const annotationPlugin = registry?.getPlugin<AnnotationPlugin>('annotation')?.provides()
    if (!annotationPlugin) return

    annotationApiRef.current = annotationPlugin

    const formPlugin = registry?.getPlugin<FormPlugin>('form')?.provides()
    const formScope = formPlugin?.forDocument(formId)

    // formScope?.getPageFormAnnoWidgets(0)

    if (!formScope) return
    if (!formPlugin) return

    formScopeRef.current = formScope

    const unloadingCallback = () => {
      setLoading(false)

      cleanupsRef.current.push(annotationPlugin.onAnnotationEvent((event) => {
        if (event.type == "loaded") return; // ignore at first loaded annotation

        dirtyRef.current = true
        onDirty(true)
      }))
    }

    cleanupsRef.current.push(
      formScope.onFormReady(async () => {
        // console.log("fields", nextFields, await formScope?.getPageFormAnnoWidgets(0).toPromise())
        if (!oldAnnotationTransferItems.current) {
          unloadingCallback()
        } else {
          annotationApiRef.current?.importAnnotations(oldAnnotationTransferItems.current)
          oldAnnotationTransferItems.current = null
          unloadingCallback()
        }
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
      {!reuploading && <>
        {urlPdf ? <>
          <div className='col-2'>
            {!loading && <div className='container-field-list'>
              <div>
                <Tooltip text='Upload this file to the cloud.' position='right'>
                  <button onClick={handleSavePdf} className={'btn btn-sm btn-primary'}>
                    {isSaving
                      ? 'Saving...'
                      : saveStatus === 'success'
                        ? 'Saved!'
                        : 'Save'}
                  </button>
                </Tooltip>
                <PDFUploader formId={formId} reupload={true} onPreUploadNewPDF={handlePreUploadNewPDF} onUploadNewPDF={handleUploadNewPdf} />
              </div>
              {registryPDFViewerRef.current && <DragAndDropFieldsList form={form} formId={formId} registryPDFViewer={registryPDFViewerRef.current} />}
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
            {registryPDFViewerRef.current && <PDFTrackedAnnotationList registryPDFViewer={registryPDFViewerRef.current} />}
          </div>
        </> :
          <PDFUploader formId={formId} reupload={false} onPreUploadNewPDF={handlePreUploadNewPDF} onUploadNewPDF={handleUploadNewPdf} />
        }
      </>}
    </div>
  );
})

export default PDFBuilder