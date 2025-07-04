import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Dashboard from './Dashboard';
import RedirectIfLoggedIn from './RedirectIfLoggedIn';
import ProtectedRoute from './ProtectedRoute';
import Customer from './Customer';
import Home1 from './Home/Home1'; 
import Cusinfo from './masters/Cusinfo';
import Product from './masters/Prodmas';
import Billing from './Billing';
import Delivery from './Delivery';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public route - redirects if already logged in */}
        <Route
          path="/"
          element={
              <Login />
          }
        />

        <Route
          path="/login"
          element={
              <Login />
          }
        />

        <Route
          path="/cusinfo"
          element={
              <Cusinfo />
          }
        />

        <Route
          path="/product"
          element={
              <Product />
          }
        />

        <Route
          path="/customer"
          element={
            <ProtectedRoute>
              <Customer />
            </ProtectedRoute>
          }
        />

        <Route
          path="/Home1"
          element={
            <Home1 /> 
          }
        />

        <Route
          path="/billing"
          element={
            <Billing />
          }
        />

        <Route
          path="/delivery"
          element={
            <Delivery />
          }
        />

      <Route path="/  /:id?" element={<Billing />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;