import { useState, useEffect, useCallback } from 'react'
import { HomeBuildForm } from './components/BuilderForm/Home.tsx'
import { HomeBuilderTemplateForm } from './components/BuilderTemplateForm/Home.tsx'
import { loginAnonymously, fetchJsonFromStorage, listFilesAndGetContentWithPagination } from './firebase.ts'
import { type User } from 'firebase/auth';
import { type FormSu, FormSuSchema, type TemplateSu, TemplateSuSchema } from './types/Form.ts'
import { PATH_FORM_STORAGE, PATH_TEMPLATE_STORAGE, PREFIX_TEMPLATE_ID } from './types/Consts.ts'

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [form, setForm] = useState<FormSu | null>(null);
  const [templates, setTemplates] = useState<TemplateSu[] | null>(null);
  const [formId, setFormId] = useState<string | null>(null);

  // Calling loginAnonymously after the initial render app.
  useEffect(() => {
    (async () => {
      const fr_id = window.location.pathname.replace("/", "")
      const fetchFormData = async (): Promise<FormSu | null> => {

        let path: string = PATH_FORM_STORAGE + fr_id + '.json';

        if (fr_id.startsWith(PREFIX_TEMPLATE_ID)) {
          path = PATH_TEMPLATE_STORAGE + fr_id + '.json';
        }


        const _form = await fetchJsonFromStorage(path)

        try {
          const _fr = FormSuSchema.parse(_form)

          setFormId(fr_id)

          return _fr
        } catch (error) {
          console.error("parse form error and skip:", error);
        }

        return null
      }

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

      const loginAndSetUser = async (): Promise<User | null> => {
        const _user = await loginAnonymously()

        return _user
      };
      const uPromise: Promise<User | null> = loginAndSetUser()

      if (fr_id) {
        const frPromise: Promise<FormSu | null> = fetchFormData()
        const [_form, _user] = await Promise.all([frPromise, uPromise]);
        setUser(_user)
        setForm(_form)
      } else {
        const tpsPromise: Promise<TemplateSu[] | null> = fetchTemplates()
        const [_templates, _user] = await Promise.all([tpsPromise, uPromise]);
        setUser(_user)
        setTemplates(_templates)
      }

    })()
  }, []);


  const handleCreatedNewForm = useCallback((_form: FormSu, _fr_id: string): void => {
    setFormId(_fr_id)
    setForm(_form)
    window.history.pushState({}, "", "/" + _fr_id);
  }, [])

  let page = <div className="spinner-grow text-primary spinner-loading" role="status">
    <span className="sr-only"></span>
  </div>
  if (user) {
    if (form && formId) {
      page = <HomeBuildForm form={form} formId={formId} />
    } else if (templates) {
      page = <HomeBuilderTemplateForm user={user} templates={templates} onCreatedNewForm={handleCreatedNewForm} />
    }
  }
  return (
    <>
      {page}
    </>
  )
}

export default App
