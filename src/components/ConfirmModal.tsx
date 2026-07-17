import { useEffect, useCallback, useState, memo } from 'react'
import { z } from 'zod';
import { EVENT_MODAL_RENDER, EVENT_MODAL_ACTION } from '../types/Consts.ts'

const ButtonRenderSchema = z.object({
    class: z.string(),
    text: z.string(),
    key: z.string(),
});

export const DataRenderModalSchema = z.object({
    title: z.string(),
    body: z.string(),
    show: z.boolean(),
    buttons: z.array(ButtonRenderSchema).min(1, "Buttons cannot be empty"),
});

export type DataRenderModal = z.infer<typeof DataRenderModalSchema>;
export type ButtonRender = z.infer<typeof ButtonRenderSchema>;

export const modal = (dataRender: DataRenderModal): Promise<ButtonRender> => {
    window.dispatchEvent(new CustomEvent(EVENT_MODAL_RENDER, { detail: dataRender }));

    return new Promise((resolve) => {
        window.addEventListener(EVENT_MODAL_ACTION, () => {
            const customEvent = event as CustomEvent
            resolve(customEvent.detail)
        });

    })
}

let envListen: () => void = () => { }

const ConfirmModal = memo(() => {
    const [dataRender, setDataRender] = useState<DataRenderModal>({
        "title": "",
        body: "",
        show: false,
        buttons: [
            { class: 'btn-secondary', text: 'Close', key: 'close' },
            { class: 'btn-primary', text: 'OK', key: 'ok' }]
    } as DataRenderModal)

    useEffect(() => {
        window.removeEventListener(EVENT_MODAL_RENDER, envListen);
        envListen = () => {
            const customEvent = event as CustomEvent

            setDataRender(DataRenderModalSchema.parse(customEvent.detail))
        }
        window.addEventListener(EVENT_MODAL_RENDER, envListen);
    }, [])

    const handleClickBtn = useCallback((btn: ButtonRender) => {
        setDataRender({ ...dataRender, show: false })
        window.dispatchEvent(new CustomEvent(EVENT_MODAL_ACTION, { detail: btn }));
    }, []);

    return <div className={"modal fade " + (dataRender.show ? "show" : "")} aria-hidden="true" style={dataRender.show ? { display: "block" } : {}}>
        <div className="modal-dialog">
            <div className="modal-content">
                <div className="modal-header">
                    <h5 className="modal-title" id="exampleModalLabel">{dataRender.title}</h5>
                    {/* <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button> */}
                </div>
                <div className="modal-body">
                    {dataRender.body}
                </div>
                <div className="modal-footer">
                    {
                        dataRender.buttons.map((btn: ButtonRender) => {
                            return <button key={btn.key} type="button" className={"btn " + btn.class} onClick={() => {
                                handleClickBtn(btn)
                            }}>{btn.text}</button>
                        })
                    }
                </div>
            </div>
        </div>
    </div>
}, () => { return true })

export default ConfirmModal