import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store/store'
import App from './App.tsx'
import { ThemeProvider } from './components/ThemeProvider'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider defaultTheme="system" storageKey="news-platform-theme">
        <App />
      </ThemeProvider>
    </Provider>
  </React.StrictMode>,
)
