import LegalPage from '../components/LegalPage'
import { listingRules } from '../data/legalContent'

// The words come from legalContent.js, the look comes from LegalPage.jsx.
function ListingRules() {
  return <LegalPage page={listingRules} />
}

export default ListingRules
