import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Checkbox } from '../components/ui/checkbox';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useUser } from '../UserContext';
import logo from './ui/images/logo.jpeg';

const AutoLogAuth = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const { login: setUserLogin } = useUser();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const url = `https://autolog-api.onrender.com/users/auth?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;

      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        console.log('Login Success:', data);
        setUserLogin(username, data.email);
        navigate('/dashboard');
      } else {
        const err = await response.json();
        setError(err.detail || 'Login failed');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-950 to-slate-400 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <img
                src={logo}
                alt="AutoLog Logo"
                className="h-20 w-auto"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/api/placeholder/200/100';
                }}
              />
            </div>
            <p className="text-blue-200 tracking-wider text-sm">CAPTURE · ANALYZE · IDENTIFY</p>
          </div>
        </div>

        <Card className="w-full bg-gray-800/70 border-gray-700 backdrop-blur-sm shadow-xl">
          <CardHeader className="space-y-1 pb-2">
            <CardTitle className="text-xl font-semibold text-center">Welcome Back</CardTitle>
            <CardDescription className="text-center text-gray-300">Log in to manage your parking</CardDescription>
          </CardHeader>

          <Tabs defaultValue="login" className="w-full">

            <TabsContent value="login">
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label className="text-gray-200">Username</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter your username"
                        className="pl-10 bg-gray-700/50 border-gray-600 text-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="password" className="text-gray-200">Password</Label>

                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10 bg-gray-700/50 border-gray-600 text-white"
                        required
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox id="remember" className="border-gray-500 data-[state=checked]:bg-blue-600" />
                    <label htmlFor="remember" className="text-sm text-gray-300">Remember me</label>
                  </div>

                  {error && (
                    <Alert variant="destructive" className="bg-red-900/70 border-red-800">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                </CardContent>

                <CardFooter className="flex flex-col space-y-4 pt-2">
                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 transition-all"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Logging in...
                      </div>
                    ) : (
                      'Login'
                    )}
                  </Button>

                  <div className="text-center text-sm text-gray-400">

                  </div>
                </CardFooter>
              </form>
            </TabsContent>

            {/* <TabsContent value="signup">
              <form onSubmit={(e) => e.preventDefault()}>
                <CardContent className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-gray-200">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input id="fullName" type="text" placeholder="John Doe" className="pl-10 bg-gray-700/50 border-gray-600 text-white" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signupEmail" className="text-gray-200">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input id="signupEmail" type="email" placeholder="m@example.com" className="pl-10 bg-gray-700/50 border-gray-600 text-white" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signupPassword" className="text-gray-200">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signupPassword"
                        type={showPassword ? "text" : "password"}
                        className="pl-10 pr-10 bg-gray-700/50 border-gray-600 text-white"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-400">Minimum 8 characters, include a number and special character</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-gray-200">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        className="pl-10 pr-10 bg-gray-700/50 border-gray-600 text-white"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="terms" required className="border-gray-500 data-[state=checked]:bg-blue-600" />
                    <label htmlFor="terms" className="text-sm text-gray-300">
                      I agree to the <a href="#" className="text-blue-400 hover:underline">terms and conditions</a>
                    </label>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 transition-all">Sign Up</Button>
                </CardFooter>
              </form>
            </TabsContent> */}
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default AutoLogAuth;