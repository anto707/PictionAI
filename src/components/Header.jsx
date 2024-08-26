import {Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

const Header = ({ showRules, onRulesClick}) => {

    const location = useLocation();

    useEffect(() => {
        if (location.hash === '#features') {
            const element = document.getElementById('features');
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, [location]);

    const handleRulesClick = () => {
        onRulesClick(); 
    };

    return (
        <nav className="navbar fixed-top navbar-expand-lg bg-transparent">
            <div className="container-fluid">
                <Link className="navbar-brand" to="/"> 
                    <img className="mx-2" src="src/assets/logo.png" width="110" alt="Logo" />
                </Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav">
                        <li className="nav-item">
                            <Link className="nav-link" to="/">
                                Home
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/#features">
                                Features
                            </Link>
                        </li>
                        {location.pathname === '/' && (
                            <li className="nav-item">
                                <Link className="nav-link" to="/game">
                                    Play
                                </Link>
                            </li>
                        )}
                        {showRules && <li className="nav-item"><a className="nav-link clickable" onClick={handleRulesClick}>How to play</a></li>}
                    </ul>
                </div>
            </div>
        </nav>
    );
  };
  export default Header;
  