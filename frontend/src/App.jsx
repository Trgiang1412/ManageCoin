import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard/index';
import Statistics from './pages/Statistics/index';
import TravelPage from './pages/Travel/index';
import TravelFundDetail from './pages/Travel/TravelFundDetail';

function App() {
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
        <Route path="/" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/statistics" element={isAuthenticated ? <Statistics /> : <Navigate to="/login" />} />
        <Route path="/travel" element={isAuthenticated ? <TravelPage /> : <Navigate to="/login" />} />
        <Route path="/travel/:id" element={isAuthenticated ? <TravelFundDetail /> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

