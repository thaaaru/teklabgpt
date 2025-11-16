import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HeaderNav from './components/HeaderNav';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-dark-bg">
        <HeaderNav />

        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            {/* Add more routes as needed */}
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
