import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import AddAttendeePage from './pages/AddAttendeePage.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/add-attendee" element={<AddAttendeePage />} />
    </Routes>
  );
}
