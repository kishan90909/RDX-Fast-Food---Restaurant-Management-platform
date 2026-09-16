import { FaPhone, FaWhatsapp, FaMapMarkerAlt, FaClock } from 'react-icons/fa'

const Contact = () => {
  return (
    <section id="contact" className="py-20 bg-gradient-to-b from-gray-900 to-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Get In <span className="text-gradient">Touch</span>
          </h2>
          <p className="text-gray-400 text-lg">Visit us or order now!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
              <div className="flex items-start gap-4">
                <FaMapMarkerAlt className="text-3xl text-primary mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Address</h3>
                  <p className="text-gray-400">Mehsana Highway Road, opp. New Railway station, Unjha, Unava, Gujarat 384160</p>
                  <a href="https://www.google.com/maps/dir//Hotel+decent,+GJ+SH+41,+Unava,+Gujarat+384160/@23.751608,72.3664941,16z/data=!4m19!1m10!3m9!1s0x395c5dbc7b4412fd:0xd279adbae7e088b!2sHotel+decent!5m2!4m1!1i2!8m2!3d23.7511241!4d72.3669257!16s%2Fg%2F11fl0ptl24!4m7!1m0!1m5!1m1!1s0x395c5dbc7b4412fd:0xd279adbae7e088b!2m2!1d72.3670291!2d23.7511203!5m1!1e4?entry=ttu&g_ep=EgoyMDI2MDQwMS4wIKXMDSoASAFQAw%3D%3D" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-secondary transition-colors mt-2 inline-block">
                    Get Directions →
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
              <div className="flex items-start gap-4">
                <FaClock className="text-3xl text-primary mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Opening Hours</h3>
                  <p className="text-gray-400">Every Day: 10:30 AM - 12:00 AM</p>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <a href="tel:+910123456789" className="flex-1 bg-gradient-to-r from-green-600 to-green-700 p-6 rounded-xl hover:scale-105 transition-transform duration-300 flex items-center justify-center gap-3">
                <FaPhone className="text-2xl" />
                <span className="font-semibold">Call Now</span>
              </a>
              <a href="https://wa.me/910123456789" target="_blank" rel="noopener noreferrer" className="flex-1 bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-xl hover:scale-105 transition-transform duration-300 flex items-center justify-center gap-3">
                <FaWhatsapp className="text-2xl" />
                <span className="font-semibold">WhatsApp</span>
              </a>
            </div>
          </div>

          <div className="rounded-xl overflow-hidden h-96 border border-gray-700 relative">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3430.8!2d76.6472!3d30.6897!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390fee0000000001%3A0x0!2zMzDCsDQxJzIzLjAiTiA3NsKwMzgnNTAuMCJF!5e0!3m2!1sen!2sin!4v1234567890"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
            <a href="https://www.google.com/maps/dir//Hotel+decent,+GJ+SH+41,+Unava,+Gujarat+384160/@23.751608,72.3664941,16z/data=!4m19!1m10!3m9!1s0x395c5dbc7b4412fd:0xd279adbae7e088b!2sHotel+decent!5m2!4m1!1i2!8m2!3d23.7511241!4d72.3669257!16s%2Fg%2F11fl0ptl24!4m7!1m0!1m5!1m1!1s0x395c5dbc7b4412fd:0xd279adbae7e088b!2m2!1d72.3670291!2d23.7511203!5m1!1e4?entry=ttu&g_ep=EgoyMDI2MDQwMS4wIKXMDSoASAFQAw%3D%3D" target="_blank" rel="noopener noreferrer" className="absolute bottom-4 right-4 bg-gradient-to-r from-primary to-secondary px-6 py-3 rounded-full font-semibold hover:scale-105 transition-transform duration-300 shadow-lg">
              Get Directions
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Contact
