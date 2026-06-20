import { useCallback, type FC, memo } from 'react'
import { Header } from './Header.tsx'
import { TemplateList } from './TemplateList.tsx'
import { createNewForm, createNewTemplate } from './Services.ts'
import HeroSection from './HeroSection.tsx'
import { FormSuSchema, type FormSu, type TemplateSu } from '../../types/Form.ts'
import { INIT_FORM_DEFINITION, INIT_TEMPLATEFORM_DEFINITION } from '../../types/Consts.ts'
import { type User } from 'firebase/auth';

interface HomeBuilderTemplateFormProps {
  user: User,
  onCreatedNewForm: (_form: FormSu, fr_id: string) => void;
}

export const HomeBuilderTemplateForm: FC<HomeBuilderTemplateFormProps> = memo(({ user, onCreatedNewForm }) => {
  const handleChooseMakeAFreshForm = useCallback((): void => {
    const form: FormSu = FormSuSchema.parse(JSON.parse(JSON.stringify(INIT_FORM_DEFINITION)))

    const fr_id = createNewForm(form, user.uid)
    onCreatedNewForm(form, fr_id)
  }, [])
  const handleChooseMakeAFreshTemplate = useCallback((): void => {
    const form: FormSu = FormSuSchema.parse(JSON.parse(JSON.stringify(INIT_TEMPLATEFORM_DEFINITION)))

    const fr_id = createNewTemplate(form, user.uid)
    onCreatedNewForm(form, fr_id)
  }, [])
  const handleUseTemplateToCreateForm = useCallback((template: TemplateSu): void => {
    const _form = JSON.parse(JSON.stringify(template.form));
    _form.meta.form_su = 'normal'
    const form: FormSu = FormSuSchema.parse(_form);

    const fr_id = createNewForm(form, user.uid);
    onCreatedNewForm(form, fr_id);
  }, [])
  return (
    <>
      <Header />
      <HeroSection />
      <div className="bg-circles w-full opacity-20 pointer-events-none absolute left-0 right-0 top-36 w-full h-36 max-w-xl m-auto z-0">
        <div className="w-2/6 h-36 radius-full absolute top-1/2 left-0 transform -translate-y-18 bg-forms-dark" style={{ filter: "blur(90px)" }}></div>
        <div className="w-2/6 h-36 radius-full absolute top-1/2 left-1/2 transform -translate-y-18 -translate-x-1/2 bg-ai-default" style={{ filter: "blur(90px)" }}></div>
        <div className="w-2/6 h-36 radius-full absolute top-1/2 right-0 transform -translate-y-18 bg-pdf-default" style={{ filter: "blur(90px)" }}></div>
      </div>
      <TemplateList onChooseMakeAFreshFormFromTemplate={handleUseTemplateToCreateForm} onChooseMakeAFreshForm={handleChooseMakeAFreshForm} onChooseMakeAFreshTemplate={handleChooseMakeAFreshTemplate} />
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