import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom'
import type { ReactElement } from 'react'
import BookingConfirmedPage from './pages/BookingConfirmedPage'
import BookingPage from './pages/BookingPage'
import BookingSuccessPage from './pages/BookingSuccessPage'
import AdminPage from './pages/AdminPage'
import AiAssistantWidget from './components/AiAssistantWidget'
import ScrollToTop from './components/ScrollToTop'
import VisitTracker from './components/VisitTracker'
import { LanguageProvider } from './context/LanguageContext'
import { useLanguage } from './context/language-context'
import { ThemeProvider } from './context/ThemeContext'
import { localizePath, normalizeLanguageCode } from './lib/i18n-routing'
import CatalogPage from './pages/CatalogPage'
import CookiePolicyPage from './pages/CookiePolicyPage'
import ContactsPage from './pages/ContactsPage'
import FaqPage from './pages/FaqPage'
import HomePage from './pages/HomePage'
import ImpressumPage from './pages/ImpressumPage'
import InspirationPage from './pages/InspirationPage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import PricingPage from './pages/PricingPage'
import SpecialistsPage from './pages/SpecialistsPage'
import TermsPage from './pages/TermsPage'
import NotFoundPage from './pages/NotFoundPage'

function RedirectToLocalized({ path }: { path: string }) {
  const { language } = useLanguage()
  return <Navigate to={localizePath(path, language)} replace />
}

function LanguageRoute({ children }: { children: ReactElement }) {
  const { lang } = useParams()
  if (!normalizeLanguageCode(lang)) {
    return <NotFoundPage />
  }
  return children
}

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <ScrollToTop />
          <VisitTracker />
          <Routes>
            <Route path="/:lang" element={<LanguageRoute><HomePage /></LanguageRoute>} />
            <Route
              path="/:lang/services"
              element={<LanguageRoute><Navigate to="../catalog" replace /></LanguageRoute>}
            />
            <Route
              path="/:lang/catalog"
              element={<LanguageRoute><CatalogPage /></LanguageRoute>}
            />
            <Route
              path="/:lang/specialists"
              element={<LanguageRoute><SpecialistsPage /></LanguageRoute>}
            />
            <Route
              path="/:lang/pricing"
              element={<LanguageRoute><PricingPage /></LanguageRoute>}
            />
            <Route
              path="/:lang/inspiration"
              element={<LanguageRoute><InspirationPage /></LanguageRoute>}
            />
            <Route
              path="/:lang/contacts"
              element={<LanguageRoute><ContactsPage /></LanguageRoute>}
            />
            <Route path="/:lang/faq" element={<LanguageRoute><FaqPage /></LanguageRoute>} />
            <Route
              path="/:lang/booking"
              element={<LanguageRoute><BookingPage /></LanguageRoute>}
            />
            <Route
              path="/:lang/booking/success"
              element={<LanguageRoute><BookingSuccessPage /></LanguageRoute>}
            />
            <Route
              path="/:lang/booking/confirmed"
              element={<LanguageRoute><BookingConfirmedPage /></LanguageRoute>}
            />
            <Route
              path="/:lang/privacy"
              element={<LanguageRoute><PrivacyPolicyPage /></LanguageRoute>}
            />
            <Route path="/:lang/terms" element={<LanguageRoute><TermsPage /></LanguageRoute>} />
            <Route
              path="/:lang/cookies"
              element={<LanguageRoute><CookiePolicyPage /></LanguageRoute>}
            />
            <Route
              path="/:lang/impressum"
              element={<LanguageRoute><ImpressumPage /></LanguageRoute>}
            />

            <Route path="/" element={<RedirectToLocalized path="/" />} />
            <Route path="/services" element={<RedirectToLocalized path="/catalog" />} />
            <Route path="/catalog" element={<RedirectToLocalized path="/catalog" />} />
            <Route path="/specialists" element={<RedirectToLocalized path="/specialists" />} />
            <Route path="/pricing" element={<RedirectToLocalized path="/pricing" />} />
            <Route path="/inspiration" element={<RedirectToLocalized path="/inspiration" />} />
            <Route path="/contacts" element={<RedirectToLocalized path="/contacts" />} />
            <Route path="/faq" element={<RedirectToLocalized path="/faq" />} />
            <Route path="/booking" element={<RedirectToLocalized path="/booking" />} />
            <Route path="/booking/success" element={<RedirectToLocalized path="/booking/success" />} />
            <Route path="/booking/confirmed" element={<RedirectToLocalized path="/booking/confirmed" />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/privacy" element={<RedirectToLocalized path="/privacy" />} />
            <Route path="/terms" element={<RedirectToLocalized path="/terms" />} />
            <Route path="/cookies" element={<RedirectToLocalized path="/cookies" />} />
            <Route path="/impressum" element={<RedirectToLocalized path="/impressum" />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          <AiAssistantWidget />
        </BrowserRouter>
      </LanguageProvider>
    </ThemeProvider>
  )
}

export default App
