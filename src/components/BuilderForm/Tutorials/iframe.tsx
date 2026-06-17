import { type FC, memo } from 'react';
import { CodeSnippetCard } from '../../CodeSnippet.tsx'

const ENDPOINT_IFRAME = import.meta.env.VITE_ENDPOINT_IFRAME

interface IframeTutorialProps {
    formId: string
}

export const IframeTutorial: FC<IframeTutorialProps> = memo(({ formId }) => {
    const iframeSrc = ENDPOINT_IFRAME + "/" + formId
    const code = `
<html>
  <head>
  </head>
  <body>
    <iframe id='suform' url="${iframeSrc}"></iframe>
    <script type='text/javascript'>
        let iframeForm = document.getElementById('form')
        iframeForm.addEventListener('load', function() {
            // post parent site so that iframe know what is parent site.
            iframeForm.contentWindow.postMessage({ form_id: "${formId}", parent_site: window.location + "" }, "${ENDPOINT_IFRAME}");

            // if you want to use edit form to load again data
            // iframeForm.contentWindow.postMessage({ submission: submission, form_id: "${formId}" }, "${ENDPOINT_IFRAME}");
        });

        window.addEventListener("message", function(event){
            if (event.origin !== "${ENDPOINT_IFRAME}" || event.data?.form_id != "${formId}") return;

            console.log("Your submission is", event.data?.submission, " and then you can handle calling the API.");
        });
    </script>
  </body>
</html>
    `
    return <div>
        <CodeSnippetCard language='html' code={code} />
    </div>
})

export default IframeTutorial