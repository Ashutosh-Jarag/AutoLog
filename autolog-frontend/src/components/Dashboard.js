import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Menu, Bell, Search, User, HelpCircle, Moon, Sun, ChevronLeft, ChevronRight, Car } from 'lucide-react';
import { useUser } from '../UserContext';

const Dashboard = () => {
  const [parkingData, setParkingData] = useState([]);
  const [parkingData1, setParkingData1] = useState([]);
  const [parkingData2, setParkingData2] = useState([]);
  const [todayTotalFee, setTodayTotalFee] = useState(0);
  const [totalSpaces, setTotalSpaces] = useState(0);
  const [chartData, setChartData] = useState([]);
  const [weeklyRevenue, setWeeklyRevenue] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 5;

  const navigate = useNavigate();
  const { user } = useUser();

  useEffect(() => {
    fetch('https://autolog-api.onrender.com/vehicles')
      .then(response => response.json())
      .then(data => setParkingData(data))
      .catch(error => console.error('Error fetching vehicle data:', error));

    // Fetch parking space data from the API
    fetch('https://autolog-api.onrender.com/parking-spaces')
      .then(response => response.json())
      .then(data => {
        setParkingData1(data);
        // Sum the total spaces for all vehicle types
        const total = data.reduce((acc, vehicle) => acc + vehicle.total_spaces, 0);
        setTotalSpaces(total);
      })
      .catch(error => console.error('Error fetching parking spaces:', error));

    const fetchParkingData = async () => {
      try {
        const [vehiclesRes, spacesRes] = await Promise.all([
          fetch('https://autolog-api.onrender.com/vehicles'),
          fetch('https://autolog-api.onrender.com/parking-spaces')
        ]);

        const vehicles = await vehiclesRes.json();
        const spaces = await spacesRes.json();

        // Set total parking spaces
        const total = spaces.reduce((acc, vehicle) => acc + vehicle.total_spaces, 0);
        setTotalSpaces(total);

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

        // Sum the fees
        const totalFee = exitedToday.reduce((sum, v) => sum + (v.parking_fee || 0), 0);
        setTodayTotalFee(totalFee);

        // Filter vehicles with no exit_time and entry today
        const activeToday = vehicles.filter(v => {
          return (
            !v.exit_time &&
            new Date(v.entry_time) >= todayStart
          );
        });

        setParkingData2(activeToday);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    const fetchChartData = async () => {
      try {
        const vehiclesRes = await fetch('https://autolog-api.onrender.com/vehicles');
        const vehicles = await vehiclesRes.json();

        const parkingSpacesRes = await fetch('https://autolog-api.onrender.com/parking-spaces');
        const parkingSpaces = await parkingSpacesRes.json();

        // Total parking spaces
        const totalSpaces = parkingSpaces.reduce((acc, vehicle) => acc + vehicle.total_spaces, 0);

        // Prepare a map for weekdays
        const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const chartMap = {
          Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0
        };

        // Count entries per day
        vehicles.forEach(vehicle => {
          const dayIndex = new Date(vehicle.entry_time).getDay();
          const dayName = weekdays[dayIndex];
          chartMap[dayName]++;
        });

        // Convert to chart format
        const chartData = weekdays.map(day => ({
          name: day,
          occupied: chartMap[day],
          available: totalSpaces - chartMap[day]
        }));

        setChartData(chartData);
      } catch (err) {
        console.error('Error fetching chart data:', err);
      }
    };

    const fetchRevenueData = async () => {
      try {
        const res = await fetch('https://autolog-api.onrender.com/vehicles');
        const vehicles = await res.json();

        const now = new Date();

        // Start of week (Sunday)
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        weekStart.setHours(0, 0, 0, 0);

        // Start of month
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        let weeklyRevenue = 0;
        let monthlyRevenue = 0;

        vehicles.forEach(vehicle => {
          if (vehicle.exit_time && vehicle.parking_fee) {
            const exitDate = new Date(vehicle.exit_time);

            if (exitDate >= weekStart) {
              weeklyRevenue += vehicle.parking_fee;
            }

            if (exitDate >= monthStart) {
              monthlyRevenue += vehicle.parking_fee;
            }
          }
        });

        setWeeklyRevenue(weeklyRevenue);
        setMonthlyRevenue(monthlyRevenue);
      } catch (err) {
        console.error('Error fetching revenue data:', err);
      }
    };

    fetchChartData();
    fetchParkingData();
    fetchRevenueData();
  }, []);

  // Pagination calculations
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = parkingData.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalPages = Math.ceil(parkingData.length / entriesPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const calculateDuration = (entryTime, exitTime) => {
    if (!exitTime) return 'N/A';

    const entry = new Date(entryTime);
    const exit = new Date(exitTime);
    const diffMs = exit - entry;

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  };

  return (
    <div className={`flex h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100'}`}>
      {/* Sidebar */}
      <aside className={`bg-gray-800 text-white w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition duration-200 ease-in-out z-30`}>
        <nav className='mt-20'>
          <button className="w-full text-left py-2 px-4 text-white hover:bg-gray-700 bg-gray-700" onClick={() => navigate('/dashboard')}>Dashboard</button>
          <button className="w-full text-left py-2 px-4 text-white hover:bg-gray-700" onClick={() => navigate('/vehicle-logs')}>Vehicle Logs</button>
          <button className="w-full text-left py-2 px-4 text-white hover:bg-gray-700" onClick={() => navigate('/manualentry')}>Manual Vehicle Entry</button>
          <button className="w-full text-left py-2 px-4 text-white hover:bg-gray-700" onClick={() => navigate('/reports')}>Reports & Analytics</button>
          <button className="w-full text-left py-2 px-4 text-white hover:bg-gray-700" onClick={() => navigate('/settings')}>Settings</button>
          <button className="w-full text-left py-2 px-4 text-white hover:bg-gray-700" onClick={() => navigate('/helpsupport')}>Help/Support</button>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <header className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md relative z-40`}>
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <button className="md:hidden p-2" onClick={() => setSidebarOpen(!sidebarOpen)}>
                <Menu className={`h-6 w-6 ${darkMode ? 'text-white' : 'text-gray-800'}`} />
              </button>
              <div className="flex items-center overflow-hidden">
                <Car className="h-6 w-6 mr-1 flex-shrink-0" />
                <h1 className={`text-lg md:text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} ml-1 truncate`}>AutoLog Dashboard</h1>
              </div>
            </div>

            <div className="flex items-center space-x-2 md:space-x-4">
              <div className="hidden md:block relative">
                <input
                  type="text"
                  placeholder="Search..."
                  className={`pl-8 pr-2 py-1 rounded-full ${darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'} border border-gray-300`}
                />
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>

              <div className="relative">
                <button
                  className={`p-1 md:p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                  onClick={() => setProfileOpen(!profileOpen)}
                >
                  <User className={`h-5 w-5 ${darkMode ? 'text-white' : 'text-gray-800'}`} />
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
              <button onClick={toggleDarkMode} className={`p-1 md:p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}>
                {darkMode ? <Sun className={`h-5 w-5 ${darkMode ? 'text-white' : 'text-gray-800'}`} /> : <Moon className={`h-5 w-5 ${darkMode ? 'text-white' : 'text-gray-800'}`} />}
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className={`flex-1 overflow-x-hidden overflow-y-auto ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} z-10`}>
          <div className="container mx-auto px-6 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {['Total Spaces', 'Occupied Spaces', 'Available Spaces', "Today's Revenue"].map((title, index) => (
                <div key={index} className={`${darkMode ? 'bg-gray-700 text-white' : 'bg-white'} rounded-lg shadow-md p-6`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>{title}</h3>
                    <HelpCircle className={`h-4 w-4 ${darkMode ? 'text-gray-300' : 'text-gray-400'}`} />
                  </div>
                  <div className="text-2xl font-bold">
                    {index === 0 && totalSpaces}
                    {index === 1 && parkingData2.length}
                    {index === 2 && totalSpaces - parkingData2.length}
                    {index === 3 && "₹ " + todayTotalFee}
                  </div>
                  <p className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                    {index === 0 && 'Total parking capacity'}
                    {index === 1 && 'Currently occupied spaces'}
                    {index === 2 && 'Currently available spaces'}
                    {index === 3 && '+20.1% from yesterday'}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className={`${darkMode ? 'bg-gray-700 text-white' : 'bg-white'} rounded-lg shadow-md p-6`}>
                <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Real-Time Parking Activity</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className={`${darkMode ? 'bg-gray-600' : 'bg-gray-50'}`}>
                      <tr>
                        <th className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>License Plate</th>
                        <th className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Entry Time</th>
                        <th className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Exit Time</th>
                        <th className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Duration</th>
                      </tr>
                    </thead>
                    <tbody className={`${darkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                      {currentEntries.map((vehicle, index) => (
                        <tr key={vehicle.id} className={index % 2 === 0 ? (darkMode ? 'bg-gray-900' : 'bg-gray-50') : ''}>
                          <td className="px-6 py-4 whitespace-nowrap">{vehicle.license_plate}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {new Date(vehicle.entry_time).toLocaleTimeString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {vehicle.exit_time ? new Date(vehicle.exit_time).toLocaleTimeString() : '- -'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {calculateDuration(vehicle.entry_time, vehicle.exit_time)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Showing {parkingData.length > 0 ? indexOfFirstEntry + 1 : 0} to {Math.min(indexOfLastEntry, parkingData.length)} of {parkingData.length} entries
                  </div>
                  <div className="flex space-x-2 items-center">
                    <button
                      className={`p-2 rounded ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''} ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className={`h-5 w-5 ${darkMode ? 'text-white' : 'text-gray-800'}`} />
                    </button>
                    <span className={`px-2 ${darkMode ? 'text-white' : 'text-gray-700'}`}>
                      {currentPage} / {Math.max(1, totalPages)}
                    </span>
                    <button
                      className={`p-2 rounded ${currentPage === totalPages || totalPages === 0 ? 'opacity-50 cursor-not-allowed' : ''} ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages || totalPages === 0}
                    >
                      <ChevronRight className={`h-5 w-5 ${darkMode ? 'text-white' : 'text-gray-800'}`} />
                    </button>
                  </div>
                </div>
              </div>
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-white'} rounded-lg shadow-md p-6`}>
                <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Parking Occupancy Trends</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#555" : "#ccc"} />
                    <XAxis dataKey="name" stroke={darkMode ? "#eee" : "#333"} />
                    <YAxis stroke={darkMode ? "#eee" : "#333"} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: darkMode ? '#333' : '#fff',
                        color: darkMode ? '#fff' : '#333',
                        border: `1px solid ${darkMode ? '#555' : '#ccc'}`
                      }}
                    />
                    <Legend wrapperStyle={{ color: darkMode ? '#eee' : '#333' }} />
                    <Bar dataKey="occupied" fill="#8884d8" />
                    <Bar dataKey="available" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-white'} rounded-lg shadow-md p-6`}>
                <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Recent Alerts</h3>
                <ul className="space-y-2">
                  <li className={`${darkMode ? 'bg-red-900' : 'bg-red-100'} p-2 rounded`}>Unauthorized vehicle entry attempt at Gate 2</li>
                  <li className={`${darkMode ? 'bg-yellow-900' : 'bg-yellow-100'} p-2 rounded`}>Low ink level in ticket printer at Gate 1</li>
                  <li className={`${darkMode ? 'bg-green-900' : 'bg-green-100'} p-2 rounded`}>Maintenance completed on Gate 3</li>
                </ul>
              </div>
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-white'} rounded-lg shadow-md p-6`}>
                <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Revenue Summary</h3>
                <div className="space-y-2">
                  <div>
                    <span className="font-semibold">Today's Earnings:</span> ₹{todayTotalFee}
                  </div>
                  <div>
                    <span className="font-semibold">Weekly Revenue:</span> ₹{weeklyRevenue}
                  </div>
                  <div>
                    <span className="font-semibold">Monthly Revenue:</span> ₹{monthlyRevenue}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;