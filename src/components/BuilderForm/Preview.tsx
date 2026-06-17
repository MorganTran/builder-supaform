import { type FC, memo, useCallback, useRef, useEffect, useState } from 'react';
import { Form, type FormType, type Submission } from '@formio/react';
import { Webform } from '@formio/js';
import { type FormSu } from '../../types/Form.ts'
import ReactTypescriptTutorial from './Tutorials/ReactTypescript.tsx'
import ReactTutorial from './Tutorials/React.tsx'
import HTMLTutorial from './Tutorials/Html.tsx'
// import IframeTutorial from './Tutorials/iframe.tsx'
import SyntaxHighlighter from 'react-syntax-highlighter';
import { monokaiSublime } from 'react-syntax-highlighter/dist/esm/styles/hljs';

interface PreviewProps {
    formId: string,
    form: FormSu
}

export const Preview: FC<PreviewProps> = memo(({ formId, form }) => {
    const [activeButton, setActiveButton] = useState<string | null>('react-typescript');
    const formInstance = useRef<Webform | null>(null);
    const [strSubmission, setStrSubmission] = useState("")
    useEffect(() => {

        return () => {

        };
    }, []);

    const handleButtonClick = (mode: string): void => {
        setActiveButton(mode);
    };

    const handleSummit = useCallback((submission: Submission): void => {
        setStrSubmission(JSON.stringify(submission, null, 2))
        if (formInstance.current) {
            formInstance.current.redraw()
        }
    }, []);

    const handleFormReady = useCallback((instance: Webform): void => {
        formInstance.current = instance
    }, []);

    let tutorialComp = null;
    if (activeButton == 'react-typescript') {
        tutorialComp = <ReactTypescriptTutorial formId={formId} />
    } else if (activeButton == 'react') {
        tutorialComp = <ReactTutorial formId={formId} />
    } else if (activeButton == 'html') {
        tutorialComp = <HTMLTutorial formId={formId} />
    }/*else if(activeButton == 'iframe'){
        tutorialComp = <IframeTutorial formId={formId} />
    }*/

    return (
        <div className='container-fluid'>
            <div className='row'>
                <div className="col-4">
                    <Form src={form as unknown as FormType} onSubmit={handleSummit} onFormReady={handleFormReady} />
                </div>
                <div className="col-8">
                    {strSubmission && <div>
                        <span>Your Submission</span>
                        <SyntaxHighlighter language="json" style={monokaiSublime}>
                            {strSubmission}
                        </SyntaxHighlighter>
                    </div>}
                    <ul className="nav nav-tabs">
                        <li className={`nav-item`}>
                            <a className={`nav-link ${activeButton === 'react-typescript' ? 'active' : ''
                                }`} href="#" onClick={(e) => { e.preventDefault(); handleButtonClick('react-typescript') }}>React Typescript</a>
                        </li>
                        <li className={`nav-item`}>
                            <a className={`nav-link ${activeButton === 'react' ? 'active' : ''
                                }`} href="#" onClick={(e) => { e.preventDefault(); handleButtonClick('react') }}>React</a>
                        </li>
                        <li className={`nav-item`}>
                            <a className={`nav-link ${activeButton === 'html' ? 'active' : ''
                                }`} href="#" onClick={(e) => { e.preventDefault(); handleButtonClick('html') }}>HTML</a>
                        </li>
                        <li className={`nav-item`}>
                            <a className={`nav-link ${activeButton === 'iframe' ? 'active' : ''
                                }`} href="#" onClick={(e) => { e.preventDefault(); handleButtonClick('iframe') }}>iFrame</a>
                        </li>
                    </ul>
                    {tutorialComp}
                </div>
            </div>
        </div>
    );
})