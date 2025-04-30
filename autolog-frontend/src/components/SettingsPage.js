import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Bell, User, Moon, Sun, UserPlus, Trash2, Edit, X } from 'lucide-react';
import { useUser } from '../UserContext';

const SettingsPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('user');
  const [highSecurityMode, setHighSecurityMode] = useState(false);
  const [vehicleAlerts, setVehicleAlerts] = useState(true);
  const [users, setUsers] = useState([]);
  const [parkingRates, setParkingRates] = useState([]);
  const [profileOpen, setProfileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  // New alert states
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');

  // Modal states
  const [showUserModal, setShowUserModal] = useState(false);
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editingFee, setEditingFee] = useState(null);
  const [editUsername, setEditUsername] = useState("");
  const [editFeeAmount, setEditFeeAmount] = useState("");

  // New user form state
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    role: "user",
    password: ""
  });

  const navigate = useNavigate();

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    // Apply dark mode to the document body
    if (!darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  };

  // Apply dark mode class on component mount if darkMode is true
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  useEffect(() => {
    fetch('https://autolog-api.onrender.com/users')
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(error => console.error('Error fetching users:', error));

    const fetchRates = async () => {
      try {
        const response = await fetch("https://autolog-api.onrender.com/parking-rates");
        const data = await response.json();
        setParkingRates(data);
      } catch (error) {
        console.error("Error fetching parking rates:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
  }, []);

  useEffect(() => {
    if (showAlert) {
      const timer = setTimeout(() => {
        setShowAlert(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [showAlert]);

  const handleEditUserClick = (user) => {
    setEditingUser(user);
    setEditUsername(user.username);
    setShowUserModal(true);
  };

  const handleEditFeeClick = (fee) => {
    setEditingFee(fee);
    setEditFeeAmount(fee.hourly_rate.toString());
    setShowFeeModal(true);
  };

  const handleUpdateUser = async () => {
    try {
      const response = await fetch(`https://autolog-api.onrender.com/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: editUsername,
          email: editingUser.email,
          role: editingUser.role,
          password: editingUser.password || "default123"  // Use current password or a placeholder
        }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        const updatedUsers = users.map(user =>
          user.id === editingUser.id ? updatedUser : user
        );
        setUsers(updatedUsers);

        setAlertType('success');
        setAlertMessage("User updated successfully");
        setShowAlert(true);

        setShowUserModal(false);


        console.log("User updated successfully");
      } else {
        const errorText = await response.text();
        setAlertType('error');
        setAlertMessage("Failed to update user");
        setShowAlert(true);
        console.error("Failed to update user", errorText);
      }
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleAddUser = async () => {
    try {
      const response = await fetch('https://autolog-api.onrender.com/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });

      if (response.ok) {
        const addedUser = await response.json();
        setUsers([...users, addedUser]);
        setShowAddUserModal(false);
        setNewUser({ username: "", email: "", role: "user", password: "" });

        setAlertType('success');
        setAlertMessage("User added successfully");
        setShowAlert(true);

        console.log("User added successfully");
      } else {
        const errorText = await response.text();
        console.error("Failed to add user", errorText);
      }
    } catch (error) {

      setAlertType('error');
      setAlertMessage("Error adding user:");
      setShowAlert(true);
      console.error("Error adding user:", error);
    }
  };

  const handleNewUserChange = (e) => {
    const { name, value } = e.target;
    setNewUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateFee = async () => {
    try {
      const response = await fetch(`https://autolog-api.onrender.com/parking-rates/${editingFee.vehicle_type}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vehicle_type: editingFee.vehicle_type,
          hourly_rate: parseFloat(editFeeAmount),
        }),
      });

      if (response.ok) {
        const updatedRates = parkingRates.map(rate =>
          rate.vehicle_type === editingFee.vehicle_type
            ? { ...rate, hourly_rate: parseFloat(editFeeAmount) }
            : rate
        );
        setParkingRates(updatedRates);
        setShowFeeModal(false);

        setAlertType('success');
        setAlertMessage("Fee updated successfully");
        setShowAlert(true);

        console.log("Fee updated successfully");
      } else {

        setAlertType('error');
        setAlertMessage("Failed to update fee");
        setShowAlert(true);

        console.error("Failed to update fee");
      }
    } catch (error) {
      console.error("Error updating fee:", error);
    }
  };

  // Add User Modal
  const renderAddUserModal = () => {
    if (!showAddUserModal) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Add New User</h3>
            <button onClick={() => setShowAddUserModal(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-white' : 'text-gray-700'}`}>Username</label>
              <input
                type="text"
                name="username"
                value={newUser.username}
                onChange={handleNewUserChange}
                className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'}`}
                placeholder="Enter username"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-white' : 'text-gray-700'}`}>Email</label>
              <input
                type="email"
                name="email"
                value={newUser.email}
                onChange={handleNewUserChange}
                className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'}`}
                placeholder="Enter email"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-white' : 'text-gray-700'}`}>Password</label>
              <input
                type="password"
                name="password"
                value={newUser.password}
                onChange={handleNewUserChange}
                className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'}`}
                placeholder="Enter password"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-white' : 'text-gray-700'}`}>Role</label>
              <select
                name="role"
                value={newUser.role}
                onChange={handleNewUserChange}
                className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'}`}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={handleAddUser}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
            >
              Add User
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Edit User Modal
  const renderUserModal = () => {
    if (!showUserModal) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">Edit User</h3>
            <button onClick={() => setShowUserModal(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
              <X size={20} />
            </button>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-white">Username</label>
            <input
              type="text"
              value={editUsername}
              onChange={(e) => setEditUsername(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'}`}
            />
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleUpdateUser}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
            >
              Update
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Edit Fee Modal
  const renderFeeModal = () => {
    if (!showFeeModal) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">Edit Fee</h3>
            <button onClick={() => setShowFeeModal(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
              <X size={20} />
            </button>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-white">Vehicle Type</label>
            <input
              type="text"
              value={editingFee?.vehicle_type || ""}
              disabled
              className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-400' : 'bg-gray-100 border-gray-300 text-gray-500'}`}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-white">Hourly Rate (₹)</label>
            <input
              type="number"
              value={editFeeAmount}
              onChange={(e) => setEditFeeAmount(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'}`}
            />
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleUpdateFee}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
            >
              Update
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderUserManagement = () => (
    <div className={`rounded-lg shadow p-6 ${darkMode ? 'bg-gray-700 text-white' : 'bg-blue-100'}`}>
      <h3 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>User Management</h3>

      <div className="mb-4">
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded inline-flex items-center"
          onClick={() => setShowAddUserModal(true)}
        >
          <UserPlus className="mr-2" />
          Add New User
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Username</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className={`divide-y divide-gray-200 ${darkMode ? 'bg-gray-800 dark:divide-gray-700' : 'bg-white'}`}>
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">{user.username}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.role}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    className="text-blue-600 hover:text-blue-900 mr-2"
                    onClick={() => handleEditUserClick(user)}
                  >
                    <Edit size={18} />
                  </button>
                  {/* <button className="text-red-600 hover:text-red-900">
                    <Trash2 size={18} />
                  </button> */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderFeeStructure = () => (
    <div className={`rounded-lg shadow p-6 ${darkMode ? 'bg-gray-700 text-white' : 'bg-blue-100'}`}>
      <h3 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Parking Fee Structure</h3>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Vehicle Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Hourly Rate (₹)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className={`divide-y divide-gray-200 ${darkMode ? 'bg-gray-800 dark:divide-gray-700' : 'bg-white'}`}>
            {parkingRates.map((rate) => (
              <tr key={rate.id}>
                <td className="px-6 py-4 whitespace-nowrap">{rate.vehicle_type}</td>
                <td className="px-6 py-4 whitespace-nowrap">₹{rate.hourly_rate}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    className="text-blue-600 hover:text-blue-900"
                    onClick={() => handleEditFeeClick(rate)}
                  >
                    <Edit size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className={`rounded-lg shadow p-6 ${darkMode ? 'bg-gray-700 text-white' : 'bg-blue-100'}`}>
      <h3 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Security Settings</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>High Security Mode</span>
          <button
            onClick={() => setHighSecurityMode(!highSecurityMode)}
            className={`${highSecurityMode ? 'bg-blue-600' : 'bg-gray-200'
              } relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            <span
              className={`${highSecurityMode ? 'translate-x-6' : 'translate-x-1'
                } inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}
            />
          </button>
        </div>
        <div className="flex items-center justify-between">
          <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Vehicle Alerts</span>
          <button
            onClick={() => setVehicleAlerts(!vehicleAlerts)}
            className={`${vehicleAlerts ? 'bg-blue-600' : 'bg-gray-200'
              } relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            <span
              className={`${vehicleAlerts ? 'translate-x-6' : 'translate-x-1'
                } inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}
            />
          </button>
        </div>
      </div>
      <div className="mt-6">
        <h4 className={`text-lg font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Recent Security Logs</h4>
        <ul className="space-y-2">
          <li className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>2023-10-17 14:30 - Unauthorized access attempt at Gate 2</li>
          <li className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>2023-10-17 10:15 - Security camera 3 went offline</li>
          <li className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>2023-10-16 22:45 - Night shift security personnel change</li>
        </ul>
      </div>
    </div>
  );

  return (
    <div className={`flex h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100'}`}>
      {/* Sidebar - kept the same as in the Dashboard */}
      <aside className={`bg-gray-800 text-white w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition duration-200 ease-in-out`}>
        <nav className='mt-20'>
          <button className="w-full text-left py-2 px-4 text-white hover:bg-gray-700" onClick={() => navigate('/dashboard')}>Dashboard</button>
          <button className="w-full text-left py-2 px-4 text-white hover:bg-gray-700" onClick={() => navigate('/vehicle-logs')}>Vehicle Logs</button>
          <button className="w-full text-left py-2 px-4 text-white hover:bg-gray-700" onClick={() => navigate('/manualentry')}>Manual Vehicle Entry</button>
          <button className="w-full text-left py-2 px-4 text-white hover:bg-gray-700" onClick={() => navigate('/reports')}>Reports & Analytics</button>
          <button className="w-full text-left py-2 px-4 text-white hover:bg-gray-700  bg-gray-700" onClick={() => navigate('/settings')}>Settings</button>
          <button className="w-full text-left py-2 px-4 text-white hover:bg-gray-700" onClick={() => navigate('/helpsupport')}>Help/Support</button>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar - similar to Dashboard */}
        <header className={`shadow-md relative ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <button className="md:hidden p-2" onClick={() => setSidebarOpen(!sidebarOpen)}>
                <Menu className="h-6 w-6" />
              </button>
              <h1 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} ml-2`}>AutoLog Settings</h1>
            </div>
            <div className="flex items-center space-x-4">
              
              <div className="relative">
                <button
                  className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                  onClick={() => setProfileOpen(!profileOpen)}
                >
                  <User className="h-5 w-5" />
                </button>

                {profileOpen && (
                  <div className={`absolute right-0 mt-2 w-48 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-md shadow-lg z-50`}>
                    <div className={`flex items-center space-x-2 p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                      <User className={`h-6 w-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                      <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{user.username}</span>
                    </div>
                    <button
                      onClick={() => navigate('/')}
                      className={`w-full text-left px-4 py-2 text-sm ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </header>

        {/* Main Content - Settings */}
        <main className={`flex-1 overflow-x-hidden overflow-y-auto ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
          <div className="container mx-auto px-6 py-8">
            <div className="mb-6">
              <div className="sm:hidden">
                <label htmlFor="tabs" className="sr-only">Select a tab</label>
                <select
                  id="tabs"
                  name="tabs"
                  className={`block w-full rounded-md ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white border-gray-300'} focus:border-blue-500 focus:ring-blue-500`}
                  value={activeTab}
                  onChange={(e) => setActiveTab(e.target.value)}
                >
                  <option value="user">User Management</option>
                  <option value="fee">Fee Structure</option>
                  <option value="security">Security Settings</option>
                </select>
              </div>
              <div className="hidden sm:block">
                <nav className="flex space-x-4" aria-label="Tabs">
                  {['user', 'fee', 'security'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`${activeTab === tab
                        ? darkMode
                          ? 'bg-blue-900 text-blue-200'
                          : 'bg-blue-100 text-blue-700'
                        : darkMode
                          ? 'text-gray-400 hover:text-gray-200'
                          : 'text-gray-500 hover:text-gray-700'
                        } px-3 py-2 font-medium text-sm rounded-md`}
                    >
                      {tab === 'user' && 'User Management'}
                      {tab === 'fee' && 'Fee Structure'}
                      {tab === 'security' && 'Security Settings'}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {activeTab === 'user' && renderUserManagement()}
            {activeTab === 'fee' && renderFeeStructure()}
            {activeTab === 'security' && renderSecuritySettings()}

            {/* Render Modals */}
            {renderUserModal()}
            {renderFeeModal()}
            {renderAddUserModal()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;