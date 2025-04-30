import React, { useState, useEffect } from 'react';
import { Input } from "../components/ui/input"
import { Select } from "../components/ui/select"
import { useNavigate } from 'react-router-dom';
import { Moon, Sun, Menu, Bell, User } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useUser } from '../UserContext';

const ReportsAnalyticsPage = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user } = useUser();

  // Data states
  const [allVehicles, setAllVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [vehicleChartData, setVehicleChartData] = useState([]);
  const [revenueChartData, setRevenueChartData] = useState([]);
  const [vehicleTypeData, setVehicleTypeData] = useState([]);

  // Filter states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedVehicleType, setSelectedVehicleType] = useState('');

  const [metrics, setMetrics] = useState({
    totalVehicles: 0,
    avgParkingDuration: '0 hrs',
    peakOccupancyTime: 'N/A',
    totalRevenue: 0,
  });

  const toggleDarkMode = () => setDarkMode(!darkMode);
  const navigate = useNavigate();

  // Fetch all vehicle data on component mount
  useEffect(() => {
    const fetchVehicleData = async () => {
      try {
        const response = await fetch('https://autolog-api.onrender.com/vehicles');
        const data = await response.json();
        setAllVehicles(data);
        setFilteredVehicles(data);
        processVehicleData(data);
      } catch (err) {
        console.error('Failed to fetch vehicle data:', err);
      }
    };

    fetchVehicleData();
  }, []);

  // Process vehicle data to generate metrics and charts
  const processVehicleData = (vehicles) => {
    const totalVehicles = vehicles.length;
    let totalDuration = 0;
    let totalRevenue = 0;
    let entryTimes = [];

    // Calculate metrics
    vehicles.forEach(vehicle => {
      if (vehicle.entry_time && vehicle.exit_time) {
        const entry = new Date(vehicle.entry_time);
        const exit = new Date(vehicle.exit_time);
        const diffInHours = (exit - entry) / (1000 * 60 * 60);
        totalDuration += diffInHours;
        entryTimes.push(entry);
      }

      totalRevenue += vehicle.parking_fee || 0;
    });

    const avgParkingDuration = totalVehicles ? (totalDuration / totalVehicles).toFixed(2) + ' hrs' : '0 hrs';

    let peakOccupancyTime = 'N/A';
    if (entryTimes.length > 0) {
      const avgMinutes = Math.floor(
        entryTimes.reduce((sum, time) => sum + time.getHours() * 60 + time.getMinutes(), 0) / entryTimes.length
      );
      const hours = Math.floor(avgMinutes / 60).toString().padStart(2, '0');
      const minutes = (avgMinutes % 60).toString().padStart(2, '0');
      peakOccupancyTime = `${hours}:${minutes}`;
    }

    setMetrics({
      totalVehicles,
      avgParkingDuration,
      peakOccupancyTime,
      totalRevenue,
    });

    // Generate chart data
    const vehicleCountMap = {};
    const revenueMap = {};
    const vehicleTypeMap = {};

    vehicles.forEach(vehicle => {
      const date = new Date(vehicle.entry_time).toISOString().split('T')[0];

      // Vehicles per day
      vehicleCountMap[date] = (vehicleCountMap[date] || 0) + 1;

      // Revenue per day
      revenueMap[date] = (revenueMap[date] || 0) + (vehicle.parking_fee || 0);

      // Vehicle type
      const type = vehicle.vehicle_type || 'unknown';
      vehicleTypeMap[type] = (vehicleTypeMap[type] || 0) + 1;
    });

    // Convert to chart-friendly arrays
    const vehiclesChartArr = Object.entries(vehicleCountMap).map(([date, count]) => ({
      date,
      count,
    }));

    const revenueChartArr = Object.entries(revenueMap).map(([date, revenue]) => ({
      date,
      revenue,
    }));

    const typeChartArr = Object.entries(vehicleTypeMap).map(([type, value]) => ({
      name: type,
      value,
    }));

    setVehicleChartData(vehiclesChartArr);
    setRevenueChartData(revenueChartArr);
    setVehicleTypeData(typeChartArr);
  };

  // Handle filter application
  const applyFilters = () => {
    let filtered = [...allVehicles];

    // Apply date range filter
    if (startDate) {
      const startDateTime = new Date(startDate);
      filtered = filtered.filter(vehicle =>
        new Date(vehicle.entry_time) >= startDateTime
      );
    }

    if (endDate) {
      const endDateTime = new Date(endDate);
      // Set time to end of day
      endDateTime.setHours(23, 59, 59, 999);
      filtered = filtered.filter(vehicle =>
        new Date(vehicle.entry_time) <= endDateTime
      );
    }

    // Apply vehicle type filter
    if (selectedVehicleType) {
      filtered = filtered.filter(vehicle =>
        vehicle.vehicle_type === selectedVehicleType
      );
    }

    setFilteredVehicles(filtered);
    processVehicleData(filtered);
  };

  // Reset filters
  const resetFilters = () => {
    setStartDate('');
    setEndDate('');
    setSelectedVehicleType('');
    setFilteredVehicles(allVehicles);
    processVehicleData(allVehicles);
  };

  return (
    <div className={`flex h-screen  ${darkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-100'}`}>
      {/* Sidebar */}
      <aside className={`bg-gray-800 text-white w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition duration-200 ease-in-out z-30`}>
        <nav className='mt-20'>
          <button className="w-full text-left py-2 px-4 text-white hover:bg-gray-700" onClick={() => navigate('/dashboard')}>Dashboard</button>
          <button className="w-full text-left py-2 px-4 text-white hover:bg-gray-700" onClick={() => navigate('/vehicle-logs')}>Vehicle Logs</button>
          <button className="w-full text-left py-2 px-4 text-white hover:bg-gray-700" onClick={() => navigate('/manualentry')}>Manual Vehicle Entry</button>
          <button className="w-full text-left py-2 px-4 text-white hover:bg-gray-700 bg-gray-700" onClick={() => navigate('/reports')}>Reports & Analytics</button>
          <button className="w-full text-left py-2 px-4 text-white hover:bg-gray-700" onClick={() => navigate('/settings')}>Settings</button>
          <button className="w-full text-left py-2 px-4 text-white hover:bg-gray-700" onClick={() => navigate('/helpsupport')}>Help/Support</button>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <header className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md z-40`}>
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <button className="md:hidden p-2" onClick={() => setSidebarOpen(!sidebarOpen)}>
                <Menu className="h-6 w-6" />
              </button>
              <h1 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} ml-2`}>Reports & Analytics</h1>
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

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-8 z-10">
          <div className="max-w-6xl mx-auto">
            {/* Filter and Export Section */}
            <div className="mb-6 flex flex-wrap gap-4 items-center">
              <div className="flex items-center">
                <label className={`mr-2 ${darkMode ? 'text-white' : 'text-gray-700'}`}>Start Date:</label>
                <Input
                  type="date"
                  className="w-40 text-black"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="flex items-center">
                <label className={`mr-2 ${darkMode ? 'text-white' : 'text-gray-700'}`}>End Date:</label>
                <Input
                  type="date"
                  className="w-40 text-black"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>



              <button
                onClick={applyFilters}
                className={`px-4 py-2 rounded-md ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
              >
                View Report
              </button>

              <button
                onClick={resetFilters}
                className={`px-4 py-2 rounded-md ${darkMode ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-300 hover:bg-gray-400'} text-${darkMode ? 'white' : 'gray-800'}`}
              >
                Reset Filters
              </button>
            </div>

            {/* Filter Summary */}
            <div className={`mb-6 p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
              <h2 className="text-lg font-semibold mb-2">Filter Summary</h2>
              <div className="flex flex-wrap gap-4">
                <div>
                  <span className="font-medium">Date Range:</span> {startDate ? startDate : 'All'} to {endDate ? endDate : 'All'}
                </div>
                <div>
                  <span className="font-medium">Vehicle Type:</span> {selectedVehicleType || 'All'}
                </div>
                <div>
                  <span className="font-medium">Results:</span> {filteredVehicles.length} vehicles
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
                <h2 className="text-xl font-semibold mb-4">Revenue Trends</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueChartData}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className={`p-2 rounded ${darkMode ? 'bg-gray-700' : 'bg-white'} border`}>
                            <p className="font-medium">{`Date: ${payload[0].payload.date}`}</p>
                            <p className={`${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                              {`Revenue: ₹${payload[0].value}`}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }} />
                    <Line type="monotone" dataKey="revenue" stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
                <h2 className="text-xl font-semibold mb-4">Vehicle Count</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={vehicleChartData}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className={`p-2 rounded ${darkMode ? 'bg-gray-700' : 'bg-white'} border`}>
                            <p className="font-medium">{`Date: ${payload[0].payload.date}`}</p>
                            <p className={`${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                              {`Vehicles: ${payload[0].value}`}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }} />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Vehicle Type Distribution */}
            <div className={`mb-8 p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
              <h2 className="text-xl font-semibold mb-4">Vehicle Type Distribution</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {vehicleTypeData.map((item) => (
                  <div key={item.name} className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <p className="font-medium capitalize">{item.name}</p>
                    <p className="text-2xl font-bold">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Metrics Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { name: 'Total Vehicles', value: metrics.totalVehicles },
                { name: 'Avg. Parking Duration', value: metrics.avgParkingDuration },
                { name: 'Peak Occupancy Time', value: metrics.peakOccupancyTime },
                { name: 'Total Revenue', value: `₹${metrics.totalRevenue}` }
              ].map((metric) => (
                <div key={metric.name} className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
                  <h3 className="text-lg font-semibold mb-2">{metric.name}</h3>
                  <p className="text-2xl font-bold">{metric.value}</p>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ReportsAnalyticsPage;