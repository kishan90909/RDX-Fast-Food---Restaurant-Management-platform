import { FaLeaf, FaDollarSign, FaHeart, FaUsers } from 'react-icons/fa'

const About = () => {
  const features = [
    { icon: <FaDollarSign />, title: 'Affordable Prices', desc: 'Quality food that fits your budget' },
    { icon: <FaLeaf />, title: 'Fresh Ingredients', desc: 'Made with the freshest ingredients daily' },
    { icon: <FaHeart />, title: 'Made with Love', desc: 'Every dish prepared with care' },
    { icon: <FaUsers />, title: 'Youth Friendly', desc: 'Perfect hangout spot for everyone' },
  ]

  return (
    <section id="about" className="py-20 bg-gradient-to-b from-black to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            About <span className="text-gradient">RDX Fast Food</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Your go-to destination for delicious rolls, refreshing shakes, and mouth-watering fast food. 
            We serve a variety of items including momos, burgers, noodles, and more in a vibrant café atmosphere.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl hover:bg-gray-800 transition-all duration-300 hover:scale-105 border border-gray-700">
              <div className="text-4xl text-primary mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default About
