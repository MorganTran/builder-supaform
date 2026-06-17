import { type FC, memo } from 'react';
import { CodeSnippetCard } from '../../CodeSnippet.tsx'
import { TextSnippet } from '../../TextSnippet'

interface ReactTutorialProps {
    formId: string
}

export const ReactTutorial: FC<ReactTutorialProps> = memo(({ formId }) => {
    const urlFormJson = import.meta.env.VITE_ENDPOINT_FORMJSON.replace("{{formId}}", formId)
    const code = `
import { useRef, useEffect, useState, useCallback } from 'react';
import { Form } from '@formio/react';
import '@formio/js/dist/formio.full.css';
export const CompForm = () => {
    const formInstance = useRef(null);
    const [formDefination, setFormDefination] = useState(null);

    useEffect(() => {
        let getAndSetForm = async() => {
            let _formDefination = await (await fetch("${urlFormJson}")).json();

            setFormDefination(_formDefination)
        }
        
        getAndSetForm()
    }, []);

    const handleFormReady = (instance) => {
        formInstance.current = instance;
    }
    
    const handleSummit = useCallback((submission) => {
        console.log("Your submission is", submission, " and then you can handle calling the API.");

        if (formInstance.current) {
            formInstance.current.redraw()
        }
    }, []);

    return (
        <Form onSubmit={handleSummit} onFormReady={handleFormReady}  src={formDefination}/>
    );
}
    `
    return <div>
        <h5>Npm</h5>
        <TextSnippet text="npm install @formio/react --save; npm install @formio/js --save" cl={"p-3 mb-2 bg-dark text-white"} />
        <h5>Yarn</h5>
        <TextSnippet text="yarn add @formio/react @formio/js" cl={"p-3 mb-2 bg-dark text-white"} />
        <h5>Your index.html</h5>
        <TextSnippet text={`<link href="https://cdn.jsdelivr.net/npm/bootstrap-icons/font/bootstrap-icons.css" rel="stylesheet">
  <link href="${import.meta.env.VITE_ENDPOINT_IFRAME}/bootstrap.min.css" rel="stylesheet">`} cl={"p-3 mb-2 bg-dark text-white"} />
        <h5>Usage</h5>
        <CodeSnippetCard language='javascript' code={code} />
    </div>
})

export default ReactTutorial