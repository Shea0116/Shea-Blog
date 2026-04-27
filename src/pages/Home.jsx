import Hero from '../sections/Hero/Hero.jsx'
import Marquee from '../sections/Marquee/Marquee.jsx'
import Skills from '../sections/Skills/Skills.jsx'
import ProjectsPreview from '../sections/Projects/ProjectsPreview.jsx'
import About from '../sections/About/About.jsx'

export default function Home({ isMobile }) {
  return (
    <>
      <Hero isMobile={isMobile} />
      <Marquee />
      <Skills />
      <ProjectsPreview />
      <About />
    </>
  )
}
