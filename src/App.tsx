import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Team from './pages/Team';
import Projects from './pages/Projects';
import StartProject from './pages/StartProject';
import Studio from './pages/Studio';
import ServicesPage from './pages/Services';
import ClientsPage from './pages/Clients';
import Preloader from './components/Preloader';
import ScrollToTop from './components/ScrollToTop';

import { AnimatePresence } from 'framer-motion';

function App() {
  const location = useLocation();

  return (
    <Layout>
      <ScrollToTop />
      <Preloader />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/team" element={<Team />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/studio" element={<Studio />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/start-project" element={<StartProject />} />
        </Routes>
      </AnimatePresence>
    </Layout>
  );
}

export default App;