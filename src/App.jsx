import { HashRouter as BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LangProvider } from './hooks/useLang'
import { ContentProvider } from './hooks/useContent'
import AppShell from './components/layout/AppShell'
import ScreenHome from './components/screens/ScreenHome'
import ScreenSection from './components/screens/ScreenSection'
import ScreenCategory from './components/screens/ScreenCategory'
import ScreenItem from './components/screens/ScreenItem'
import ScreenAdmin from './components/screens/ScreenAdmin'
import './design-tokens.css'

export default function App() {
  return (
    <LangProvider>
    <ContentProvider>
      <BrowserRouter>
        <Routes>
          {/* Front client — wrapper mobile */}
          <Route element={<div className="fh-app"><AppShell /></div>}>
            <Route index element={<ScreenHome />} />
            <Route path="/:sectionId" element={<ScreenSection />} />
            <Route path="/:sectionId/:categoryId" element={<ScreenCategory />} />
            <Route path="/:sectionId/:categoryId/:itemId" element={<ScreenItem />} />
          </Route>

          {/* Back-office admin — pleine largeur desktop, pas de fh-app */}
          <Route path="/admin/*" element={<ScreenAdmin />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ContentProvider>
    </LangProvider>
  )
}
