import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';  // Import useNavigate
import { Menu, Bell, Search, User, Moon, Sun, ArrowUpRight, ArrowDownLeft, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useUser } from '../UserContext';

const ManualEntryPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [entryLicensePlate, setEntryLicensePlate] = useState('');
  const [entryVehicleType, setEntryVehicleType] = useState('Sedan');
  const [exitLicensePlate, setExitLicensePlate] = useState('');
  const [vehicleLogs, setVehicleLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user } = useUser();
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage] = useState(7);
  // New alert states
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success'); // success or error

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('https://autolog-api.onrender.com/vehicles');
        const data = await res.json();
        setVehicleLogs(data);

        const vehicles = await res.json();
        // Get today's date at 00:00 AM
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        // Filter vehicles that exited today
        const exitedToday = vehicles.filter(v => {
          const exitTime = new Date(v.exit_time);
          return exitTime >= todayStart && exitTime <= todayEnd;
        });

      } catch (err) {
        console.error('Failed to fetch vehicle data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Auto hide alert after 5 seconds
  useEffect(() => {
    if (showAlert) {
      const timer = setTimeout(() => {
        setShowAlert(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [showAlert]);

  const filteredLogs = vehicleLogs.filter(log =>
    log.license_plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.entry_time && log.entry_time.includes(searchTerm)) ||
    (log.exit_time && log.exit_time.includes(searchTerm))
  );

  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredLogs.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalPages = Math.ceil(filteredLogs.length / entriesPerPage);

  // Functions to handle pagination
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    // In a real application, you would apply the dark mode styles here
  };

  const handleVehicleEntry = async (e) => {
    e.preventDefault();
    if (!entryLicensePlate) return;

    try {
      const response = await fetch("https://autolog-api.onrender.com/vehicles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          license_plate: entryLicensePlate,
          vehicle_type: entryVehicleType
        })
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Vehicle entry recorded:", data);
        // Show success alert
        setAlertType('success');
        setAlertMessage(`Vehicle ${entryLicensePlate} Successfully Entered  `);
        setShowAlert(true);

        // Clear the form
        setEntryLicensePlate('');

        // Refresh vehicle logs
        const res = await fetch('https://autolog-api.onrender.com/vehicles');
        const updatedLogs = await res.json();
        setVehicleLogs(updatedLogs);
      } else {
        console.error("Error:", data);
        // Show error alert
        setAlertType('error');
        setAlertMessage(`Error: ${data.message || 'Failed to record entry'}`);
        setShowAlert(true);
      }
    } catch (error) {
      console.error("Network error:", error);
      setAlertType('error');
      setAlertMessage('Network error. Please try again.');
      setShowAlert(true);
    }
  };

  const handleVehicleExit = async (e) => {
    e.preventDefault();
    if (!exitLicensePlate) return;

    try {
      const response = await fetch(`https://autolog-api.onrender.com/vehicles/${exitLicensePlate}/exit`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        }
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Vehicle exit recorded:", data);
        // Show success alert
        setAlertType('success');
        setAlertMessage(`Vehicle ${exitLicensePlate} Successfully Exited  `);
        setShowAlert(true);

        // Clear the form
        setExitLicensePlate('');

        // Refresh vehicle logs
        const res = await fetch('https://autolog-api.onrender.com/vehicles');
        const updatedLogs = await res.json();
        setVehicleLogs(updatedLogs);
      } else {
        console.error("Exit failed:", data.message || data);
        // Show error alert
        setAlertType('error');
        setAlertMessage(`Error: ${data.message || 'Failed to record exit'}`);
        setShowAlert(true);
      }
    } catch (error) {
      console.error("Error calling exit API:", error);
      setAlertType('error');
      setAlertMessage('Network error. Please try again.');
      setShowAlert(true);
    }
  };

  return (
    <div className={`flex h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100'}`}>
      {/* Sidebar */}
      <aside className={`bg-gray-800 text-white w-64 space-y-6  py-7 px-2 absolute inset-y-0 left-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition duration-200 ease-in-out`}>
        <nav className='mt-20'>
          <button className="w-full text-left py-2 px-4 text-white hover:bg-gray-700" onClick={() => navigate('/dashboard')}>Dashboard</button>
          <button className="w-full text-left py-2 px-4 text-white hover:bg-gray-700" onClick={() => navigate('/vehicle-logs')}>Vehicle Logs</button>
          <button className="w-full text-left py-2 px-4 text-white hover:bg-gray-700 bg-gray-700" onClick={() => navigate('/manualentry')}>Manual Vehicle Entry</button>
          <button className="w-full text-left py-2 px-4 text-white hover:bg-gray-700" onClick={() => navigate('/reports')}>Reports & Analytics</button>
          <button className="w-full text-left py-2 px-4 text-white hover:bg-gray-700" onClick={() => navigate('/settings')}>Settings</button>
          <button className="w-full text-left py-2 px-4 text-white hover:bg-gray-700" onClick={() => navigate('/helpsupport')} >Help/Support</button>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <header className={`${darkMode ? 'bg-gray-800' : 'bg-white'}  shadow-md relative`}>
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <button className="md:hidden p-2" onClick={() => setSidebarOpen(!sidebarOpen)}>
                <Menu className="h-6 w-6" />
              </button>
              <h1 className={`text-lg md:text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} ml-2`}>Manual Vehicle Entry</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search logs..."
                  className={`pl-8 pr-2 py-1 rounded-full ${darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'} border border-gray-300`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>

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
                      <span className="font-medium text-gray-700">{user.username}</span>
                    </div>
                    <button onClick={() => navigate('/')}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
              <button onClick={toggleDarkMode} className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}>
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </header>

        {/* Main Content - Split Layout */}
        <main className={`flex-1 overflow-y-auto ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col lg:flex-row lg:space-x-6">
              {/* Left Side - Entry/Exit Forms */}
              <div className="w-full lg:w-1/2 mb-6 lg:mb-0">
                <div className="grid grid-cols-1  gap-6">
                  {/* Vehicle Entry Form */}
                  <div className={`${darkMode ? 'bg-gray-700' : 'bg-white'} rounded-lg shadow-md p-6`}>
                    <h2 className="text-lg font-bold mb-4">Vehicle Entry</h2>
                    <form onSubmit={handleVehicleEntry}>
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">License Plate</label>
                        <input
                          type="text"
                          value={entryLicensePlate}
                          onChange={(e) => setEntryLicensePlate(e.target.value)}
                          className={`w-full p-2 border rounded ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'}`}
                          placeholder="Enter license plate"
                          required
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Vehicle Type</label>
                        <select
                          value={entryVehicleType}
                          onChange={(e) => setEntryVehicleType(e.target.value)}
                          className={`w-full p-2 border rounded ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'}`}
                        >
                          <option value="bike">Bike</option>
                          <option value="scooter">Scooter</option>
                          <option value="car">Car</option>
                          <option value="truck">Truck</option>
                          <option value="others">Others</option>
                        </select>
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded flex items-center justify-center"
                      >
                        <ArrowUpRight className="mr-2 h-5 w-5" />
                        Record Entry
                      </button>
                    </form>
                  </div>

                  {/* Vehicle Exit Form */}
                  <div className={`${darkMode ? 'bg-gray-700' : 'bg-white'} rounded-lg shadow-md p-6`}>
                    <h2 className="text-lg font-bold mb-4">Vehicle Exit</h2>
                    <form onSubmit={handleVehicleExit}>
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">License Plate</label>
                        <input
                          type="text"
                          value={exitLicensePlate}
                          onChange={(e) => setExitLicensePlate(e.target.value)}
                          className={`w-full p-2 border rounded ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'}`}
                          placeholder="Enter license plate"
                          required
                        />
                      </div>
                      <div className="mt-12"> {/* Added spacing to align buttons */}
                        <button
                          type="submit"
                          className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded flex items-center justify-center"
                        >
                          <ArrowDownLeft className="mr-2 h-5 w-5" />
                          Record Exit
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>

              {/* Right Side - Vehicle Log Table */}
              <div className="w-full lg:w-2/4">
                <div className={`${darkMode ? 'bg-gray-700' : 'bg-white'} rounded-lg shadow-md p-6`}>
                  <h2 className="text-lg font-bold mb-4">Recent Vehicle Activity</h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className={`${darkMode ? 'bg-gray-600' : 'bg-gray-50'}`}>
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">License Plate</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entry Time</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exit Time</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle Type</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parking Fee</th>
                        </tr>
                      </thead>
                      <tbody className={`${darkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                        {currentEntries.map((log, index) => (
                          <tr key={log.id} className={index % 2 === 0 ? (darkMode ? 'bg-gray-900' : 'bg-gray-50') : ''}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {log.exit_time ?
                                  <ArrowDownLeft className="h-5 w-5 text-red-500 mr-2" /> :
                                  <ArrowUpRight className="h-5 w-5 text-green-500 mr-2" />
                                }
                                {log.license_plate}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">{new Date(log.entry_time).toLocaleString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{log.exit_time ? new Date(log.exit_time).toLocaleString() : 'In Parking'}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{log.vehicle_type}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{log.parking_fee || 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Showing {indexOfFirstEntry + 1}-{Math.min(indexOfLastEntry, filteredLogs.length)} of {filteredLogs.length} entries
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={goToPrevPage}
                        disabled={currentPage === 1}
                        className={`p-2 rounded ${currentPage === 1
                          ? (darkMode ? 'bg-gray-700 text-gray-500' : 'bg-gray-100 text-gray-400')
                          : (darkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-200 hover:bg-gray-300')
                          }`}
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <span className={`flex items-center px-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {currentPage} / {totalPages}
                      </span>
                      <button
                        onClick={goToNextPage}
                        disabled={currentPage === totalPages}
                        className={`p-2 rounded ${currentPage === totalPages
                          ? (darkMode ? 'bg-gray-700 text-gray-500' : 'bg-gray-100 text-gray-400')
                          : (darkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-200 hover:bg-gray-300')
                          }`}
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Alert Toast Notification */}
      {showAlert && (
        <div className="fixed bottom-4 left-4 z-50 animate-fade-in-up">
          <div className={`flex items-center px-4 py-3 rounded-lg shadow-lg ${alertType === 'success'
              ? 'bg-green-100 border-l-4 border-green-500'
              : 'bg-red-100 border-l-4 border-red-500'
            }`}>
            <div className={`flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full ${alertType === 'success' ? 'bg-green-100' : 'bg-red-100'
              }`}>
              {alertType === 'success' ? (
                <ArrowUpRight className="h-5 w-5 text-green-600" />
              ) : (
                <X className="h-5 w-5 text-red-600" />
              )}
            </div>
            <div className="ml-3">
              <p className={`text-sm font-medium ${alertType === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                {alertMessage}
              </p>
            </div>
            <button
              onClick={() => setShowAlert(false)}
              className="ml-auto bg-transparent text-gray-400 hover:text-gray-900"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManualEntryPage;