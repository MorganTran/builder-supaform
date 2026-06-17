import React from 'react';
import { type TemplateSu } from '../../types/Form.ts'

interface TemplateCardProps {
    template: TemplateSu,
    onUseTemplate: (tp: TemplateSu) => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({
    template,
    onUseTemplate
}) => {

    const handleUseTemplate = (): void => {
        onUseTemplate(template)
    };

    const handleEditTemplate = (): void => {
        window.location.pathname = '/' + template.template_id
    };

    return (
        <div className="col-md-3 rv in">
            <div className="gc p-2 h-100">
                <div style={{ overflow: 'hidden', height: '180px' }}>
                    <img
                        src={template.form.meta.thumbnail_url}
                        alt={template.form.meta.display_name}
                        className="card-img-top"
                        style={{ objectFit: 'cover', height: '100%' }}
                    />
                </div>
                <h3 className="text-center fs-5 fw-semibold mb-2">{template.form.meta.display_name}</h3>
                <p style={{ fontSize: ".875rem", color: "var(--tx2)" }}>{template.form.meta.description}</p>

                <div className='d-flex align-items-center justify-content-center gap-3 flex-wrap afu'>
                    <button
                        className="btn btn-outline-success mt-auto"
                        onClick={handleUseTemplate}
                    >
                        Use Template
                    </button>
                    {(window.location + "").startsWith("http://localhost") && <button
                        className="btn btn-outline-success mt-auto"
                        onClick={handleEditTemplate}
                    >
                        Edit Template
                    </button>}
                </div>
            </div>
        </div>
    );
};

export default TemplateCard;
