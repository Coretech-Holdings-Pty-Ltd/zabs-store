import { ArrowLeft, Mail, Phone, MapPin, MessageCircle, HelpCircle, Package, CreditCard, TruckIcon, Instagram, Facebook, Twitter, Linkedin } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';

interface HelpPageProps {
  onBack: () => void;
}

export function HelpPage({ onBack }: HelpPageProps) {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-purple-600 via-indigo-700 to-cyan-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6bTAtMjBjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
        
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-20 relative z-10">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white/90 hover:text-white mb-10 transition-colors group bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back to Home</span>
          </button>

          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">How Can We Help?</h1>
            <p className="text-lg md:text-xl text-white/90 leading-relaxed mb-8">
              Get in touch with our friendly customer support team. We're here to assist you.
            </p>

            {/* Quick Search */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <HelpCircle className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                <Input 
                  type="text"
                  placeholder="Search for help..."
                  className="w-full pl-16 pr-6 h-16 bg-white text-gray-900 placeholder:text-gray-500 rounded-2xl text-lg border-0 shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Cards */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* Phone */}
            <Card className="p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 text-center border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Phone className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Call Us</h3>
              <p className="text-gray-600 mb-6">Mon-Fri 8am-6pm (SAST)</p>
              <a 
                href="tel:+27111234567" 
                className="text-xl font-bold text-purple-600 hover:text-purple-700"
              >
                +27 11 123 4567
              </a>
            </Card>

            {/* Email */}
            <Card className="p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 text-center border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Email Us</h3>
              <p className="text-gray-600 mb-6">We'll respond within 24 hours</p>
              <a 
                href="mailto:support@zabsstore.co.za" 
                className="text-xl font-bold text-cyan-600 hover:text-cyan-700 break-all"
              >
                support@zabsstore.co.za
              </a>
            </Card>

            {/* Location */}
            <Card className="p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 text-center border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Visit Us</h3>
              <p className="text-gray-600 mb-6">Our office location</p>
              <p className="text-xl font-bold text-indigo-600">
                Johannesburg, South Africa
              </p>
            </Card>
          </div>

          {/* Contact Form + FAQs */}
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card className="p-8 md:p-10 rounded-3xl shadow-lg border border-gray-100">
              <h2 className="text-3xl font-bold mb-2">Send Us a Message</h2>
              <p className="text-gray-600 mb-8">Fill out the form and we'll get back to you soon</p>

              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name" className="text-sm font-bold mb-2 block">Your Name</Label>
                    <Input 
                      id="name"
                      placeholder="John Doe"
                      className="h-12 rounded-xl border-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-sm font-bold mb-2 block">Email Address</Label>
                    <Input 
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      className="h-12 rounded-xl border-2"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="subject" className="text-sm font-bold mb-2 block">Subject</Label>
                  <Input 
                    id="subject"
                    placeholder="How can we help?"
                    className="h-12 rounded-xl border-2"
                  />
                </div>

                <div>
                  <Label htmlFor="message" className="text-sm font-bold mb-2 block">Message</Label>
                  <Textarea 
                    id="message"
                    placeholder="Tell us more about your inquiry..."
                    className="min-h-32 rounded-xl border-2 resize-none"
                  />
                </div>

                <Button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-2xl h-14 shadow-xl shadow-purple-500/30">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Send Message
                </Button>
              </form>
            </Card>

            {/* FAQs */}
            <div>
              <h2 className="text-3xl font-bold mb-2">Frequently Asked Questions</h2>
              <p className="text-gray-600 mb-8">Quick answers to common questions</p>

              <Accordion type="single" collapsible className="space-y-4">
                <AccordionItem value="shipping" className="bg-white rounded-2xl px-6 border-2 border-gray-100">
                  <AccordionTrigger className="text-left font-bold hover:no-underline py-6">
                    <div className="flex items-center gap-3">
                      <TruckIcon className="w-5 h-5 text-purple-600" />
                      <span>What are your shipping options?</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 pb-6">
                    We offer free standard shipping on all orders over R1000. Standard delivery takes 2-5 business days. 
                    Express shipping is available for an additional fee and arrives within 1-2 business days.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="returns" className="bg-white rounded-2xl px-6 border-2 border-gray-100">
                  <AccordionTrigger className="text-left font-bold hover:no-underline py-6">
                    <div className="flex items-center gap-3">
                      <Package className="w-5 h-5 text-cyan-600" />
                      <span>What is your return policy?</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 pb-6">
                    We offer a 30-day return policy on all products. Items must be unused and in original packaging. 
                    Simply contact our support team to initiate a return and we'll provide a prepaid shipping label.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="payment" className="bg-white rounded-2xl px-6 border-2 border-gray-100">
                  <AccordionTrigger className="text-left font-bold hover:no-underline py-6">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-indigo-600" />
                      <span>What payment methods do you accept?</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 pb-6">
                    We accept all major credit cards (Visa, Mastercard, American Express), debit cards, and secure 
                    online payment methods. All transactions are encrypted and secure.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="track" className="bg-white rounded-2xl px-6 border-2 border-gray-100">
                  <AccordionTrigger className="text-left font-bold hover:no-underline py-6">
                    <div className="flex items-center gap-3">
                      <Package className="w-5 h-5 text-amber-600" />
                      <span>How can I track my order?</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 pb-6">
                    Once your order ships, you'll receive a confirmation email with a tracking number. 
                    You can also track your order anytime by logging into your account and viewing your order history.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="warranty" className="bg-white rounded-2xl px-6 border-2 border-gray-100">
                  <AccordionTrigger className="text-left font-bold hover:no-underline py-6">
                    <div className="flex items-center gap-3">
                      <HelpCircle className="w-5 h-5 text-green-600" />
                      <span>Do products come with a warranty?</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 pb-6">
                    Most electronics come with manufacturer warranties ranging from 1-2 years. 
                    Health and wellness products are covered by our quality guarantee. Check individual product 
                    pages for specific warranty information.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </div>
      </section>

      {/* Social Media */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">Connect With Us</h2>
          <p className="text-xl text-gray-600 mb-10">
            Follow us on social media for updates, deals, and wellness tips
          </p>

          <div className="flex justify-center gap-4">
            {[
              { icon: Instagram, color: 'from-pink-500 to-purple-600', href: 'https://instagram.com' },
              { icon: Facebook, color: 'from-blue-500 to-blue-600', href: 'https://facebook.com' },
              { icon: Twitter, color: 'from-sky-400 to-sky-500', href: 'https://twitter.com' },
              { icon: Linkedin, color: 'from-blue-600 to-blue-700', href: 'https://linkedin.com' }
            ].map((social, idx) => (
              <a
                key={idx}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-16 h-16 bg-gradient-to-br ${social.color} rounded-2xl flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg`}
              >
                <social.icon className="w-8 h-8" />
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
