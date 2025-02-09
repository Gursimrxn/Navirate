import IndoorNavigation from "./Components/MapContainer";
import { Navbar } from "./Components/Navbar";
import { Dock } from "./Components/Dock";

function App() {
    return (
        <div>
            <IndoorNavigation />
            <Navbar />
            <Dock />
        </div>
    );
}

export default App;
