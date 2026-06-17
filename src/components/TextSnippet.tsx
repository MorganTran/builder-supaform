import { type FC, memo, useState } from 'react';

interface TextSnippetProps {
    text: string,
    cl: string
}

export const TextSnippet: FC<TextSnippetProps> = memo(({ text, cl }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={"position-relative " + cl}>
            <button
                className={`btn btn-sm position-absolute copy-btn ${copied ? 'btn-success' : 'btn-outline-primary'
                    }`}
                onClick={handleCopy}
            >
                <i className="bi bi-clipboard"></i>
            </button>
            <span>{text}</span>
        </div>
    );
})