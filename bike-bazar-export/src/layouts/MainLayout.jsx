import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import CompareBar from '../components/CompareBar'
import MobileBottomNav from '../components/MobileBottomNav'

function MainLayout() {
  return (
    // pb-16 leaves room at the bottom for the phone bottom menu (64px).
    // If a page shows a sticky action bar (marked `data-sticky-action-bar`,
    // e.g. Vehicle Detail on phones), the `has-[...]` rule adds room for
    // that bar too (64px menu + 74px bar = 138px), so the footer isn't hidden.
    <div className="min-h-screen flex flex-col pb-16 max-md:has-[[data-sticky-action-bar]]:pb-[138px] lg:pb-0">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CompareBar />
      <MobileBottomNav />
    </div>
  )
}

export default MainLayout