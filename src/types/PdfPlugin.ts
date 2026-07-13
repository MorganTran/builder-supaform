
import {
  AnnotationPlugin,
  ScrollPlugin
} from '@embedpdf/react-pdf-viewer'

export type AnnotationApi = ReturnType<AnnotationPlugin['provides']>
export type ScrollApi = ReturnType<ScrollPlugin['provides']>