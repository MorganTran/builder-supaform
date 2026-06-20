import { useCallback, useEffect, useState, useRef, type FC, memo, type ReactNode } from 'react';
import { listFilesAndGetContentWithPagination } from '../../firebase.ts'
import TemplateCard from './TemplateCard.tsx'
import { type TemplateSu, TemplateSuSchema, FormSuSchema } from '../../types/Form.ts'
import { PATH_TEMPLATE_STORAGE } from '../../types/Consts.ts'

interface TemplateListProps {
  onChooseMakeAFreshFormFromTemplate: (template: TemplateSu) => void,
  onChooseMakeAFreshForm: () => void;
  onChooseMakeAFreshTemplate: () => void;
}

export const TemplateList: FC<TemplateListProps> = memo(({ onChooseMakeAFreshFormFromTemplate, onChooseMakeAFreshForm, onChooseMakeAFreshTemplate }) => {
  const [templates, setTemplates] = useState<TemplateSu[] | null>(null);
  const sectionDomRef = useRef(null)
  useEffect(() => {
    (async () => {

      const fetchTemplates = async (): Promise<TemplateSu[]> => {
        const listTps = await listFilesAndGetContentWithPagination(PATH_TEMPLATE_STORAGE)
        const resultTps = []
        for (let _index = 0; _index < listTps.length; _index++) {
          const _filetemplate = listTps[_index];

          try {
            const _tpl: TemplateSu = TemplateSuSchema.parse({ template_id: _filetemplate.name.replace(".json", ""), form: FormSuSchema.parse(_filetemplate.content) })
            resultTps.push(_tpl)
          } catch (error) {
            console.error("parse form error and skip:", error);
          }
        }

        return resultTps
      }

      const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(async (entry) => {
          if (entry.isIntersecting) {

            const _templates: TemplateSu[] = await fetchTemplates()
            setTemplates(_templates)
            observer.unobserve(entry.target);
          }
        });
      });

      if (sectionDomRef.current) {
        observer.observe(sectionDomRef.current);
      }

    })()
  }, []);
  const handleCreateAFreshFormFromTemplate = useCallback((_template: TemplateSu): void => {
    onChooseMakeAFreshFormFromTemplate(_template)
  }, []);

  const handleCreateAForm = useCallback((): void => {
    onChooseMakeAFreshForm()
  }, []);
  const handleCreateATemplate = useCallback((): void => {
    onChooseMakeAFreshTemplate()
  }, []);

  let listEl: (ReactNode | null)[] = [<div className="spinner-grow text-primary spinner-loading" role="status">
    <span className="sr-only"></span>
  </div>]

  if (templates) {
    listEl = templates.map((template) => {
      if (template.form.meta.published) {
        return <TemplateCard key={template.template_id} template={template} onUseTemplate={handleCreateAFreshFormFromTemplate} />
      } else {
        return null
      }
    })
  }

  return (
    <section id="templates" ref={sectionDomRef} className="sp" style={{ background: "var(--bg2)" }}>
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
          {listEl}
        </div>
      </div>
    </section>
  );
})