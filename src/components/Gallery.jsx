const Gallery = () => {
  const galleryImages = [
    { src: '/gallery-1.jpg', alt: 'Crispy Kathi Rolls' },
    { src: '/gallery-2.jpg', alt: 'Refreshing Shakes & Mojitos' },
    { src: '/gallery-3.jpg', alt: 'Steaming Hot Momos' },
    { src: '/gallery-4.jpg', alt: 'Juicy Burgers' },
    { src: '/gallery-5.jpg', alt: 'Golden Fries' },
    { src: '/gallery-6.jpg', alt: 'Noodles & Fried Rice' },
  ]

  return (
    <section id="gallery" className="py-20 bg-gradient-to-b from-black to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Food <span className="text-gradient">Gallery</span>
          </h2>
          <p className="text-gray-400 text-lg">A glimpse of our delicious offerings</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryImages.map((img, i) => (
            <div
              key={i}
              className="relative overflow-hidden rounded-xl group cursor-pointer aspect-square"
            >
              <img
                src={img.src}
                alt={img.alt}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                <p className="text-white font-semibold text-lg p-4">{img.alt}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Gallery
