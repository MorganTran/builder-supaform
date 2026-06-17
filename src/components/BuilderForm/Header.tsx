import { useState, type FC, memo, useCallback, useEffect } from 'react';
import { type FormSu, type Meta } from '../../types/Form.ts'
import moment from 'moment'
import Logo from '../Logo'
import { TextSnippet } from '../TextSnippet'
import { EVENT_FORMSUSCHEMACHANGE, EVENT_FORMSUSCHEMACHANGESUCCESSFULLY } from '../../types/Consts.ts'

interface HeaderProps {
  form: FormSu,
  formId: string,
  onChangeModeOfFormBuilder: (id: string) => void;
}

interface LabelUpdateDateProps {
  meta: Meta
}

let envChange: () => void = () => { }

const LabelUpdateDate: FC<LabelUpdateDateProps> = memo(({ meta }) => {
  const [_meta, setMeta] = useState<Meta>(meta);

  useEffect(() => {
    // remove first to make sure event listener once time
    window.removeEventListener(EVENT_FORMSUSCHEMACHANGESUCCESSFULLY, envChange);
    envChange = () => {
      const customEvent = event as CustomEvent

      setMeta({ ...customEvent.detail.meta })
    }
    window.addEventListener(EVENT_FORMSUSCHEMACHANGESUCCESSFULLY, envChange);

    return () => {
      window.removeEventListener(EVENT_FORMSUSCHEMACHANGESUCCESSFULLY, envChange);
    };
  }, []);

  return <div className="align-self-center saveStatus tethers saveStatus-saved">Latest update: {moment(_meta.updated_at).calendar()}</div>
})

export const Header: FC<HeaderProps> = memo(({ form, onChangeModeOfFormBuilder }) => {
  const [activeButton, setActiveButton] = useState<string | null>('build');
  const [name, setName] = useState<string | null>(form.meta.display_name);

  const handleButtonClick = useCallback((mode: string): void => {
    setActiveButton(mode);
    onChangeModeOfFormBuilder(mode)
  }, []);

  const handleChangeFormName = useCallback((event: React.ChangeEvent<HTMLInputElement>): void => {
    const _name = event.target.value;
    setName(_name)

    window.dispatchEvent(new CustomEvent(EVENT_FORMSUSCHEMACHANGE, { detail: { "meta": { "display_name": _name } } }));
  }, [])

  return (
    <>
      <div className="container-fluid">
        <div className='row su-header' id="su-header">
          <div className="col">
            <a href="/" className="d-flex align-items-center gap-2 logo-header" style={{ fontSize: "1.2rem", fontWeight: "700", color: "var(--tx)" }}>
              <Logo />
              <span>Supaform</span>
            </a>
          </div>

          <div className='col'>
            <form className="form-inline formsu-title">
              <div className='w-100'>
                <input className="form-control mr-sm-2" type="Form name" placeholder="Form name" aria-label="Form name" onChange={handleChangeFormName} value={name ?? ""} />
              </div>
              <div className='w-100'>
                <LabelUpdateDate meta={form.meta} />
              </div>
            </form>
          </div>

          <div className='col-3'>
            <div className='w-100'>
              <span>Share with link</span>
            </div>
            <div className='w-100'>
              <TextSnippet text={window.location + ""} cl="hbadge text-dark share-with-url-header" />
            </div>
          </div>
          <div className='col-1'>
            <a className="float-end github-icon" aria-label="GitHub repository" href={import.meta.env.VITE_ENDPOINT_GITHUT_SRC} target="_blank">
              <svg height="32" aria-hidden="true" data-component="Octicon" viewBox="0 0 24 24" version="1.1" width="32" data-view-component="true" className="octicon octicon-mark-github">
                <path d="M10.226 17.284c-2.965-.36-5.054-2.493-5.054-5.256 0-1.123.404-2.336 1.078-3.144-.292-.741-.247-2.314.09-2.965.898-.112 2.111.36 2.83 1.01.853-.269 1.752-.404 2.853-.404 1.1 0 1.999.135 2.807.382.696-.629 1.932-1.1 2.83-.988.315.606.36 2.179.067 2.942.72.854 1.101 2 1.101 3.167 0 2.763-2.089 4.852-5.098 5.234.763.494 1.28 1.572 1.28 2.807v2.336c0 .674.561 1.056 1.235.786 4.066-1.55 7.255-5.615 7.255-10.646C23.5 6.188 18.334 1 11.978 1 5.62 1 .5 6.188.5 12.545c0 4.986 3.167 9.12 7.435 10.669.606.225 1.19-.18 1.19-.786V20.63a2.9 2.9 0 0 1-1.078.224c-1.483 0-2.359-.808-2.987-2.313-.247-.607-.517-.966-1.034-1.033-.27-.023-.359-.135-.359-.27 0-.27.45-.471.898-.471.652 0 1.213.404 1.797 1.235.45.651.921.943 1.483.943.561 0 .92-.202 1.437-.719.382-.381.674-.718.944-.943"></path>
              </svg>
            </a>
          </div>
        </div>
      </div>
      <div className="secondaryHeader">
        <div className="row justify-content-center">
          <div className="col-4">
            <ul className="nav nav-tabs d-flex justify-content-center">
              <li className={`nav-item`}>
                <a className={`nav-link ${activeButton === 'build' ? 'active' : ''
                  }`} href="#" onClick={(e) => { e.preventDefault(); handleButtonClick('build') }}>Build</a>
              </li>
              {form.meta.form_su == 'template' && <li className={`nav-item`}>
                <a className={`nav-link ${activeButton === 'setting' ? 'active' : ''
                  }`} href="#" onClick={(e) => { e.preventDefault(); handleButtonClick('setting') }}>Setting Template</a>
              </li>}
              <li className={`nav-item`}>
                <a className={`nav-link ${activeButton === 'preview' ? 'active' : ''
                  }`} href="#" onClick={(e) => { e.preventDefault(); handleButtonClick('preview') }}>Preview</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>

  );
})