import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import faviconPng from '../icons/launchericon-48x48.png'

const ensureFavicon = () => {
  let link = document.querySelector("link[rel='icon']");
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'icon');
    document.head.appendChild(link);
  }
  link.setAttribute('type', 'image/png');
  link.setAttribute('href', faviconPng);
};

ensureFavicon();

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
