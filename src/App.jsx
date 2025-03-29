import './App.css'
import Header from './components/Header'

function App() {
  return (
    <>
      <Header />
      
      <main>
        <section>
          <h2>Take Control of Your Wellbeing</h2>
          <p>Tools and resources to help you overcome burnout and thrive.</p>
        </section>
      </main>
      
      <footer>
        <p>&copy; {new Date().getFullYear()} BurnoutBreaker. All rights reserved.</p>
      </footer>
    </>
  )
}

export default App
