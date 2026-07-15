export default function AboutPage() {
  return (
    <div className="flex-1 flex flex-col">
      <main className="flex-1 px-6 py-32 max-w-4xl mx-auto w-full relative z-10 text-center">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-8">
          Redefining Digital Access.
        </h1>
        
        <p className="text-neutral-400 text-lg md:text-xl leading-relaxed mb-8">
          We believe that premium digital experiences shouldn't be locked behind exorbitant price tags. 
          Our mission is to provide affordable, shared, and managed access to the world's most popular 
          streaming services, creative tools, and digital platforms.
        </p>

        <p className="text-neutral-400 text-lg md:text-xl leading-relaxed mb-16">
          By utilizing advanced pooling architecture and strict quality control, we ensure every customer 
          receives instant delivery, uninterrupted service, and a truly premium experience.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left mt-12 border-t border-white/10 pt-16">
          <div>
            <h3 className="text-xl font-semibold mb-3 text-white">Instant Delivery</h3>
            <p className="text-neutral-500 text-sm">Automated systems ensure you receive your credentials the second your payment clears.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-3 text-white">Guaranteed Uptime</h3>
            <p className="text-neutral-500 text-sm">We proactively manage all pools to immediately resolve any issues before they affect you.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-3 text-white">24/7 Support</h3>
            <p className="text-neutral-500 text-sm">Our dedicated team is always on standby to assist you with any questions or technical help.</p>
          </div>
        </div>
      </main>

      <footer className="border-t border-white/10 px-6 py-12 text-center text-neutral-500 text-sm mt-12 bg-neutral-950">
        <p>&copy; {new Date().getFullYear()} STORE. All rights reserved.</p>
      </footer>
    </div>
  );
}
