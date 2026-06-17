import { type FC, memo, useCallback, useRef, useEffect } from 'react';
import { Form, type FormType, type Submission } from '@formio/react';
import { Webform } from '@formio/js';
import { EVENT_FORMSUSCHEMACHANGE, EVENT_FORMSUSCHEMACHANGESUCCESSFULLY } from '../../types/Consts.ts'
import { type Meta, SettingsSchema } from '../../types/Form.ts'

interface SettingProps {
    meta: Meta
    onChangeSetting: (settings: Submission) => void;
}

const formSettingDefinition: FormType = {
    "display": "form",
    "components": [
        {
            "label": "Thumbnail",
            "tableView": true,
            "validateWhenHidden": false,
            "key": "thumbnail_url",
            "type": "url",
            "input": true
        },
        {
            "label": "Type FormSu",
            "widget": "choicesjs",
            "tableView": true,
            "defaultValue": "normal",
            "data": {
                "values": [
                    {
                        "label": "normal",
                        "value": "normal"
                    },
                    {
                        "label": "template",
                        "value": "template"
                    }
                ]
            },
            "validateWhenHidden": false,
            "key": "form_su",
            "type": "select",
            "input": true
        },
        {
            "label": "Description",
            "tableView": true,
            "validateWhenHidden": false,
            "key": "description",
            "type": "textarea",
            "input": true
        },
        {
            "label": "Published",
            "tableView": false,
            "validateWhenHidden": false,
            "key": "published",
            "type": "checkbox",
            "input": true,
            "defaultValue": false
        },
        {
            "type": "button",
            "label": "Save",
            "key": "submit",
            "disableOnInvalid": true,
            "input": true,
            "tableView": false
        }
    ]
}

let envChange: () => void = () => {}

export const Setting: FC<SettingProps> = memo(({ onChangeSetting, meta }) => {
    const loading = useRef<boolean>(false)
    const formInstance = useRef<Webform | null>(null);
    const keyform = useRef<string>(Date.now()+"")
    
    useEffect(() => {
        // remove first to make sure event listener once time
        window.removeEventListener(EVENT_FORMSUSCHEMACHANGESUCCESSFULLY, envChange);
        envChange = () => {
            if(loading.current && formInstance.current){ // re-render when it was changed by form, ignoring other changes like form name.
                loading.current = false
                formInstance.current.loading = false
                formInstance.current.redraw()
            }
        }
        window.addEventListener(EVENT_FORMSUSCHEMACHANGESUCCESSFULLY, envChange);

        return () => {
            window.removeEventListener(EVENT_FORMSUSCHEMACHANGESUCCESSFULLY, envChange);
        };
    }, []);

    const handleSummit = useCallback((submission: Submission): void => {
        onChangeSetting(submission)

        window.dispatchEvent(new CustomEvent(EVENT_FORMSUSCHEMACHANGE, { detail: {meta:SettingsSchema.parse(submission.data)} } ));
        loading.current = true
    }, []);

    const handleFormReady = useCallback((instance: Webform): void => {
        formInstance.current = instance
    }, []);

    return (
        <div className='container'>
            <div className='row'>
                <Form key={keyform.current} src={formSettingDefinition} onSubmit={handleSummit} submission={{data:SettingsSchema.parse(meta)}} onFormReady={handleFormReady} />
            </div>
        </div>
    );
})