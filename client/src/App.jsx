import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import AttendeeDetailPage from './pages/AttendeeDetailPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/attendee/:id" element={<AttendeeDetailPage />} />
    </Routes>
  );
}
