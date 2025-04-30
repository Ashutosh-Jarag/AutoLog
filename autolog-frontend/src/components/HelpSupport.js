import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Bell, Search, User, HelpCircle, Mail, Moon, Sun } from 'lucide-react';
import { useUser } from '../UserContext';
import logo from './ui/images/logo.jpeg';

const HelpSupport = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const formRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useUser();
  const [darkMode, setDarkMode] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Create mailto link with form data
    const subject = `Support Request from ${formData.name}`;
    const body = `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`;
    const mailtoLink = `mailto:sujaljamsandekar@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // Open mail client
    window.location.href = mailtoLink;

    // Reset form and show success message
    setFormData({ name: '', email: '', message: '' });
    setFormSubmitted(true);

    // Hide success message after 5 seconds
    setTimeout(() => {
      setFormSubmitted(false);
    }, 5000);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    // In a real application, you would apply the dark mode styles here
  };
  const developers = [
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
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`bg-gray-800 text-white w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition duration-200 ease-in-out`}>

        <nav className='mt-20'>
          <button className="w-full text-left py-2 px-4 text-white hover:bg-gray-700" onClick={() => navigate('/dashboard')}>Dashboard</button>
          <button className="w-full text-left py-2 px-4 text-white hover:bg-gray-700" onClick={() => navigate('/vehicle-logs')}>Vehicle Logs</button>
          <button className="w-full text-left py-2 px-4 text-white hover:bg-gray-700" onClick={() => navigate('/manualentry')}>Manual Vehicle Entry</button>
          <button className="w-full text-left py-2 px-4 text-white hover:bg-gray-700" onClick={() => navigate('/reports')}>Reports & Analytics</button>
          <button className="w-full text-left py-2 px-4 text-white hover:bg-gray-700" onClick={() => navigate('/settings')}>Settings</button>
          <button className="w-full text-left py-2 px-4 text-white hover:bg-gray-700 bg-gray-700">Help/Support</button>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <header className="bg-white shadow-md relative">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <button className="md:hidden p-2" onClick={() => setSidebarOpen(!sidebarOpen)}>
                <Menu className="h-6 w-6" />
              </button>
              <h1 className="text-xl font-semibold text-gray-800 ml-2">Help & Support</h1>
            </div>

            <div className="flex items-center space-x-4">



              <div className="relative">
                <button
                  className="p-2 rounded-full hover:bg-gray-200"
                  onClick={() => setProfileOpen(!profileOpen)}
                >
                  <User className="h-5 w-5" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                    <div className="flex items-center space-x-2 p-4 border-b border-gray-100">
                      <User className="h-6 w-6 text-gray-600" />
                      <span className="font-medium text-gray-700">{user?.username || 'User'}</span>
                    </div>
                    <button
                      onClick={() => navigate('/')}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700"
                    >
                      Logout
                    </button>
                  </div>
                )}
                <button onClick={toggleDarkMode} className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}>
                  {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="container mx-auto px-6 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Contact Support Form */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Contact Support</h3>
                  <HelpCircle className="h-5 w-5 text-gray-400" />
                </div>

                {formSubmitted ? (
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    Your message has been sent successfully! We'll get back to you soon.
                  </div>
                ) : null}

                <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
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
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
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

              {/* Our Team Section */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Meet Our Team</h3>
                <div className="space-y-4">
                  {developers.map((developer, index) => (
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

            {/* FAQ Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h3 className="text-lg font-semibold mb-4">Frequently Asked Questions</h3>
              <div className="space-y-4">
                <div className="border-b pb-2">
                  <h4 className="font-medium mb-1">How do I reset my password?</h4>
                  <p className="text-sm text-gray-600">You can reset your password from the Settings page. If you're locked out, please contact the system administrator.</p>
                </div>
                <div className="border-b pb-2">
                  <h4 className="font-medium mb-1">How can I generate custom reports?</h4>
                  <p className="text-sm text-gray-600">Navigate to the Reports & Analytics section and use the custom report builder to create tailored reports.</p>
                </div>
                <div className="border-b pb-2">
                  <h4 className="font-medium mb-1">What should I do if the camera fails to recognize a license plate?</h4>
                  <p className="text-sm text-gray-600">Use the Manual Vehicle Entry page to record the vehicle information when automatic recognition fails.</p>
                </div>
                <div className="border-b pb-2">
                  <h4 className="font-medium mb-1">How do I export parking data?</h4>
                  <p className="text-sm text-gray-600">You can export data in CSV, Excel, or PDF formats from the Reports & Analytics section.</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default HelpSupport;