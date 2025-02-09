import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Dock } from './Components/Dock';
import IndoorNavigation from "./Components/MapContainer";
import { Navbar } from "./Components/Navbar";
// A layout to render common elements (e.g., Dock) across pages.
function Layout() {
  return (
      <div>
          <Navbar />
      <IndoorNavigation />
      <Dock />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
