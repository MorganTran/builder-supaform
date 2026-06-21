import { useState, useCallback, useRef, type FC, useEffect } from 'react'
import { FormBuilder, type FormType, type FormSource, type Submission } from '@formio/react';
import { Header } from './Header.tsx'
import { Setting } from './Setting.tsx'
import { Preview } from './Preview.tsx'
import { updateForm, mergeFormUpdate } from './Services.ts'
import { type FormSu, FormSuSchema } from '../../types/Form.ts'
import { PATH_FORM_STORAGE, PATH_TEMPLATE_STORAGE, PREFIX_TEMPLATE_ID, EVENT_FORMSUSCHEMACHANGE, EVENT_FORMSUSCHEMACHANGESUCCESSFULLY } from '../../types/Consts.ts'
import { type User } from 'firebase/auth';
import { fetchJsonFromStorage, loginAnonymously } from '../../firebase.ts'

let envChange: () => void = () => { }

export const HomeBuildForm: FC = () => {
  const [pageType, setPageType] = useState<string>('loading');
  const [form, setForm] = useState<FormSu | null>(null);
  const [formId, setFormId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const timerAutoFrom = useRef(0)
  const [activeMode, setActiveMode] = useState<string | null>('build');

  useEffect(() => {

    const htmlElement = document.documentElement;

    htmlElement.classList.add('lm');
    document.getElementById('su-header')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });

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

          setPageType("404")
          return null
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
        setFormId(fr_id)
        if (_form && _user)
          setPageType("builder")
        else
          setPageType("404")
      }

    })()

    return () => {
      window.removeEventListener(EVENT_FORMSUSCHEMACHANGE, envChange);
    };
  }, []);

  useEffect(() => {
    if (form && formId) {
      // remove first to make sure event listener once time
      window.removeEventListener(EVENT_FORMSUSCHEMACHANGE, envChange);
      envChange = () => {
        const customEvent = event as CustomEvent

        clearTimeout(timerAutoFrom.current)

        timerAutoFrom.current = setTimeout(async () => {
          const result = mergeFormUpdate(form, customEvent.detail)

          Object.assign(form, result)

          await updateForm(FormSuSchema.parse(form), formId)
          window.dispatchEvent(new CustomEvent(EVENT_FORMSUSCHEMACHANGESUCCESSFULLY, { detail: form }));
        }, 2000)

      }
      window.addEventListener(EVENT_FORMSUSCHEMACHANGE, envChange);
    }
  }, [formId])

  const handleChangeModeOfBuilder = useCallback((mode: string): void => {
    setActiveMode(mode)
  }, [])
  const handleChangeSettingForm = useCallback((settings: Submission): void => {
    console.log('settings', settings)
  }, [])

  const handleChangeJsonBuilder = useCallback((_form: FormType): void => {
    window.dispatchEvent(new CustomEvent(EVENT_FORMSUSCHEMACHANGE, { detail: { "components": _form.components } }));
  }, [])

  let page = <div className="spinner-grow text-primary spinner-loading" role="status">
    <span className="sr-only"></span>
  </div>

  switch (pageType) {
    case "404":
      page = <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <h4>404 FORM NOT FOUND.</h4>
        </div>
      </div>;
      break;
    case "builder":
      if (user && formId && form) {
        page = <>
          <Header onChangeModeOfFormBuilder={handleChangeModeOfBuilder} form={form} formId={formId} />
          <div className="container-fluid">
            <div className="row"><p></p></div>
            <div className="row"><div className='col'>
              {activeMode == 'build' ? <FormBuilder initialForm={form as unknown as FormSource} onChange={handleChangeJsonBuilder} /> : null}
              {activeMode == 'setting' ? <Setting onChangeSetting={handleChangeSettingForm} meta={form.meta} /> : null}
              {activeMode == 'preview' ? <Preview formId={formId} form={form} /> : null}
            </div></div>
          </div>
        </>
      }
      break;

    default:
      break;
  }


  return (
    page
  )
}