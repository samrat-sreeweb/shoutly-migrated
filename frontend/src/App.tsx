import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { SetupGuidePage } from './pages/SetupGuidePage';

export default function App() {
  return (
    <BrowserRouter>
      <nav className="top-nav">
        <NavLink to="/" end>
          Connect &amp; Post
        </NavLink>
        <NavLink to="/setup">Setup guide</NavLink>
      </nav>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/setup" element={<SetupGuidePage />} />
      </Routes>
    </BrowserRouter>
  );
}
