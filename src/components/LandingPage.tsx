import { ArrowRight, ShoppingBag, Zap, Shield, TruckIcon, Sparkles, Heart, Star, Award } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Product } from './ProductCard';
import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';

interface LandingPageProps {
  onSelectStore: (store: 'healthcare' | 'electronics') => void;
  featuredProducts: Product[];
  onProductClick: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export function LandingPage({ onSelectStore }: LandingPageProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  // Sophisticated animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1] // Custom easing for smooth, premium feel
      }
    }
  };

  const floatVariants = {
    initial: { y: 0 },
    animate: {
      y: [-8, 8, -8],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="bg-white">
      {/* Hero Section - Inspired by Image */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.03 }}
            transition={{ duration: 1 }}
            className="absolute top-20 left-10 w-96 h-96 bg-cyan-500 rounded-full blur-3xl"
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.03 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500 rounded-full blur-3xl"
          />
        </div>

        <motion.div 
          style={{ opacity, scale }}
          className="max-w-7xl mx-auto px-4 md:px-6 py-20 md:py-32 w-full relative"
        >
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center"
          >
            {/* Welcome Badge */}
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-lg mb-12 border border-gray-100"
            >
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span className="text-sm text-gray-700">Welcome to the Future of Shopping</span>
            </motion.div>

            {/* Main Heading - Matching Image Style */}
            <motion.h1 
              variants={itemVariants}
              className="mb-8"
            >
              <div className="text-6xl md:text-7xl lg:text-8xl text-gray-900 mb-2">
                Shop Smarter,
              </div>
              <div className="text-6xl md:text-7xl lg:text-8xl bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500">
                Live Better
              </div>
            </motion.h1>

            {/* Subtitle */}
            <motion.div
              variants={itemVariants}
              className="max-w-3xl mx-auto mb-8"
            >
              <p className="text-xl md:text-2xl text-gray-600 mb-2">
                Discover premium health & wellness products and cutting-edge electronics.
              </p>
              <p className="text-lg md:text-xl text-gray-500">
                Two exceptional stores, one seamless experience.
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Button
                  onClick={() => onSelectStore('healthcare')}
                  className="group bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-8 py-6 h-auto rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Heart className="w-5 h-5 mr-2" />
                  Explore HealthCare
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Button
                  onClick={() => onSelectStore('electronics')}
                  className="group bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-6 h-auto rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Explore ElectroShop
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
            </motion.div>

            {/* Feature Icons - Matching Image */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto"
            >
              {[
                { 
                  icon: Shield, 
                  title: 'Secure Payments',
                  color: 'text-emerald-600',
                  bgColor: 'bg-emerald-50'
                },
                { 
                  icon: TruckIcon, 
                  title: 'Free Shipping',
                  color: 'text-blue-600',
                  bgColor: 'bg-blue-50'
                },
                { 
                  icon: Award, 
                  title: 'Quality Guarantee',
                  color: 'text-purple-600',
                  bgColor: 'bg-purple-50'
                },
                { 
                  icon: Star, 
                  title: '24/7 Support',
                  color: 'text-amber-600',
                  bgColor: 'bg-amber-50'
                }
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  variants={floatVariants}
                  initial="initial"
                  animate="animate"
                  transition={{ delay: idx * 0.2 }}
                  whileHover={{ y: -4 }}
                  className="flex flex-col items-center gap-3 cursor-default"
                >
                  <div className={`${feature.bgColor} ${feature.color} w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300`}>
                    <feature.icon className="w-8 h-8" strokeWidth={2} />
                  </div>
                  <span className="text-sm text-gray-700">{feature.title}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.6 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-6 h-10 border-2 border-gray-300 rounded-full flex items-start justify-center p-2"
          >
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* Store Showcases */}
      <section className="py-20 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-6xl mb-6">
              Explore Our <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 to-purple-600">Collections</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Premium products curated just for you
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Healthcare Store Card */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -8 }}
              onClick={() => onSelectStore('healthcare')}
              className="group cursor-pointer"
            >
              <Card className="relative overflow-hidden rounded-3xl border-2 border-gray-100 hover:border-emerald-200 transition-all duration-500 shadow-xl hover:shadow-2xl bg-gradient-to-br from-emerald-50 to-teal-50">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1000"
                    alt="Health & Wellness"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/80 via-emerald-900/40 to-transparent" />
                  
                  <div className="absolute inset-0 flex flex-col justify-end p-8">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 }}
                      className="flex items-center gap-3 mb-4"
                    >
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                        <Heart className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-white text-lg">Health & Wellness</span>
                    </motion.div>
                    <h3 className="text-4xl text-white mb-3">
                      Your Health, Our Priority
                    </h3>
                    <p className="text-white/90 text-lg mb-6">
                      Vitamins • Supplements • Skincare • Fitness
                    </p>
                    <Button className="w-full bg-white hover:bg-gray-50 text-emerald-700 rounded-xl h-14 shadow-lg group-hover:shadow-xl transition-all">
                      <ShoppingBag className="w-5 h-5 mr-2" />
                      Shop Now
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Electronics Store Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -8 }}
              onClick={() => onSelectStore('electronics')}
              className="group cursor-pointer"
            >
              <Card className="relative overflow-hidden rounded-3xl border-2 border-gray-100 hover:border-purple-200 transition-all duration-500 shadow-xl hover:shadow-2xl bg-gradient-to-br from-purple-50 to-indigo-50">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1498049794561-7780e7231661?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1000"
                    alt="Electronics"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-900/80 via-purple-900/40 to-transparent" />
                  
                  <div className="absolute inset-0 flex flex-col justify-end p-8">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 }}
                      className="flex items-center gap-3 mb-4"
                    >
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                        <Zap className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-white text-lg">Electronics</span>
                    </motion.div>
                    <h3 className="text-4xl text-white mb-3">
                      Tech That Inspires
                    </h3>
                    <p className="text-white/90 text-lg mb-6">
                      Phones • Laptops • Audio • Accessories
                    </p>
                    <Button className="w-full bg-white hover:bg-gray-50 text-purple-700 rounded-xl h-14 shadow-lg group-hover:shadow-xl transition-all">
                      <Zap className="w-5 h-5 mr-2" />
                      Shop Now
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-6xl mb-6">
              Why Choose <span className="text-purple-600">ZAB'S Store?</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Two specialized stores, one seamless experience
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: ShoppingBag,
                title: 'Two Premium Stores',
                desc: 'Health & Tech under one roof',
                gradient: 'from-cyan-500 to-teal-600',
                delay: 0
              },
              {
                icon: Sparkles,
                title: 'Curated Quality',
                desc: 'Only the best products',
                gradient: 'from-purple-500 to-indigo-600',
                delay: 0.1
              },
              {
                icon: TruckIcon,
                title: 'Free Shipping',
                desc: 'On orders over R1000',
                gradient: 'from-pink-500 to-rose-600',
                delay: 0.2
              },
              {
                icon: Shield,
                title: 'Secure & Safe',
                desc: '100% protected payments',
                gradient: 'from-amber-500 to-orange-600',
                delay: 0.3
              }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: feature.delay, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group relative"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl`} />
                <div className="relative text-center p-8 rounded-3xl border-2 border-gray-100 hover:border-gray-200 transition-all bg-white shadow-lg group-hover:shadow-2xl duration-500">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} text-white mb-4 group-hover:scale-110 transition-transform duration-500`}>
                    <feature.icon className="w-8 h-8" strokeWidth={2} />
                  </div>
                  <h3 className="text-xl mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: TruckIcon, title: 'Free Shipping', desc: 'On orders over R1000', delay: 0 },
              { icon: Shield, title: 'Secure Payment', desc: 'Your data is protected', delay: 0.1 },
              { icon: Zap, title: 'Fast Delivery', desc: '2-5 business days', delay: 0.2 }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: feature.delay }}
                className="flex items-start gap-4"
              >
                <div className="flex-shrink-0 w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <feature.icon className="w-7 h-7 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-xl mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
