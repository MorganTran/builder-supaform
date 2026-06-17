import { useState, useCallback, useRef, type FC, useEffect } from 'react'
import { FormBuilder, type FormType, type FormSource, type Submission } from '@formio/react';
import { Header } from './Header.tsx'
import { Setting } from './Setting.tsx'
import { Preview } from './Preview.tsx'
import { uploadFileJson } from '../../firebase.ts'
import { type FormSu, FormSuSchema } from '../../types/Form.ts'
import { PATH_FORM_STORAGE, PATH_TEMPLATE_STORAGE, EVENT_FORMSUSCHEMACHANGE, EVENT_FORMSUSCHEMACHANGESUCCESSFULLY } from '../../types/Consts.ts'

interface HomeProps {
  form: FormSu,
  formId: string
}

async function updateForm(form: FormSu, formId: string): Promise<string> {
  const jsStr = JSON.stringify(form);
  let fileName = PATH_FORM_STORAGE + formId + ".json"
  if(form.meta.form_su == 'template'){
    fileName = PATH_TEMPLATE_STORAGE + formId + ".json"
  }

  await uploadFileJson(jsStr, fileName)

  return formId
}

let envChange: () => void = () => { }

const HomeBuildForm: FC<HomeProps> = ({ form, formId }) => {
  const timerAutoFrom = useRef(0)
  const [activeMode, setActiveMode] = useState<string | null>('build');

  useEffect(() => {

    const htmlElement = document.documentElement;
    
    htmlElement.classList.add('lm');
    document.getElementById('su-header')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });

    // remove first to make sure event listener once time
    window.removeEventListener(EVENT_FORMSUSCHEMACHANGE, envChange);
    envChange = () => {
      const customEvent = event as CustomEvent

      clearTimeout(timerAutoFrom.current)
      const _form = customEvent.detail
      timerAutoFrom.current = setTimeout(async () => {
        const meta = _form?.meta;
        if (meta) {
          Object.assign(meta, { "updated_at": (new Date()).toISOString() });
          Object.assign(form.meta, meta); // merge once time for meta
          delete _form.meta; // delete to meta without mergine below again.
        } else {
          // if having updating other field like form "components" property
          Object.assign(form.meta, { "updated_at": (new Date()).toISOString() });
        }

        Object.assign(form, _form)

        await updateForm(FormSuSchema.parse(form), formId)
        window.dispatchEvent(new CustomEvent(EVENT_FORMSUSCHEMACHANGESUCCESSFULLY, { detail: form }));
      }, 2000)

    }
    window.addEventListener(EVENT_FORMSUSCHEMACHANGE, envChange);

    return () => {
      window.removeEventListener(EVENT_FORMSUSCHEMACHANGE, envChange);
    };
  }, []);

  const handleChangeModeOfBuilder = useCallback((mode: string): void => {
    setActiveMode(mode)
  }, [])
  const handleChangeSettingForm = useCallback((settings: Submission): void => {
    console.log('settings', settings)
  }, [])

  const handleChangeJsonBuilder = useCallback((_form: FormType): void => {
    window.dispatchEvent(new CustomEvent(EVENT_FORMSUSCHEMACHANGE, { detail: { "components": _form.components } }));
  }, [])
  return (
    <>
      <Header onChangeModeOfFormBuilder={handleChangeModeOfBuilder} form={form} formId={formId} />
      <div className="container-fluid">
        <div className="row"><p></p></div>
        <div className="row"><div className='col'>
          {activeMode == 'build' ? <FormBuilder initialForm={form as unknown as FormSource} onChange={handleChangeJsonBuilder} /> : null}
          {activeMode == 'setting' ? <Setting onChangeSetting={handleChangeSettingForm} meta={form.meta} /> : null}
          {activeMode == 'preview' ? <Preview formId={formId} form={form}/> : null}
        </div></div>
      </div>
    </>
  )
}

export default HomeBuildForm