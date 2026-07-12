
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
import { mappingFormComponentFieldsAndPDFFields } from './Services.ts'
import { ENUM_FORMPDFFIELDTYPE } from '../../types/Consts.ts'
import _ from 'lodash'

interface PDFPreviewProps {
  form: FormSu,
  formId: string,
  submission: Submission | null
}

function fillPDFFormBySubmission(form: FormSu, data: Record<string, any>): Record<string, any> {
  const convertedData: Record<string, string> = {}
  const fields = mappingFormComponentFieldsAndPDFFields(form.components)
  console.log("fillPDFFormBySubmission")
  for (let index = 0; index < fields.length; index++) {
    const field = fields[index];
    let value;
    switch (field.type) {
      case ENUM_FORMPDFFIELDTYPE.TEXTFIELD:

        value = data[field.key]
        // If the value is an object/array, stringify it; otherwise, use standard string conversion
        const stringValue = typeof value === 'object' && value !== null
          ? JSON.stringify(value)
          : String(value);
        convertedData[field.key] = stringValue
        break;
      case ENUM_FORMPDFFIELDTYPE.CHECKBOX:

        value = _.get(data, field.key)
        if (typeof value == 'boolean') {
          convertedData[field.key] = value ? 'Yes' : 'Off'
        }

        break;
      case ENUM_FORMPDFFIELDTYPE.RADIOBUTTON:
        value = _.get(data, field.compkey);
        let subv = field.key.split(field.compkey+".")[1];
        if (value == subv)
          convertedData[field.key] = "Yes";
        break;
      case ENUM_FORMPDFFIELDTYPE.IMAGE:

        break;
      default:
        break;
    }
  }

  return convertedData
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

    // formPluginRef.current = formPlugin
    formScopeRef.current = formScope

    // formScope.setFormFieldValues(1, )

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
      formScope.onFormReady(async (nextFields) => {
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