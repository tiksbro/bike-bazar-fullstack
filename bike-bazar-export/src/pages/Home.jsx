import Hero from '../components/Hero'
import CategoryCards from '../components/CategoryCards'
import FeaturedBikes from '../components/FeaturedBikes'
import TrustBand from '../components/TrustBand'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

function Home() {
  useDocumentTitle('Find Your Next Ride')

  // "Browse by Budget / Brand" was removed (7 Oct): the Budget and Brand
  // filter boxes in the Hero (QuickFilters.jsx) already do the same job.
  return (
    <>
      <Hero />
      <CategoryCards />
      <FeaturedBikes />
      <TrustBand />
    </>
  )
}

export default Home