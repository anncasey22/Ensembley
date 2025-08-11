import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
)


/*
import ScrollingBox from './scrolling';

function App() {
  return (
    <div>
      <h1>Scrollable Example</h1>
      <ScrollingBox />
    </div>
  );
}
*/
export default App;
