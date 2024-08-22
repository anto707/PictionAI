import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from "./components/Home"
import GamePage from "./game/GamePage";

export const AppRoutes = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/game" element={<GamePage />} />
            </Routes>
        </Router>    )
}

export default AppRoutes;