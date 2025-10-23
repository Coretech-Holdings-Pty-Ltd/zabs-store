import { ArrowLeft, Heart, Zap, Users, Award, TruckIcon, Shield } from 'lucide-react';
import { Button } from './ui/button';
import { motion } from 'motion/react';

interface AboutPageProps {
  onBack: () => void;
}

export function AboutPage({ onBack }: AboutPageProps) {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative bg-gradient-to-br from-purple-600 via-indigo-700 to-cyan-600 text-white overflow-hidden"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6bTAtMjBjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
        
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-20 relative z-10">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            onClick={onBack}
            whileHover={{ x: -4 }}
            className="flex items-center gap-2 text-white/90 hover:text-white mb-10 transition-colors group bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium text-sm">Back to Home</span>
          </motion.button>

          <div className="max-w-4xl mx-auto text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-6xl font-bold mb-6"
            >
              About ZAB'S Store
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg md:text-xl text-white/90 leading-relaxed"
            >
              Your premium destination for health, wellness, and cutting-edge technology. 
              We're passionate about helping you live better through quality products.
            </motion.p>
          </div>
        </div>
      </motion.div>

      {/* Mission Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full font-medium">
                <Heart className="w-5 h-5" />
                Our Mission
              </div>
              <h2 className="text-3xl md:text-4xl font-bold">
                Elevating Lives Through Premium Products
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                At ZAB'S Store, we believe everyone deserves access to premium health products 
                and the latest technology. Our mission is to curate the best products from 
                trusted brands and deliver them with exceptional service.
              </p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="pt-4">
                <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-2xl h-12 px-8 shadow-lg shadow-purple-500/30">
                  Learn More About Us
                </Button>
              </motion.div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-2 gap-4"
            >
              {[
                { value: '10K+', label: 'Happy Customers', color: 'purple' },
                { value: '500+', label: 'Products', color: 'cyan', delay: 0.1 },
                { value: '2', label: 'Specialized Stores', color: 'indigo', delay: 0 },
                { value: '100%', label: 'Quality Guarantee', color: 'amber', delay: 0.1 }
              ].map((stat, idx) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + idx * 0.1 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className={`bg-white rounded-3xl p-6 shadow-lg ${idx % 2 === 1 ? 'mt-8' : idx === 2 ? '-mt-8' : ''}`}
                >
                  <div className={`text-3xl font-bold text-${stat.color}-600 mb-2`}>{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Core Values</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              These principles guide everything we do at ZAB'S Store
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Award,
                title: 'Quality First',
                description: 'We only stock products from trusted brands that meet our rigorous quality standards.',
                color: 'purple'
              },
              {
                icon: Users,
                title: 'Customer Focused',
                description: 'Your satisfaction is our priority. We\'re here to help you find exactly what you need.',
                color: 'cyan'
              },
              {
                icon: Zap,
                title: 'Innovation Driven',
                description: 'We stay ahead of trends to bring you the latest and greatest products.',
                color: 'indigo'
              },
              {
                icon: Heart,
                title: 'Wellness Minded',
                description: 'We believe in promoting healthy lifestyles through quality health products.',
                color: 'pink'
              },
              {
                icon: TruckIcon,
                title: 'Fast & Reliable',
                description: 'Quick shipping and reliable delivery to get your products to you faster.',
                color: 'amber'
              },
              {
                icon: Shield,
                title: 'Trust & Security',
                description: 'Your data and payments are protected with industry-leading security.',
                color: 'green'
              }
            ].map((value, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-shadow"
              >
                <motion.div 
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  className={`w-14 h-14 bg-gradient-to-br from-${value.color}-500 to-${value.color}-600 rounded-2xl flex items-center justify-center mb-4`}
                >
                  <value.icon className="w-7 h-7 text-white" />
                </motion.div>
                <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Story</h2>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="prose prose-lg max-w-none space-y-6 text-gray-600 leading-relaxed"
          >
            <p>
              ZAB'S Store was founded with a simple vision: to create a premium shopping 
              destination that brings together the best in health & wellness and cutting-edge 
              technology. We saw an opportunity to serve customers who value quality and 
              want access to both wellness products and the latest tech in one convenient place.
            </p>

            <p>
              What started as a small online shop has grown into a trusted brand serving 
              thousands of customers across South Africa. Our success is built on our 
              commitment to quality, customer service, and our passion for helping people 
              live better lives.
            </p>

            <p>
              Today, we continue to expand our product selection, partnering with the world's 
              leading brands to bring you premium vitamins, supplements, skincare, fitness 
              equipment, smartphones, laptops, and accessories. Every product is carefully 
              selected to meet our high standards.
            </p>

            <p>
              Thank you for choosing ZAB'S Store. We're honored to be part of your wellness 
              and technology journey.
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="py-16 md:py-24 bg-gradient-to-br from-purple-600 to-cyan-600 text-white"
      >
        <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Ready to Start Shopping?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-white/90 mb-8"
          >
            Discover our curated collections and experience the ZAB'S Store difference
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              size="lg"
              className="bg-white text-purple-700 hover:bg-gray-100 rounded-2xl h-14 px-10 shadow-2xl"
              onClick={onBack}
            >
              Explore Our Stores
            </Button>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}
