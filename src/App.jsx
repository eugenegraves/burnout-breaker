import { useState } from 'react'
import './App.css'
import Header from './components/Header'
import Landing from './components/Landing'
import Therapy from './components/Therapy'
import Coaching from './components/Coaching'
import Community from './components/Community'
import Resources from './components/Resources'

function App() {
  const [currentPage, setCurrentPage] = useState('home') // Set to 'home' to show landing page by default

  const renderPage = () => {
    switch(currentPage) {
      case 'home':
        return <Landing setCurrentPage={setCurrentPage} />
      case 'therapy':
        return <Therapy setCurrentPage={setCurrentPage} />
      case 'coaching':
        return <Coaching setCurrentPage={setCurrentPage} />
      case 'community':
        return <Community setCurrentPage={setCurrentPage} />
      case 'resources':
        return <Resources setCurrentPage={setCurrentPage} />
      default:
        return <Landing setCurrentPage={setCurrentPage} />
    }
  }

  return (
    <>
      <Header setCurrentPage={setCurrentPage} />
      
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
