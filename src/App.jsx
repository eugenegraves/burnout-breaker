import { useState } from 'react'
import './App.css'
import Header from './components/Header'
import Landing from './components/Landing'
import Therapy from './components/Therapy'

function App() {
  const [currentPage, setCurrentPage] = useState('therapy') // Set to 'therapy' to show therapy page by default

  const renderPage = () => {
    switch(currentPage) {
      case 'home':
        return <Landing />
      case 'therapy':
        return <Therapy />
      default:
        return <Landing />
    }
  }

  return (
    <>
      <Header />
      
      <main>
        {renderPage()}
      </main>
      
      <footer>
        <p>&copy; {new Date().getFullYear()} BurnoutBreaker. All rights reserved.</p>
      </footer>
    </>
  )
}

export default App
