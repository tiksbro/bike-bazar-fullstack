import LegalPage from '../components/LegalPage'
import { privacyPolicy } from '../data/legalContent'

// The words come from legalContent.js, the look comes from LegalPage.jsx.
function Privacy() {
  return <LegalPage page={privacyPolicy} />
}

export default Privacy
