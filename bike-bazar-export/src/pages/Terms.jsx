import LegalPage from '../components/LegalPage'
import { termsOfUse } from '../data/legalContent'

// The words come from legalContent.js, the look comes from LegalPage.jsx.
function Terms() {
  return <LegalPage page={termsOfUse} />
}

export default Terms
