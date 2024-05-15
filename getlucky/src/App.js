import logo from './logo.svg';
import './App.css';
import routes from './routes/Routes';
import {Route, Routes, BrowserRouter as Router} from 'react-router-dom';
import { WalletProvider } from './utils/Context';
import { useState } from 'react';

function App() {
    return (
      <Router>
        <WalletProvider>
            <Routes>
                {routes.map((route) => (
                    <Route 
                    key={route.path} 
                    path={route.path} 
                    element={<route.component />} />
                ))}
            </Routes>
        </WalletProvider>
      </Router>
    )
}

export default App;
