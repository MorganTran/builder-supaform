import { useCallback, type FC, memo } from 'react';
import { type TemplateSu } from '../../types/Form.ts'
import TemplateCard from './TemplateCard.tsx'

interface TemplateListProps {
  templates: TemplateSu[],
  onChooseMakeAFreshFormFromTemplate: (template: TemplateSu) => void,
  onChooseMakeAFreshForm: () => void;
  onChooseMakeAFreshTemplate: () => void;
}

export const TemplateList: FC<TemplateListProps> = memo(({ templates, onChooseMakeAFreshFormFromTemplate, onChooseMakeAFreshForm, onChooseMakeAFreshTemplate }) => {

  const handleCreateAFreshFormFromTemplate = useCallback((_template: TemplateSu): void => {
    onChooseMakeAFreshFormFromTemplate(_template)
  }, []);

  const handleCreateAForm = useCallback((): void => {
    onChooseMakeAFreshForm()
  }, []);
  const handleCreateATemplate = useCallback((): void => {
    onChooseMakeAFreshTemplate()
  }, []);

  return (
    <section id="templates" className="sp" style={{ background: "var(--bg2)" }}>
      <div className="container-fluid">
        <div className="text-center mb-5 rv in">
          <h2 className="stitle">Free Online <span className="gt">Form Templates</span></h2>
          <p className="ssub mx-auto"><span className="gt">Supaform</span> offer a selection of free-form templates available online.
            If you can't find a template that fits your needs,
            click <a className="gt" href="" onClick={(e) => { e.preventDefault(); handleCreateAForm(); }}>
              here
            </a> to
            create a new empty form.</p>
          {(window.location + "").startsWith("http://localhost") && <button type="button" className="btn btn-primary" onClick={handleCreateATemplate}><i className="bi bi-plus"></i>Create A Template</button>}
        </div>
        <div className='row g-3'>
          {
            templates.map((template) => {
              if (template.form.meta.published) {
                return <TemplateCard key={template.template_id} template={template} onUseTemplate={handleCreateAFreshFormFromTemplate} />
              } else {
                return null
              }
            })
          }
        </div>
      </div>
    </section>
  );
})