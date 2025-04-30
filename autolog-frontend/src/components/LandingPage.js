import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HelpCircle, User } from 'lucide-react';
import {
  ArrowRight,
  Shield,
  Clock,
  DollarSign,
  BarChart3,
  Car,
  CheckCircle,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';
import car1 from './ui/images/car1.png';
import car2 from './ui/images/car2.png';
import car3 from './ui/images/car3.png';


const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 ">
      {/* Navigation Bar */}
      <header className="bg-gray-800 text-white shadow-md">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Car className="h-8 w-8 mr-2" />
              <h1 className="text-2xl font-bold">AutoLog</h1>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-white focus:outline-none"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="hover:text-blue-300 transition duration-300 pt-2 font-bold">Features</a>
              <a href="#benefits" className="hover:text-blue-300 transition duration-300 pt-2 font-bold">Benefits</a>
              <a href="#contact" className="hover:text-blue-300 transition duration-300  pt-2 font-bold">Contact</a>
              <button
                onClick={() => navigate('/autologauth')}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md transition duration-300 font-bold"
              >
                Login
              </button>
            </nav>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <nav className="md:hidden mt-4 pb-4">
              <a href="#features" className="block py-2 hover:text-blue-300 transition duration-300">Features</a>
              <a href="#benefits" className="block py-2 hover:text-blue-300 transition duration-300">Benefits</a>
              <a href="#contact" className="block py-2 hover:text-blue-300 transition duration-300">Contact</a>
              <button
                onClick={() => navigate('/autologauth')}
                className="mt-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md transition duration-300 w-full"
              >
                Login
              </button>
            </nav>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-20 pl-20">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Smart Parking Management with AutoLog</h1>
            <p className="text-xl mb-8">
              Automated vehicle logging system that streamlines parking operations, enhances security, and increases revenue.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => navigate('/autologauth')}
                className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-md font-medium flex items-center justify-center transition duration-300"
              >
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </button>
              <a
                href="#demo"
                className="bg-transparent border border-white hover:bg-white hover:text-gray-800 px-6 py-3 rounded-md font-medium flex items-center justify-center transition duration-300"
              >
                Watch Demo
              </a>
            </div>
          </div>
          <div className="md:w-1/2">
            <img
              src={car2}
              alt="AutoLog Dashboard Preview"
              className=""
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white pl-20 pr-20">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Powerful Features</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 border rounded-lg shadow-md hover:shadow-lg transition duration-300">
              <div className="bg-blue-100 p-3 rounded-full inline-block mb-4">
                <Car className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Automatic License Plate Recognition</h3>
              <p className="text-gray-600">
                Our advanced ALPR technology accurately captures vehicle information without manual intervention.
              </p>
            </div>

            <div className="p-6 border rounded-lg shadow-md hover:shadow-lg transition duration-300">
              <div className="bg-green-100 p-3 rounded-full inline-block mb-4">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-time Analytics</h3>
              <p className="text-gray-600">
                Comprehensive dashboard with occupancy trends, revenue reports, and space availability.
              </p>
            </div>

            <div className="p-6 border rounded-lg shadow-md hover:shadow-lg transition duration-300">
              <div className="bg-purple-100 p-3 rounded-full inline-block mb-4">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Enhanced Security</h3>
              <p className="text-gray-600">
                Alert system for unauthorized access attempts and comprehensive vehicle logs.
              </p>
            </div>

            <div className="p-6 border rounded-lg shadow-md hover:shadow-lg transition duration-300">
              <div className="bg-red-100 p-3 rounded-full inline-block mb-4">
                <Clock className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Time-based Pricing</h3>
              <p className="text-gray-600">
                Flexible pricing models with automatic fee calculation based on duration.
              </p>
            </div>

            <div className="p-6 border rounded-lg shadow-md hover:shadow-lg transition duration-300">
              <div className="bg-yellow-100 p-3 rounded-full inline-block mb-4">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Revenue Management</h3>
              <p className="text-gray-600">
                Track daily, weekly, and monthly revenue with detailed financial reports.
              </p>
            </div>

            <div className="p-6 border rounded-lg shadow-md hover:shadow-lg transition duration-300">
              <div className="bg-indigo-100 p-3 rounded-full inline-block mb-4">
                <CheckCircle className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">User-friendly Interface</h3>
              <p className="text-gray-600">
                Intuitive dashboard with dark mode support and responsive design.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 bg-gray-100 pl-20 pr-20">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose AutoLog</h2>

          <div className="flex flex-col md:flex-row items-center mb-12">
            <div className="md:w-1/2 md:pr-12 mb-8 md:mb-0">
              <h3 className="text-2xl font-semibold mb-4">Increase Operational Efficiency</h3>
              <p className="text-gray-600 mb-6">
                Reduce manual work by up to 80% with our automated entry and exit system. Staff can focus on higher-value tasks while AutoLog handles the routine operations.
              </p>
              <ul className="space-y-2">
                {['Eliminates manual ticket issuance', 'Reduces entry and exit times', 'Minimizes human error', 'Optimizes staff allocation'].map((item, index) => (
                  <li key={index} className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="md:w-1/2">
              <img
                src={car1}
                alt="Operational Efficiency"
                className=""
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row-reverse items-center">
            <div className="md:w-1/2 md:pl-12 mb-8 md:mb-0">
              <h3 className="text-2xl font-semibold mb-4">Maximize Revenue Potential</h3>
              <p className="text-gray-600 mb-6">
                Our clients report an average 15% increase in revenue after implementing AutoLog, thanks to accurate fee calculation and reduced revenue leakage.
              </p>
              <ul className="space-y-2">
                {['Precise timing and billing', 'Prevents fee evasion', 'Detailed financial reporting', 'Multiple payment options'].map((item, index) => (
                  <li key={index} className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="md:w-1/2">
              <img
                src={car3}
                alt="Revenue Maximization"
                className=""
              />
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      {/* <section id="pricing" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4">Simple, Transparent Pricing</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Choose the plan that works best for your parking facility size and needs
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Basic',
                price: '₹9,999',
                period: 'per month',
                description: 'Perfect for small parking lots',
                features: [
                  'Up to 100 parking spaces',
                  'Basic analytics and reporting',
                  'Email support',
                  'Mobile app access',
                  '1 admin user'
                ],
                isPopular: false,
                ctaText: 'Get Started'
              },
              {
                name: 'Professional',
                price: '₹19,999',
                period: 'per month',
                description: 'Ideal for medium-sized facilities',
                features: [
                  'Up to 300 parking spaces',
                  'Advanced analytics and reporting',
                  'Priority email & phone support',
                  'Mobile app access',
                  '5 admin users',
                  'Custom alerts and notifications'
                ],
                isPopular: true,
                ctaText: 'Get Started'
              },
              {
                name: 'Enterprise',
                price: 'Custom',
                period: 'pricing',
                description: 'For large parking facilities',
                features: [
                  'Unlimited parking spaces',
                  'Premium analytics and reporting',
                  '24/7 dedicated support',
                  'Mobile app access',
                  'Unlimited admin users',
                  'Custom integration options',
                  'Dedicated account manager'
                ],
                isPopular: false,
                ctaText: 'Contact Sales'
              }
            ].map((plan, index) => (
              <div key={index} className={`rounded-lg shadow-lg overflow-hidden ${plan.isPopular ? 'border-2 border-blue-500 relative' : 'border border-gray-200'}`}>
                {plan.isPopular && (
                  <div className="bg-blue-500 text-white py-1 px-4 absolute top-0 right-0 rounded-bl-lg text-sm font-medium">
                    Most Popular
                  </div>
                )}
                <div className="p-8">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline mb-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-gray-500 ml-2">{plan.period}</span>
                  </div>
                  <p className="text-gray-600 mb-6">{plan.description}</p>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button 
                    className={`w-full py-3 rounded-md font-medium transition duration-300 flex items-center justify-center ${
                      plan.isPopular 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                    }`}
                  >
                    {plan.ctaText} <ChevronRight className="ml-1 h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Testimonials Section */}
      {/* <section className="py-20 bg-gray-800 text-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">What Our Clients Say</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "AutoLog has transformed our parking operations. We've seen a 20% increase in revenue and significantly improved customer satisfaction.",
                author: "Rajiv Kumar",
                position: "Operations Manager, City Mall"
              },
              {
                quote: "The analytics dashboard gives us insights we never had before. Now we can make data-driven decisions about our parking management strategy.",
                author: "Priya Sharma",
                position: "Facility Director, Tech Park"
              },
              {
                quote: "Implementation was seamless and the support team has been exceptional. AutoLog has paid for itself within the first three months.",
                author: "Amit Patel",
                position: "CEO, Metro Parking Solutions"
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-gray-700 p-6 rounded-lg shadow-md">
                <p className="italic mb-4">"{testimonial.quote}"</p>
                <div>
                  <p className="font-bold">{testimonial.author}</p>
                  <p className="text-gray-400">{testimonial.position}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to transform your parking management?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join hundreds of facilities that have modernized their operations with AutoLog
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button
              onClick={() => navigate('/autologauth')}
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-md font-medium transition duration-300"
            >
              Start Now
            </button>
            <a
              href="#contact"
              className="bg-transparent border border-white hover:bg-white hover:text-blue-600 px-8 py-3 rounded-md font-medium transition duration-300"
            >
              Contact Sales
            </a>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Get In Touch</h2>

          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Contact Support */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Contact Support</h3>
                <HelpCircle className="h-5 w-5 text-gray-400" />
              </div>

              <form className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    rows="5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out flex items-center justify-center"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Send Message
                </button>
              </form>
            </div>

            {/* Meet Our Team Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Meet Our Team</h3>
              <div className="space-y-4">
                {[
                  {
                    name: 'Sujal Jamsandekar',
                    description: 'Frontend Developer & Project Manager'
                  },
                  {
                    name: 'Aniket Mali',
                    description: 'Backend Developer & API Integration'
                  },
                  {
                    name: 'Aditya Khadke',
                    description: 'Database Designer & Documentation Lead'
                  },
                  {
                    name: 'Ashutosh Jarag',
                    description: 'Image Recognition & ML Engineer'
                  }
                ].map((developer, index) => (
                  <div key={index} className="flex items-center bg-gray-50 p-4 rounded-lg">
                    <div className="bg-gray-300 rounded-full p-4 mr-4">
                      <User className="h-12 w-12 text-gray-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">{developer.name}</h4>
                      <p className="text-sm text-gray-600">{developer.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>


        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="">
            <div>
              <div className="flex items-center mb-4">
                <Car className="h-8 w-8 mr-2" />
                <h2 className="text-2xl font-bold">AutoLog</h2>
              </div>
              <p className="text-gray-400">
                Revolutionizing parking management with cutting-edge technology and comprehensive solutions.
              </p>
            </div>

            {/* <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#features" className="text-gray-400 hover:text-white transition duration-300">Features</a></li>
                <li><a href="#benefits" className="text-gray-400 hover:text-white transition duration-300">Benefits</a></li>
                <li><a href="#pricing" className="text-gray-400 hover:text-white transition duration-300">Pricing</a></li>
                <li><a href="#contact" className="text-gray-400 hover:text-white transition duration-300">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition duration-300">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition duration-300">Documentation</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition duration-300">Knowledge Base</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition duration-300">Case Studies</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Connect</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition duration-300">Facebook</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition duration-300">Twitter</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition duration-300">LinkedIn</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition duration-300">Instagram</a></li>
              </ul>
            </div> */}
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 mb-4 md:mb-0">© 2025 AutoLog. All rights reserved.</p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white transition duration-300">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white transition duration-300">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white transition duration-300">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const Mail = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const Phone = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const MapPin = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

export default LandingPage;