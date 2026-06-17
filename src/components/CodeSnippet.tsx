import { type FC, memo, useState } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { monokaiSublime } from 'react-syntax-highlighter/dist/esm/styles/hljs';

interface CodeSnippetProps {
    language: string,
    code: string
}

export const CodeSnippetCard: FC<CodeSnippetProps> = memo(({ language, code }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="position-relative">
            <button
                className={`btn btn-sm position-absolute top-0 end-0 m-2 copy-btn ${copied ? 'btn-success' : 'btn-outline-primary'
                    }`}
                onClick={handleCopy}
            >
                <i className="bi bi-clipboard"></i> {copied ? 'Copied!' : 'Copy'}
            </button>
            <SyntaxHighlighter
                language={language}
                style={monokaiSublime}
                customStyle={{ margin: 0, borderRadius: 0 }}
            >
                {code}
            </SyntaxHighlighter>
        </div>
    );
})