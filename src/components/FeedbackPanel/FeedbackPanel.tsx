import { useState, useCallback, memo, type FC, useRef } from 'react';
import { Form, type FormType, type Submission } from '@formio/react';
import { Webform } from '@formio/js';
import { FeedbackFormSchema } from '../../types/Form.ts'
import { saveFeedbackForm } from './Services'

const formFeedbackDefinition: FormType = {
    "display": "form",
    "components": [
        {
            "label": "Email",
            "description": "if you would leave email, I can contact you again.",
            "tableView": true,
            "validateWhenHidden": false,
            "key": "email",
            "type": "email",
            "input": true
        },
        {
            "label": "Your feedback",
            "description": "Any your feedback is worth to me.",
            "tableView": true,
            "validateWhenHidden": false,
            "validate": {
                "required": true
            },
            "autofocus": true,
            "key": "feedback",
            "type": "textarea",
            "input": true
        },
        {
            "label": "Submit",
            "size": "sm",
            "block": true,
            "disableOnInvalid": true,
            "tableView": false,
            "key": "submit",
            "type": "button",
            "input": true
        }
    ]
}

const beforeUnloadHandler = (event:Event) => {
    // Recommended
    event.preventDefault();

    // Included for legacy support, e.g. Chrome/Edge < 119
    event.returnValue = true;
};

export const FeedbackPanel: FC = memo(() => {
    const [showPanel, setShowPanel] = useState(false)
    const [showThankyou, setShowThankyou] = useState(false)
    const dirty = useRef<boolean>(false)
    const loading = useRef<boolean>(false)
    const formInstance = useRef<Webform | null>(null);
    const keyform = useRef<string>(Date.now() + "")
    const handleButtonClick = useCallback((v: boolean): void => {
        if (dirty.current && !v) {
            if (confirm("Would you complete your feedback before leaving out?") == true) {
                return
            }
        }
        setShowPanel(v)
        const htmlElement = document.documentElement;

        if (v) {
            htmlElement.classList.add('modal-backdrop');
        } else {
            htmlElement.classList.remove('modal-backdrop');
        }

        window.removeEventListener("beforeunload", beforeUnloadHandler)
        dirty.current = false

    }, []);

    const handleSummit = useCallback(async (submission: Submission): Promise<void> => {
        loading.current = true
        const now = new Date()
        const _fback = { ...submission.data }
        const _fbackId = Date.now() + ''

        _fback.updated_at = now.toISOString();
        _fback.created_at = now.toISOString();

        await saveFeedbackForm(FeedbackFormSchema.parse(_fback), _fbackId)

        if (formInstance.current)
            formInstance.current.redraw()
        setShowThankyou(true)

        setTimeout(()=>{
            setShowThankyou(false)
            setShowPanel(false)
            window.removeEventListener("beforeunload", beforeUnloadHandler)
            dirty.current = false
        }, 2000)
        window.removeEventListener("beforeunload", beforeUnloadHandler)
        dirty.current = false
        document.documentElement.classList.remove('modal-backdrop');
    }, []);

    const handleFormReady = useCallback((instance: Webform): void => {
        formInstance.current = instance
    }, []);
    const handleChangeSubmission = useCallback((value: Submission): void => {
        // console.log('handleChangeSubmission', value, flags, modified)

        if (value.data.email == "" && value.data.feedback == "") {
            dirty.current = false
            window.removeEventListener("beforeunload", beforeUnloadHandler);
        } else {
            dirty.current = true
            window.removeEventListener("beforeunload", beforeUnloadHandler);
            window.addEventListener("beforeunload", beforeUnloadHandler);
        }
    }, []);

    return <>
        {showPanel && <div onClick={(e) => { e.preventDefault(); handleButtonClick(false) }} className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 z-3"></div>}
        <div className={`panel-feedback offcanvas offcanvas-end ${showPanel ? 'show' : ''}`}>
            <div className="offcanvas-body p-4">
                <button onClick={(e) => { e.preventDefault(); handleButtonClick(false) }} type="button" className="btn-close position-absolute top-0 end-0 m-1" aria-label="Close"></button>
                {showThankyou && <div className="alert alert-success d-flex align-items-center" role="alert">
                    <svg
                        className="bi flex-shrink-0 me-2"
                        width="24"
                        height="24"
                        role="img"
                        aria-label="Success:"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                    >
                        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" />
                    </svg>
                    <div>
                        Thank you for submitting your feedback.
                    </div>
                </div>}
                {showPanel && <Form key={keyform.current} src={formFeedbackDefinition} onSubmit={handleSummit} onFormReady={handleFormReady} onChange={handleChangeSubmission} />}
            </div>
        </div>
        <a onClick={(e) => { e.preventDefault(); handleButtonClick(true) }} href="" className="position-fixed bottom-0 end-0 m-4 z-3 btn btn-primary rounded-circle d-flex align-items-center justify-content-center btn-chat-feedback">
            <i className="bi bi-chat-left-text fs-4"></i>
        </a>
    </>
})