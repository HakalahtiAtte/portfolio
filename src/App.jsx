import { AppProvider } from './context/AppContext'
import Nav from './components/Nav'
import Hero from './components/Hero'
import About from './components/About'
import Experience from './components/Experience'
import Projects from './components/Projects'
import Skills from './components/Skills'
import Contact from './components/Contact'
import Footer from './components/Footer'
export default function App() {
  return (
    <AppProvider>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <Nav />

      <main id="main-content">
        <Hero />
        <About />
        <Experience />
        <Projects />
        <Skills />
<Contact />
      </main>

      <Footer />
    </AppProvider>
  )
}
