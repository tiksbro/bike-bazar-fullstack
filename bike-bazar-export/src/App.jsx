import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { FavoritesProvider } from './context/FavoritesContext'
import { CompareProvider } from './context/CompareContext'
import MainLayout from './layouts/MainLayout'
import Home from './pages/Home'
import Browse from './pages/Browse'
import VehicleDetail from './pages/VehicleDetail'
import NewBikes from './pages/NewBikes'
import NewBikeDetail from './pages/NewBikeDetail'
import Favorites from './pages/Favorites'
import Compare from './pages/Compare'
import Sell from './pages/Sell'
import Dashboard from './pages/Dashboard'
import Dealers from './pages/Dealers'
import DealerDetail from './pages/DealerDetail'
import Services from './pages/Services'
import Safety from './pages/Safety'
import Guides from './pages/Guides'
import TaxCalculator from './pages/TaxCalculator'
import Login from './pages/Login'
import Profile from './pages/Profile'
import NotFound from './pages/NotFound'
import Admin from './pages/Admin'

function App() {
  return (
    <AuthProvider>
      <FavoritesProvider>
        <CompareProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<MainLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/vehicles" element={<Browse />} />
                <Route path="/vehicle/:slug" element={<VehicleDetail />} />
                <Route path="/new-bikes" element={<NewBikes />} />
                <Route path="/new-bikes/:slug" element={<NewBikeDetail />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/compare" element={<Compare />} />
                <Route path="/sell" element={<Sell />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/dealers" element={<Dealers />} />
                <Route path="/dealer/:id" element={<DealerDetail />} />
                <Route path="/services" element={<Services />} />
                <Route path="/safety" element={<Safety />} />
                <Route path="/guides" element={<Guides />} />
                <Route path="/tax-calculator" element={<TaxCalculator />} />
                <Route path="/login" element={<Login />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </CompareProvider>
      </FavoritesProvider>
    </AuthProvider>
  )
}

export default App