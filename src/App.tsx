import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { FavoritesProvider } from "./context/FavoritesContext";
import { ToastProvider } from "./context/ToastContext";
import { ContactPage } from "./pages/ContactPage";
import { DetailPage } from "./pages/DetailPage";
import { ExplorePage } from "./pages/ExplorePage";
import { FavoritesPage } from "./pages/FavoritesPage";
import { HomePage } from "./pages/HomePage";
import { NotFoundPage } from "./pages/NotFoundPage";

export default function App() {
  return (
    <BrowserRouter>
      <FavoritesProvider>
        <ToastProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="explorar" element={<ExplorePage />} />
              <Route path="explorar/:id" element={<DetailPage />} />
              <Route path="favoritos" element={<FavoritesPage />} />
              <Route path="contacto" element={<ContactPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </ToastProvider>
      </FavoritesProvider>
    </BrowserRouter>
  );
}
