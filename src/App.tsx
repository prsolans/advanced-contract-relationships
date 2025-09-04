import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Homepage from './components/Homepage';
import IndustryViewer from './components/IndustryViewer';
import ContractFamilyViewer from './components/ContractFamilyViewer';
import AppFooter from './components/AppFooter';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/contracts/:family" element={<ContractFamilyViewer />} />
          <Route path="/industry/:industry" element={<IndustryViewer />} />
        </Routes>
        <AppFooter />
      </div>
    </Router>
  );
}

export default App;
