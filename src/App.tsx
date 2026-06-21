import { useEffect } from 'react'
import { HomeBuildForm } from './components/BuilderForm/Home.tsx'
import { HomeBuilderTemplateForm } from './components/BuilderTemplateForm/Home.tsx'
import { FeedbackPanel } from './components/FeedbackPanel/FeedbackPanel.tsx'

function App() {

  // Calling loginAnonymously after the initial render app.
  useEffect(() => {
    
  }, []);

  let page = <HomeBuilderTemplateForm />
  if (window.location.pathname.replace("/", "")) {
    page = <HomeBuildForm />
  }
  return (
    <>
      {page}
      <FeedbackPanel />
    </>
  )
}

export default App
