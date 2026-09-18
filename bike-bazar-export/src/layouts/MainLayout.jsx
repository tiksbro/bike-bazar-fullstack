import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import CompareBar from '../components/CompareBar'
import MobileBottomNav from '../components/MobileBottomNav'

function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col pb-16 lg:pb-0">
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