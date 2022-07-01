import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <>
	<header>
	    <p>PREPOZNAVANJE GOVORNIKA</p>
	</header>
	<React.StrictMode>
	    <App />
	</React.StrictMode>
	<footer><p>Izradio Luka Loina, 2022. godine</p></footer>
    </>
);

