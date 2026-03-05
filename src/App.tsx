import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import BookingConfirmedPage from './pages/BookingConfirmedPage'
import BookingPage from './pages/BookingPage'
import BookingSuccessPage from './pages/BookingSuccessPage'
import AdminPage from './pages/AdminPage'
import { LanguageProvider } from './context/LanguageContext'
import { ThemeProvider } from './context/ThemeContext'
import CatalogPage from './pages/CatalogPage'
import CookiePolicyPage from './pages/CookiePolicyPage'
import ContactsPage from './pages/ContactsPage'
import FaqPage from './pages/FaqPage'
import HomePage from './pages/HomePage'
import ImpressumPage from './pages/ImpressumPage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import PricingPage from './pages/PricingPage'
import SpecialistsPage from './pages/SpecialistsPage'
import TermsPage from './pages/TermsPage'

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/services" element={<Navigate to="/catalog" replace />} />
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/specialists" element={<SpecialistsPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/contacts" element={<ContactsPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/booking" element={<BookingPage />} />
            <Route path="/booking/success" element={<BookingSuccessPage />} />
            <Route path="/booking/confirmed" element={<BookingConfirmedPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/cookies" element={<CookiePolicyPage />} />
            <Route path="/impressum" element={<ImpressumPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </LanguageProvider>
    </ThemeProvider>
  )
}

export default App
