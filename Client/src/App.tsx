import IndoorNavigation from './Components/MapContainer';
import { Navbar } from './Components/Navbar';

function App() {
  return (
    <div>

      <IndoorNavigation />
    <div className="fixed z-20 top-10 overflow-hidden">
      <Navbar />
    </div>
    </div>
  );
}

export default App;