import React from 'react';
import { HashRouter, Routes, Route, Outlet, useLocation } from 'react-router-dom';
import BlogLayout from './Component.tsx';
import Home from './pages/Home.tsx';
import Article from './pages/Article.tsx';
import About from './pages/About.tsx';
import Culture from './pages/Culture.tsx';
import Technology from './pages/Technology.tsx';
import Subscribe from './pages/Subscribe.tsx';
import Privacy from './pages/Privacy.tsx';
import Contact from './pages/Contact.tsx';
import Archive from './pages/Archive.tsx';
import AdminLayout from './layouts/AdminLayout.tsx';
import Dashboard from './pages/admin/Dashboard.tsx';
import Analytics from './pages/admin/Analytics.tsx';
import PostEditor from './pages/admin/Editor.tsx';
import Comments from './pages/admin/Comments.tsx';
import Subscribers from './pages/admin/Subscribers.tsx';
import Settings from './pages/admin/Settings.tsx';
import Login from './pages/admin/Login.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';

// Wrapper for public routes that need the Blog Layout
const PublicLayout = () => {
  return (
    <BlogLayout>
      <Outlet />
    </BlogLayout>
  );
};

// Helper for scroll restoration
function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <HashRouter>
      <ScrollToTop />
      <Routes>
        {/* Public Website Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/culture" element={<Culture />} />
          <Route path="/tech" element={<Technology />} />
          <Route path="/subscribe" element={<Subscribe />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/archive" element={<Archive />} />
          <Route path="/article/:slug" element={<Article />} />
        </Route>

        {/* Admin Routes - Protected */}
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="posts" element={<Dashboard />} />
            <Route path="editor" element={<PostEditor />} />
            <Route path="editor/:id" element={<PostEditor />} />
            <Route path="comments" element={<Comments />} />
            <Route path="subscribers" element={<Subscribers />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>

        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />

        {/* Fallback */}
        <Route path="*" element={<Home />} />
      </Routes>
    </HashRouter>
  );
}
