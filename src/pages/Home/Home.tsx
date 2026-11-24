import { useState } from 'react'
import { AppstoreOutlined, UnorderedListOutlined } from '@ant-design/icons'
import Hero from '@/sections/Hero/Hero'
import Marquee from '@/sections/Marquee/Marquee'
import Skills from '@/sections/Skills/Skills'
import ProjectsPreview from '@/sections/Projects/ProjectsPreview'
import About from '@/sections/About/About'
import Studio from '@/sections/Studio/Studio'

interface HomeProps {
  isMobile: boolean
  day: boolean
}

export default function Home({ isMobile, day }: HomeProps) {
  const [classic, setClassic] = useState(false)
  return (
    <>
      <div className="studio-home">
        <button type="button" className="studio-home__switch" onClick={() => setClassic((current) => !current)}>
          {classic ? <AppstoreOutlined /> : <UnorderedListOutlined />}
          {classic ? '3D 工作室' : '经典首页'}
        </button>
        {classic ? <Hero isMobile={isMobile} /> : <Studio day={day} />}
      </div>
      <Marquee />
      <Skills />
      <ProjectsPreview />
      <About />
    </>
  )
}
