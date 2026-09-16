import { FaArrowDown } from 'react-icons/fa'

const Hero = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <img src="/2025-10-25.jpg" alt="RDX Fast Food" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/60"></div>
      </div>
      
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        <div className="animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="text-gradient">Fresh. Fast. Flavorful.</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Your favorite rolls, shakes & fast food in town.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a href="#menu" className="bg-gradient-to-r from-primary to-secondary px-8 py-4 rounded-full font-semibold text-lg hover:scale-105 transition-transform duration-300 shadow-lg">
              View Menu
            </a>
            <a href="#contact" className="border-2 border-primary px-8 py-4 rounded-full font-semibold text-lg hover:bg-primary/10 transition-all duration-300">
              Order Now
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
