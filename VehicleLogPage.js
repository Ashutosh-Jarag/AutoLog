"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import {
  Menu,
  Bell,
  Search,
  User,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
  Video,
  LogIn,
  LogOut,
  X,
} 
from "lucide-react"
import { useUser } from "../UserContext"
import { GoogleGenerativeAI } from "@google/generative-ai"

const VehicleLogPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [vehicleLogs, setVehicleLogs] = useState([])
  const [todayTotalFee, setTodayTotalFee] = useState(0)
  const [cameraEnabled, setCameraEnabled] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const { user } = useUser()
  const [recognitionResult, setRecognitionResult] = useState("No vehicles detected")
  const [isProcessing, setIsProcessing] = useState(false)
  const [captureInterval, setCaptureInterval] = useState(null)
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 7;
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');


  // New state for detected vehicle and confirmation box
  const [detectedVehicle, setDetectedVehicle] = useState(null)
  const [showConfirmation, setShowConfirmation] = useState(false)

  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

  const navigate = useNavigate()

  // Initialize Gemini API
  const apiKey = process.env.REACT_APP_GEMINI_API_KEY
  const genAI = new GoogleGenerativeAI(apiKey || "AIzaSyDTtxPv61nJG9Rdcd-Oape6h4azQs1KZLQ")




  // Add a useEffect to check API key on component mount
  useEffect(() => {
    if (!apiKey) {
      console.error("REACT_APP_GEMINI_API_KEY is not set. Vehicle detection will not work.")
      setRecognitionResult("Error: API key not configured. Check console for details.")
    }
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("https://autolog-api.onrender.com/vehicles")
        const vehicles = await res.json()
        setVehicleLogs(vehicles)

        // Get today's date at 00:00 AM
        const todayStart = new Date()
        todayStart.setHours(0, 0, 0, 0)

        const todayEnd = new Date()
        todayEnd.setHours(23, 59, 59, 999)

        // Filter vehicles that exited today
        const exitedToday = vehicles.filter((v) => {
          const exitTime = new Date(v.exit_time)
          return exitTime >= todayStart && exitTime <= todayEnd
        })

        // Sum the fees
        const totalFee = exitedToday.reduce((sum, v) => sum + (v.parking_fee || 0), 0)
        setTodayTotalFee(totalFee)
      } catch (err) {
        console.error("Failed to fetch vehicle data:", err)
      }
    }

    fetchData()
  }, [])

  // Handle camera setup and teardown
  useEffect(() => {
    if (cameraEnabled) {
      startCamera()
    } else {
      stopCamera()
    }

    return () => {
      stopCamera()
    }
  }, [cameraEnabled])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "environment",
        },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream

        // Set up periodic capture for license plate detection
        const interval = setInterval(() => {
          if (!isProcessing && !showConfirmation) {
            captureAndProcessImage()
          }
        }, 5000) // Process every 5 seconds

        setCaptureInterval(interval)
      }
    } catch (err) {
      console.error("Error accessing camera:", err)
      setRecognitionResult("Camera access error: " + err.message)
    }
  }

  // Auto hide alert after 5 seconds
  useEffect(() => {
    if (showAlert) {
      const timer = setTimeout(() => {
        setShowAlert(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [showAlert]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    if (captureInterval) {
      clearInterval(captureInterval)
      setCaptureInterval(null)
    }

    setRecognitionResult("No vehicles detected")
  }

  const captureAndProcessImage = async () => {
    if (!videoRef.current || !canvasRef.current || isProcessing) return

    setIsProcessing(true)
    setRecognitionResult("Capturing image...")

    try {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext("2d")

      // Check if video is playing
      if (video.readyState !== 4) {
        setRecognitionResult("Video not ready. Please wait...")
        setIsProcessing(false)
        return
      }

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // Draw current video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Convert canvas to base64 image
      const imageData = canvas.toDataURL("image/jpeg", 0.8)

      console.log("Image captured, size:", Math.round(imageData.length / 1024), "KB")

      // Process with Gemini
      await processImageWithGemini(imageData)
    } catch (err) {
      console.error("Error processing image:", err)
      setRecognitionResult("Processing error: " + err.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const processImageWithGemini = async (imageData) => {
    setRecognitionResult("Processing image...")

    try {
      // Convert base64 to blob for Gemini
      const base64Data = imageData.split(",")[1]

      // Log API key presence (not the actual key)
      console.log("API Key available:", !!process.env.REACT_APP_GEMINI_API_KEY)

      // Get the model
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" })

      // Prepare the prompt
      const prompt = `
        Analyze this image and identify:
        1. The license plate number (if visible)
        2. The vehicle type (must be one of: Bike, Car, Truck, Scooter, Others)
        
        Return ONLY a JSON object with this format:
        {
          "licensePlate": "the license plate text or null if not visible",
          "vehicleType": "one of: Bike, Car, Truck, Scooter, Others",
          "confidence": "high/medium/low"
        }
      `

      // Create image part
      const imageParts = {
        inlineData: {
          data: base64Data,
          mimeType: "image/jpeg",
        },
      }

      setRecognitionResult("Detecting...")

      // Generate content
      const result = await model.generateContent([prompt, imageParts])
      const response = await result.response
      const text = response.text()

      console.log("Raw API response:", text)

      // Parse the JSON response
      try {
        // Try to extract JSON if it's wrapped in markdown code blocks
        let jsonText = text
        if (text.includes("```json")) {
          jsonText = text.split("```json")[1].split("```")[0].trim()
        } else if (text.includes("```")) {
          jsonText = text.split("```")[1].split("```")[0].trim()
        }

        const parsedResult = JSON.parse(jsonText)
        console.log("Parsed result:", parsedResult)

        if (parsedResult.licensePlate && parsedResult.vehicleType) {
          setRecognitionResult(`Detected: ${parsedResult.licensePlate} (${parsedResult.vehicleType})`)

          // Set detected vehicle and show confirmation
          setDetectedVehicle({
            licensePlate: parsedResult.licensePlate,
            vehicleType: parsedResult.vehicleType,
            confidence: parsedResult.confidence,
          })
          setShowConfirmation(true)

          // Clear any existing capture interval to prevent new captures while confirmation is shown
          if (captureInterval) {
            clearInterval(captureInterval)
            setCaptureInterval(null)
          }
        } else {
          setRecognitionResult("No valid license plate detected")
        }
      } catch (parseError) {
        console.error("Error parsing LLM response:", parseError, "Raw text:", text)
        setRecognitionResult("Error parsing AI response. Check console for details.")
      }
    } catch (err) {
      console.error("Error with Gemini API:", err)
      setRecognitionResult(`AI processing error: ${err.message}`)
    }
  }

  // Handler for vehicle entry and exit with confirmation
  const handleVehicleEntry = async () => {
    if (!detectedVehicle) return

    try {
      const response = await fetch("https://autolog-api.onrender.com/vehicles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          license_plate: detectedVehicle.licensePlate,
          vehicle_type: detectedVehicle.vehicleType.toLowerCase(),
        }),
      })

      console.log("=", detectedVehicle.licensePlate, detectedVehicle.vehicleType)

      if (response.ok) {
        const newVehicle = await response.json()
        setVehicleLogs((prev) => [newVehicle, ...prev])
        setRecognitionResult(`Vehicle entered: ${detectedVehicle.licensePlate} (${detectedVehicle.vehicleType})`)

        // Show success alert
        setAlertType('success');
        setAlertMessage(`Vehicle ${detectedVehicle.licensePlate} Successfully Entered  `);
        setShowAlert(true);

        // Refresh data
        const res = await fetch("https://autolog-api.onrender.com/vehicles")
        const vehicles = await res.json()
        setVehicleLogs(vehicles)

        // Clear confirmation
        setShowConfirmation(false)
        setDetectedVehicle(null)

        // Restart capture interval
        if (cameraEnabled) {
          const interval = setInterval(() => {
            if (!isProcessing && !showConfirmation) {
              captureAndProcessImage()
            }
          }, 5000)
          setCaptureInterval(interval)
        }
      } else {
        console.error("Failed to register vehicle entry")
        // Show error alert
        setAlertType('error');
        setAlertMessage(`'Failed to record entry'`);
        setShowAlert(true);
        setRecognitionResult("Failed to register vehicle entry")
      }
    } catch (err) {
      console.error("Error registering vehicle entry:", err)
      setRecognitionResult("Error registering vehicle entry: " + err.message)
    }
  }

  const handleVehicleExit = async () => {
    if (!detectedVehicle) return

    try {
      const response = await fetch(`https://autolog-api.onrender.com/vehicles/${detectedVehicle.licensePlate}/exit`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setRecognitionResult(`Vehicle exited: ${detectedVehicle.licensePlate}`)
        // Show success alert
        setAlertType('success');
        setAlertMessage(`Vehicle ${detectedVehicle.licensePlate} Successfully Exited  `);
        setShowAlert(true);

        // Refresh data
        const res = await fetch("https://autolog-api.onrender.com/vehicles")
        const vehicles = await res.json()
        setVehicleLogs(vehicles)

        // Update today's total fee
        const todayStart = new Date()
        todayStart.setHours(0, 0, 0, 0)

        const todayEnd = new Date()
        todayEnd.setHours(23, 59, 59, 999)

        const exitedToday = vehicles.filter((v) => {
          const exitTime = new Date(v.exit_time)
          return exitTime >= todayStart && exitTime <= todayEnd
        })

        const totalFee = exitedToday.reduce((sum, v) => sum + (v.parking_fee || 0), 0)
        setTodayTotalFee(totalFee)

        // Clear confirmation
        setShowConfirmation(false)
        setDetectedVehicle(null)

        // Restart capture interval
        if (cameraEnabled) {
          const interval = setInterval(() => {
            if (!isProcessing && !showConfirmation) {
              captureAndProcessImage()
            }
          }, 5000)
          setCaptureInterval(interval)
        }
      } else {
        console.error("Failed to register vehicle exit")
        // Show error alert
        setAlertType('error');
        setAlertMessage(`'Failed to record exit'`);
        setShowAlert(true);

        setRecognitionResult("Failed to register vehicle exit")
      }
    } catch (err) {
      console.error("Error registering vehicle exit:", err)
      setRecognitionResult("Error registering vehicle exit: " + err.message)
    }
  }

  const handleCancelDetection = () => {
    setShowConfirmation(false)
    setDetectedVehicle(null)
    setRecognitionResult("Detection canceled")

    // Restart capture interval
    if (cameraEnabled) {
      const interval = setInterval(() => {
        if (!isProcessing && !showConfirmation) {
          captureAndProcessImage()
        }
      }, 5000)
      setCaptureInterval(interval)
    }
  }

  const filteredLogs = vehicleLogs.filter(
    (log) =>
      log.license_plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.entry_time && log.entry_time.includes(searchTerm)) ||
      (log.exit_time && log.exit_time.includes(searchTerm)),
  )

  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredLogs.slice(indexOfFirstEntry, indexOfLastEntry);

  const totalPages = Math.ceil(filteredLogs.length / entriesPerPage);
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
    setDarkMode(!darkMode)
  }

  const toggleCamera = () => {
    setCameraEnabled(!cameraEnabled)
  }

  return (
    <div className={`flex h-screen ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100"}`}>
      {/* Sidebar - kept the same as in the Dashboard */}
      <aside
        className={`bg-gray-800 text-white w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0 transition duration-200 ease-in-out`}
      >
        <nav className='mt-20'>
          <button
            className="w-full text-left py-2 px-4 text-white hover:bg-gray-700"
            onClick={() => navigate("/dashboard")}
          >
            Dashboard
          </button>
          <button
            className="w-full text-left py-2 px-4 text-white hover:bg-gray-700  bg-gray-700"
            onClick={() => navigate("/vehicle-logs")}
          >
            Vehicle Logs
          </button>
          <button
            className="w-full text-left py-2 px-4 text-white hover:bg-gray-700"
            onClick={() => navigate("/manualentry")}
          >
            Manual Vehicle Entry
          </button>
          <button
            className="w-full text-left py-2 px-4 text-white hover:bg-gray-700"
            onClick={() => navigate("/reports")}
          >
            Reports & Analytics
          </button>
          <button
            className="w-full text-left py-2 px-4 text-white hover:bg-gray-700"
            onClick={() => navigate("/settings")}
          >
            Settings
          </button>
          <button
            className="w-full text-left py-2 px-4 text-white hover:bg-gray-700"
            onClick={() => navigate("/helpsupport")}
          >
            Help/Support
          </button>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar - similar to Dashboard */}
        <header className={`${darkMode ? "bg-gray-800" : "bg-white"} shadow-md relative`}>
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <button className="md:hidden p-2" onClick={() => setSidebarOpen(!sidebarOpen)}>
                <Menu className="h-6 w-6" />
              </button>
              <h1 className={`text-sm md:text-xl font-semibold ${darkMode ? "text-white" : "text-gray-800"} ml-2`}>
                Vehicle Logs
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search logs..."
                  className={`pl-8 pr-2 py-1 rounded-full ${darkMode ? "bg-gray-700 text-white" : "bg-white text-gray-800"} border border-gray-300`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>

              <div className="relative">
                <button className="p-2 rounded-full hover:bg-gray-200" onClick={() => setProfileOpen(!profileOpen)}>
                  <User className="h-5 w-5" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                    <div className="flex items-center space-x-2 p-4 border-b border-gray-100">
                      <User className="h-6 w-6 text-gray-600" />
                      <span className="font-medium text-gray-700">{user.username}</span>
                    </div>
                    <button
                      onClick={() => navigate("/")}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-full ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-200"}`}
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </header>

        {/* Main Content - Vehicle Log */}
        <main className={`flex-1 overflow-x-hidden overflow-y-auto ${darkMode ? "bg-gray-800" : "bg-gray-100"}`}>
          <div className="container mx-auto px-6 py-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold">Vehicle Entry/Exit Log</h2>
              <div className="flex items-center">
                <span className={`mr-2 ${darkMode ? "text-white" : "text-gray-700"}`}>Live Camera</span>
                <div
                  className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer ${cameraEnabled ? "bg-green-500" : darkMode ? "bg-gray-700" : "bg-gray-300"}`}
                  onClick={toggleCamera}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${cameraEnabled ? "translate-x-6" : ""}`}
                  ></div>
                </div>
                <Video
                  className={`ml-2 h-5 w-5 ${cameraEnabled ? (darkMode ? "text-green-400" : "text-green-500") : darkMode ? "text-gray-400" : "text-gray-500"}`}
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
              {/* Live Camera Section */}
              {/* Live Camera Section */}
              {cameraEnabled && (
                <div
                  className={`${darkMode ? "bg-gray-700" : "bg-white"} rounded-lg shadow-md p-6 mb-6 md:mb-0 md:w-1/2 flex flex-col max-h-[calc(100vh-14rem)] relative`}
                >
                  <h3 className={`text-xl font-semibold mb-4 ${darkMode ? "text-white" : "text-gray-800"}`}>
                    Live Camera Feed
                  </h3>
                  <div className="bg-black rounded-lg aspect-video flex items-center justify-center overflow-hidden">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                  </div>

                  <div className="mt-4 flex-shrink-0">
                    <h4 className={`font-medium mb-2 ${darkMode ? "text-white" : "text-gray-800"}`}>
                      Live Recognition
                    </h4>
                    <div className={`p-3 rounded ${darkMode ? "bg-gray-800" : "bg-gray-100"}`}>
                      <p className="text-sm">{recognitionResult}</p>
                      {isProcessing && <p className="text-sm text-yellow-500 mt-1">Processing image...</p>}
                    </div>

                    {/* Vehicle detection confirmation box */}
                    {showConfirmation && detectedVehicle && (
                      <div
                        className={`mt-4 p-4 rounded border ${darkMode ? "bg-gray-800 border-gray-600" : "bg-white border-gray-300"} shadow-md`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <h4 className={`font-medium ${darkMode ? "text-white" : "text-gray-800"}`}>
                            Vehicle Detected
                          </h4>
                          <button onClick={handleCancelDetection} className="text-gray-500 hover:text-gray-700">
                            <X className="h-5 w-5" />
                          </button>
                        </div>

                        <div className="mb-4">
                          <p className={`${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                            <strong>License Plate:</strong> {detectedVehicle.licensePlate}
                          </p>
                          <p className={`${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                            <strong>Vehicle Type:</strong> {detectedVehicle.vehicleType}
                          </p>
                          <p className={`${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                            <strong>Confidence:</strong> {detectedVehicle.confidence}
                          </p>
                        </div>

                        <div className="flex justify-between">
                          <button
                            onClick={handleVehicleEntry}
                            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                          >
                            <LogIn className="h-4 w-4" />
                            Register Entry
                          </button>
                          <button
                            onClick={handleVehicleExit}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            <LogOut className="h-4 w-4" />
                            Register Exit
                          </button>
                        </div>
                      </div>
                    )}

                    {!showConfirmation && (
                      <div className="mt-2 flex justify-end">
                        <button
                          onClick={captureAndProcessImage}
                          disabled={isProcessing}
                          className={`px-3 py-1 rounded text-sm ${isProcessing ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600 text-white"
                            }`}
                        >
                          Capture Now
                        </button>
                        <button
                          onClick={() => {
                            console.log("Debug info:", {
                              apiKeyExists: !!process.env.REACT_APP_GEMINI_API_KEY,
                              videoReady: videoRef.current?.readyState,
                              streamActive: !!streamRef.current,
                              isProcessing,
                            })
                            setRecognitionResult("Debug info logged to console")
                          }}
                          className="px-3 py-1 rounded text-sm bg-gray-500 hover:bg-gray-600 text-white ml-2"
                        >
                          Debug
                        </button>
                      </div>
                    )}
                  </div>
                  {/* Hidden canvas for image processing */}
                  <canvas ref={canvasRef} className="hidden" />
                </div>
              )}

              {/* Vehicle Log Table */}
              <div
                className={`${darkMode ? "bg-gray-700" : "bg-white"} rounded-lg shadow-md p-6 mb-6 ${cameraEnabled ? "md:w-1/2" : "w-full"}`}
              >
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className={`${darkMode ? "bg-gray-600" : "bg-gray-50"}`}>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          License Plate
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Entry Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Exit Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Vehicle Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Parking Fee
                        </th>
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
                    Showing {indexOfFirstEntry + 1} to {Math.min(indexOfLastEntry, filteredLogs.length)} of {filteredLogs.length} entries
                  </div>
                  <div className="flex space-x-2">
                    <button
                      className={`p-2 rounded ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''} ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <span className={`flex items-center px-2 ${darkMode ? 'text-white' : 'text-gray-700'}`}>
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      className={`p-2 rounded ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''} ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className={`${darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-600"} shadow-md`}>
          <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <div>
              {/* Total Parked Vehicles: <span className="font-bold">{mockVehicleLogs.filter(log => !log.exitTime).length}</span> */}
            </div>
            <div>
              Today's Revenue: <span className="font-bold">₹ {todayTotalFee}</span>
            </div>
          </div>
        </footer>
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
  )
}

export default VehicleLogPage
