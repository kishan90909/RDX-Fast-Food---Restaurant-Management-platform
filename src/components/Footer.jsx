import { FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa'

const Footer = () => {
  return (
    <footer className="bg-black border-t border-gray-800 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-2xl font-bold mb-4">
              <span className="text-primary">RDX</span> Fast Food
            </h3>
            <p className="text-gray-400">Fresh. Fast. Flavorful.</p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <div className="space-y-2">
              <a href="#home" className="block text-gray-400 hover:text-primary transition-colors">Home</a>
              <a href="#menu" className="block text-gray-400 hover:text-primary transition-colors">Menu</a>
              <a href="#contact" className="block text-gray-400 hover:text-primary transition-colors">Contact</a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
            <div className="flex gap-4">
              <a href="#" className="text-2xl text-gray-400 hover:text-primary transition-colors">
                <FaFacebook />
              </a>
              <a href="#" className="text-2xl text-gray-400 hover:text-primary transition-colors">
                <FaInstagram />
              </a>
              <a href="#" className="text-2xl text-gray-400 hover:text-primary transition-colors">
                <FaTwitter />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
          <p>&copy; 2026 Kishan Patel. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
