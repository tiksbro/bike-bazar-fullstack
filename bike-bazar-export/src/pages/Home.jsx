import Hero from '../components/Hero'
import CategoryCards from '../components/CategoryCards'
import FeaturedBikes from '../components/FeaturedBikes'
import BudgetAndBrand from '../components/BudgetAndBrand'
import TrustBand from '../components/TrustBand'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

function Home() {
  useDocumentTitle('Find Your Next Ride')

  return (
    <>
      <Hero />
      <CategoryCards />
      <FeaturedBikes />
      <BudgetAndBrand />
      <TrustBand />
    </>
  )
}

export default Home