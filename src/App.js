import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './Components/Login';
import Register from './Components/Register';
import LoanRequest from './Components/LoanRequest';
import Dashboard from './Components/Dashboard';
import AdminPanel from './Components/AdminPanel';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/request-loan" element={<LoanRequest />} />
        <Route path="/admin/loans" element={<AdminPanel />} />
      </Routes>
    </Router>
  );
}

export default App;
