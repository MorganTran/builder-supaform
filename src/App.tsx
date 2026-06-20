import { useState, useEffect, useCallback } from 'react'
import { HomeBuildForm } from './components/BuilderForm/Home.tsx'
import { HomeBuilderTemplateForm } from './components/BuilderTemplateForm/Home.tsx'
import { loginAnonymously, fetchJsonFromStorage } from './firebase.ts'
import { type User } from 'firebase/auth';
import { type FormSu, FormSuSchema } from './types/Form.ts'
import { PATH_FORM_STORAGE, PATH_TEMPLATE_STORAGE, PREFIX_TEMPLATE_ID } from './types/Consts.ts'

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [form, setForm] = useState<FormSu | null>(null);
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
        const [_user] = await Promise.all([uPromise]);
        setUser(_user)
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
    } else {
      page = <HomeBuilderTemplateForm user={user} onCreatedNewForm={handleCreatedNewForm} />
    }
  }
  return (
    <>
      {page}
    </>
  )
}

export default App
