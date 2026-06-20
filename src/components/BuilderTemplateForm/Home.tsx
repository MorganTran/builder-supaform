import { type FC, memo } from 'react'
import { Header } from './Header.tsx'
import { TemplateList } from './TemplateList.tsx'
import HeroSection from './HeroSection.tsx'

interface HomeBuilderTemplateFormProps {}

export const HomeBuilderTemplateForm: FC<HomeBuilderTemplateFormProps> = memo(({ }) => {
  return (
    <>
      <Header />
      <HeroSection />
      <div className="bg-circles w-full opacity-20 pointer-events-none absolute left-0 right-0 top-36 w-full h-36 max-w-xl m-auto z-0">
        <div className="w-2/6 h-36 radius-full absolute top-1/2 left-0 transform -translate-y-18 bg-forms-dark" style={{ filter: "blur(90px)" }}></div>
        <div className="w-2/6 h-36 radius-full absolute top-1/2 left-1/2 transform -translate-y-18 -translate-x-1/2 bg-ai-default" style={{ filter: "blur(90px)" }}></div>
        <div className="w-2/6 h-36 radius-full absolute top-1/2 right-0 transform -translate-y-18 bg-pdf-default" style={{ filter: "blur(90px)" }}></div>
      </div>
      <TemplateList />
      <footer id="foot">
        <div className="container-fluid">
          <div className="row">
            <div className="col">
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 pt-4" style={{ borderTop: "1px solid var(--bd)" }}>
                <p style={{ fontSize: ".8rem", color: "var(--tx3)", margin: 0 }}>Design by <a target="_blank" className="text-primary fw-bold" href="https://themewagon.com/themes/nexusai/">Nexusai theme of ThemeWagon</a> </p>
                <div className="d-flex gap-2"><a href={import.meta.env.VITE_ENDPOINT_LINKEDIN} target="_blank" className="sico"><i className="fa-brands fa-linkedin-in"></i></a></div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
})