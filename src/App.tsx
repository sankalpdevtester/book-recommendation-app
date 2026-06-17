import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import BookSearch from './pages/BookSearch';
import BookDetails from './pages/BookDetails';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/book-search" element={<BookSearch />} />
        <Route path="/book-details/:id" element={<BookDetails />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;