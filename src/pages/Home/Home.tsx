import Hero from '@/sections/Hero/Hero'
import Marquee from '@/sections/Marquee/Marquee'
import Skills from '@/sections/Skills/Skills'
import ProjectsPreview from '@/sections/Projects/ProjectsPreview'
import About from '@/sections/About/About'

interface HomeProps {
  isMobile: boolean
}

export default function Home({ isMobile }: HomeProps) {
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
