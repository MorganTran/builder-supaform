
import {
  PDFViewer,
  type PluginRegistry,
  FormPlugin,
  type FormScope,
  ZoomMode
} from '@embedpdf/react-pdf-viewer'
import { useEffect, useRef, memo, type FC, useCallback } from 'react'
import { type FormSu } from '../../types/Form.ts'
import { type Submission } from '@formio/react';
import {fillPDFFormBySubmission} from './Services.ts';

interface PDFPreviewProps {
  form: FormSu,
  formId: string,
  submission: Submission | null
}


const PDFPreview: FC<PDFPreviewProps> = memo(({ form, formId, submission }) => {
  const documentIdRef = useRef<string>(formId + 'preview')
  const registryPDFViewerRef = useRef<PluginRegistry>(null)
  const cancelledRef = useRef<boolean>(false)
  const cleanupsRef = useRef<Array<() => void>>([])

  const formScopeRef = useRef<FormScope>(null)


  const handlePDFViewerOnready = useCallback((registry: PluginRegistry) => {
    // using import.meta.env.DEV because in dev mode, cancelledRef.current is alway true for unmount callback called 2 times.
    if (cancelledRef.current && !import.meta.env.DEV) return

    registryPDFViewerRef.current = registry

    const formPlugin = registry?.getPlugin<FormPlugin>('form')?.provides()
    const formScope = formPlugin?.forDocument(documentIdRef.current)

    if (!formScope) return
    if (!formPlugin) return

    formScopeRef.current = formScope


    const syncValues = async () => {
      // using import.meta.env.DEV because in dev mode, cancelledRef.current is alway true for unmount callback called 2 times.
      if (cancelledRef.current && !import.meta.env.DEV) return

      if (submission) {
        const convertedData: Record<string, string> = fillPDFFormBySubmission(form, submission.data)

        const _formPlugin = registry?.getPlugin<FormPlugin>('form')?.provides()
        const _formScope = _formPlugin?.forDocument(documentIdRef.current)
        await _formScope?.setFormValues(convertedData).toPromise()
      }
    }

    // setFields(formScope.getFormFields())
    // syncValues()

    cleanupsRef.current.push(
      formScope.onFormReady(async () => {
        // using import.meta.env.DEV because in dev mode, cancelledRef.current is alway true for unmount callback called 2 times.
        if (cancelledRef.current && !import.meta.env.DEV) return
        await syncValues()
      }),
    )

    cleanupsRef.current.push(
      formScope.onFieldValueChange(() => {
        console.log("onFieldValueChange", formScope.getFormValues())
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
                url: form.meta?.pdf_url ? form.meta?.pdf_url : "",
                documentId: documentIdRef.current,
              },
            ],
          },
          disabledCategories: ["zoom", "zoom-in", "zoom-out", "zoom-fit-page", "zoom-fit-width", "zoom-marquee", "zoom-level",
            "annotation", "annotation-markup", "annotation-highlight", "annotation-underline", "annotation-strikeout", "annotation-squiggly", "annotation-ink", "annotation-text", "annotation-stamp",
            "form", "form-textfield", "form-checkbox", "form-radio", "form-select", "form-listbox", "form-fill-mode",
            "annotation-shape", "annotation-rectangle", "annotation-circle", "annotation-line", "annotation-arrow", "annotation-polygon", "annotation-polyline",
            "redaction", "redaction-area", "redaction-text", "redaction-apply", "redaction-clear",
            "document", "document-open", "document-close", "document-print", "document-capture", "document-export", "document-fullscreen", "document-protect",
            "page", "spread", "rotate", "scroll", "navigation",
            "panel", "panel-sidebar", "panel-search", "panel-comment",
            "tools", "pan", "pointer", "capture",
            "selection", "selection-copy",
            "history", "history-undo", "history-redo",
            "insert", "insert-rubber-stamp", "insert-signature", "insert-image",
            "security", "security-unlock-overlay"]
        }}
      />
    </div>
  );
})

export default PDFPreview