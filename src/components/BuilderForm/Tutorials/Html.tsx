import { type FC, memo } from 'react';
import { CodeSnippetCard } from '../../CodeSnippet.tsx'

interface HTMLTutorialProps {
    formId: string
}

export const HTMLTutorial: FC<HTMLTutorialProps> = memo(({ formId }) => {
    const urlFormJson = import.meta.env.VITE_ENDPOINT_FORMJSON.replace("{{formId}}", formId)
    const code = `
<html>
  <head>
    <link rel="stylesheet" href="${import.meta.env.VITE_ENDPOINT_IFRAME}/bootstrap.min.css">
    <script src='https://cdn.form.io/js/formio.full.min.js'></script>
  </head>
  <body>
    <div id='formio'></div>
    <script type='text/javascript'>
        fetch("${urlFormJson}").then(function(response) {
          return response.json();
        }).then(function(formDetail) {
            Formio.createForm(document.getElementById('formio'), formDetail).then(function(_form) {
                _form.on('submit', function(submission) {
                    _form.redraw()
                });
            });
        });
    </script>
  </body>
</html>
    `
    return <div>
        <CodeSnippetCard language='html' code={code} />
    </div>
})

export default HTMLTutorial