import HeroSection from '@/app/(marketing)/_components/hero-section'
import { ThemeToggle } from '@/components/ui/theme-toggle'

// import HeroHeader from '@/components/header'

const Home = () => {
  return (
      <div>
        {/* <HeroHeader /> */}

        <HeroSection />
        <ThemeToggle />
      </div>
  )
}

export default Home