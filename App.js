import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [message, setMessage] = useState('Loading...');
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState(null);
  const [authMessage, setAuthMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [donations, setDonations] = useState([]);
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({ totalDonations: 0, totalVolunteers: 0, totalBeneficiaries: 0, totalEvents: 0 });
  const [volunteers, setVolunteers] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [recentDonations, setRecentDonations] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', userType: 'donor', phone: '', address: '', city: '', state: '', pincode: ''
  });
  
  const [donationData, setDonationData] = useState({
    amount: '', purpose: '', paymentMethod: '', transactionId: ''
  });
  
  const [eventData, setEventData] = useState({
    title: '', description: '', date: '', location: '', maxVolunteers: ''
  });
  
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [profileData, setProfileData] = useState({ phone: '', address: '', city: '', state: '', pincode: '' });
  const [userDonations, setUserDonations] = useState([]);
  const [userActivities, setUserActivities] = useState([]);
  const [totalHours, setTotalHours] = useState(0);

  useEffect(() => {
    fetch('http://localhost:5000/api/test')
      .then(res => res.json())
      .then(data => setMessage(data.message))
      .catch(() => setMessage('Backend not connected'));
    const savedUser = localStorage.getItem('ngoUser');
    if (savedUser) setUser(JSON.parse(savedUser));
    fetchStats();
    fetchEvents();
  }, []);

  useEffect(() => {
    if (user) {
      fetchDonations();
      fetchVolunteers();
      fetchUserDonations();
      fetchUserProfile();
      if (user.userType === 'volunteer') fetchVolunteerActivities();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/stats');
      const data = await res.json();
      if (data.success) { setStats(data.stats); setRecentDonations(data.recentDonations || []); setUpcomingEvents(data.upcomingEvents || []); }
    } catch (error) { console.error('Error:', error); }
  };

  const fetchDonations = async () => {
    try { const res = await fetch('http://localhost:5000/api/donations'); const data = await res.json(); if (data.success) setDonations(data.donations); } catch (error) { console.error('Error:', error); }
  };

  const fetchEvents = async () => {
    try { const res = await fetch('http://localhost:5000/api/events'); const data = await res.json(); if (data.success) setEvents(data.events); } catch (error) { console.error('Error:', error); }
  };

  const fetchVolunteers = async () => {
    try { const res = await fetch('http://localhost:5000/api/volunteers'); const data = await res.json(); if (data.success) setVolunteers(data.volunteers); } catch (error) { console.error('Error:', error); }
  };

  const fetchUserDonations = async () => {
    try { const res = await fetch(`http://localhost:5000/api/donations/user/${user.id}`); const data = await res.json(); if (data.success) setUserDonations(data.donations); } catch (error) { console.error('Error:', error); }
  };

  const fetchUserProfile = async () => {
    try { const res = await fetch(`http://localhost:5000/api/users/${user.id}`); const data = await res.json(); if (data.success) setProfileData({ phone: data.user.phone || '', address: data.user.address || '', city: data.user.city || '', state: data.user.state || '', pincode: data.user.pincode || '' }); } catch (error) { console.error('Error:', error); }
  };

  const fetchVolunteerActivities = async () => {
    try { const res = await fetch(`http://localhost:5000/api/volunteer/activity/${user.id}`); const data = await res.json(); if (data.success) { setUserActivities(data.activities); setTotalHours(data.totalHours); } } catch (error) { console.error('Error:', error); }
  };

  const handleRegister = async (e) => {
    e.preventDefault(); setIsLoading(true); setAuthMessage('');
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
      const data = await res.json();
      if (res.ok) { setAuthMessage('✅ Registration successful! Please login.'); setFormData({ name: '', email: '', password: '', userType: 'donor', phone: '', address: '', city: '', state: '', pincode: '' }); setTimeout(() => setCurrentPage('login'), 2000); } 
      else { setAuthMessage(`❌ ${data.error || 'Registration failed'}`); }
    } catch (error) { setAuthMessage('❌ Server error. Please try again.'); } finally { setIsLoading(false); }
  };

  const handleLogin = async (e) => {
    e.preventDefault(); setIsLoading(true); setAuthMessage('');
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(loginData) });
      const data = await res.json();
      if (res.ok) { setUser(data.user); localStorage.setItem('ngoUser', JSON.stringify(data.user)); setAuthMessage(`✅ Welcome ${data.user.name}!`); setLoginData({ email: '', password: '' }); setTimeout(() => setCurrentPage('dashboard'), 1500); } 
      else { setAuthMessage(`❌ ${data.error || 'Login failed'}`); }
    } catch (error) { setAuthMessage('❌ Server error. Please try again.'); } finally { setIsLoading(false); }
  };

  const handleDonation = async (e) => {
    e.preventDefault(); setIsLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/donations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ donorId: user?.id, donorName: user?.name, donorEmail: user?.email, amount: parseFloat(donationData.amount), purpose: donationData.purpose, paymentMethod: donationData.paymentMethod, transactionId: donationData.transactionId }) });
      const data = await res.json();
      if (data.success) { setAuthMessage(`✅ Donation successful! Receipt: ${data.receiptNo}`); setDonationData({ amount: '', purpose: '', paymentMethod: '', transactionId: '' }); fetchDonations(); fetchUserDonations(); fetchStats(); } 
      else { setAuthMessage('❌ Donation failed'); }
    } catch (error) { setAuthMessage('❌ Server error'); } finally { setIsLoading(false); }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault(); setIsLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...eventData, date: new Date(eventData.date), maxVolunteers: parseInt(eventData.maxVolunteers), createdBy: user.id }) });
      const data = await res.json();
      if (data.success) { setAuthMessage('✅ Event created successfully!'); setEventData({ title: '', description: '', date: '', location: '', maxVolunteers: '' }); fetchEvents(); fetchStats(); } 
      else { setAuthMessage('❌ Failed to create event'); }
    } catch (error) { setAuthMessage('❌ Server error'); } finally { setIsLoading(false); }
  };

  const handleJoinEvent = async (eventId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/events/${eventId}/join`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ volunteerId: user.id }) });
      const data = await res.json();
      if (data.success) { setAuthMessage('✅ Successfully joined event!'); fetchEvents(); }
    } catch (error) { setAuthMessage('❌ Failed to join event'); }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault(); setIsLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/users/${user.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(profileData) });
      const data = await res.json();
      if (data.success) { setAuthMessage('✅ Profile updated successfully!'); } else { setAuthMessage('❌ Failed to update profile'); }
    } catch (error) { setAuthMessage('❌ Server error'); } finally { setIsLoading(false); }
  };

  const handleAIChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userMessage = chatInput;
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setChatInput('');
    try {
      const res = await fetch('http://localhost:5000/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user?.id, userType: user?.userType, message: userMessage }) });
      const data = await res.json();
      if (data.success) { setChatMessages(prev => [...prev, { role: 'assistant', content: data.response }]); } 
      else { setChatMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I had trouble responding.' }]); }
    } catch (error) { setChatMessages(prev => [...prev, { role: 'assistant', content: 'Network error. Please try again.' }]); }
  };

  const handleLogout = () => { setUser(null); localStorage.removeItem('ngoUser'); setAuthMessage('✅ Logged out successfully'); setCurrentPage('home'); setChatMessages([]); };

  const totalDonations = stats.totalDonations;

  const navItems = [
    { id: 'home', label: 'Home', show: true },
    { id: 'dashboard', label: 'Dashboard', show: user !== null },
    { id: 'donate', label: 'Donate', show: user?.userType === 'donor' },
    { id: 'events', label: 'Events', show: user !== null },
    { id: 'volunteers', label: 'Volunteers', show: user?.userType === 'admin' },
    { id: 'profile', label: 'Profile', show: user !== null },
    { id: 'ai-chat', label: 'AI Assistant', show: user !== null },
    { id: 'create-event', label: 'Create Event', show: user?.userType === 'admin' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/50">
      {/* ========== NAVBAR ========== */}
      <nav className="bg-white shadow-md sticky top-0 z-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentPage('home')}>
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white text-xl">🤝</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">NGO Seva</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.filter(item => item.show).map(item => (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    currentPage === item.id
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-indigo-600'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              
              {user ? (
                <div className="ml-6 flex items-center space-x-4 pl-6 border-l border-slate-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-semibold shadow-sm">
                      {user.name.charAt(0)}
                    </div>
                    <div className="hidden lg:block">
                      <div className="text-sm font-semibold text-slate-800">{user.name}</div>
                      {user.uniqueId && <div className="text-xs text-slate-500">{user.uniqueId}</div>}
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition shadow-sm"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="ml-6 flex space-x-3 pl-6 border-l border-slate-200">
                  <button onClick={() => setCurrentPage('login')} className="px-5 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg font-medium transition">Login</button>
                  <button onClick={() => setCurrentPage('register')} className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-md transition">Register</button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button className="md:hidden p-2 rounded-lg hover:bg-slate-100">
              <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* ========== MAIN CONTENT ========== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alert Message */}
        {authMessage && (
          <div className={`mb-6 p-4 rounded-xl shadow-sm ${authMessage.includes('✅') ? 'bg-green-50 text-green-800 border border-green-200' : authMessage.includes('❌') ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-amber-50 text-amber-800 border border-amber-200'}`}>
            {authMessage}
          </div>
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 flex items-center space-x-3 shadow-2xl">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
              <span className="text-slate-700">Processing...</span>
            </div>
          </div>
        )}

        {/* ========== HOME PAGE ========== */}
        {currentPage === 'home' && (
          <div>
            {/* Hero Section */}
            <div className="text-center py-16 md:py-24">
              <div className="inline-flex items-center space-x-2 bg-indigo-100 px-4 py-2 rounded-full mb-6">
                <span className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></span>
                <span className="text-sm text-indigo-700 font-medium">Platform Status: {message}</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-slate-800 mb-6">
                Empowering NGOs with
                <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mt-2">Digital Solutions</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
                Complete NGO Management Platform for Donors, Volunteers, and Beneficiaries
              </p>
            </div>

            {/* Stats Section - Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-16">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-lg transition-all hover:-translate-y-1">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">💰</span>
                  </div>
                  <span className="text-2xl font-bold text-slate-800">₹{totalDonations.toLocaleString()}</span>
                </div>
                <p className="text-slate-500 text-sm font-medium">Total Donations</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-lg transition-all hover:-translate-y-1">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">🤝</span>
                  </div>
                  <span className="text-2xl font-bold text-slate-800">{stats.totalVolunteers}</span>
                </div>
                <p className="text-slate-500 text-sm font-medium">Active Volunteers</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-lg transition-all hover:-translate-y-1">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <span className="text-2xl font-bold text-slate-800">{stats.totalBeneficiaries}</span>
                </div>
                <p className="text-slate-500 text-sm font-medium">Beneficiaries</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-lg transition-all hover:-translate-y-1">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">📅</span>
                  </div>
                  <span className="text-2xl font-bold text-slate-800">{stats.totalEvents}</span>
                </div>
                <p className="text-slate-500 text-sm font-medium">Events Conducted</p>
              </div>
            </div>

            {/* Features Section - Cards */}
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-xl transition-all hover:-translate-y-2">
                <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mb-5">
                  <span className="text-3xl">💰</span>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">For Donors</h3>
                <p className="text-slate-600 mb-5">Track donations, get 80G certificates, and see your impact in real-time.</p>
                <button onClick={() => setCurrentPage(user ? 'donate' : 'register')} className="inline-flex items-center text-indigo-600 font-semibold hover:text-indigo-700">
                  Donate Now <span className="ml-2">→</span>
                </button>
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-xl transition-all hover:-translate-y-2">
                <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-5">
                  <span className="text-3xl">🤝</span>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">For Volunteers</h3>
                <p className="text-slate-600 mb-5">Get your unique Volunteer ID, join events, track hours, and earn certificates.</p>
                <button onClick={() => setCurrentPage(user ? 'events' : 'register')} className="inline-flex items-center text-emerald-600 font-semibold hover:text-emerald-700">
                  Join Events <span className="ml-2">→</span>
                </button>
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-xl transition-all hover:-translate-y-2">
                <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mb-5">
                  <span className="text-3xl">🎯</span>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">For Beneficiaries</h3>
                <p className="text-slate-600 mb-5">Receive assistance, track support received, and access resources easily.</p>
                <button onClick={() => setCurrentPage(user ? 'dashboard' : 'register')} className="inline-flex items-center text-amber-600 font-semibold hover:text-amber-700">
                  Get Support <span className="ml-2">→</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========== DASHBOARD PAGE ========== */}
        {currentPage === 'dashboard' && user && (
          <div>
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 mb-8 text-white shadow-xl">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name}! 👋</h1>
                  <p className="text-white/80">Here's your NGO activity overview</p>
                </div>
                {user.uniqueId && (
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl px-5 py-2">
                    <span className="text-sm font-mono">{user.uniqueId}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">💰</span>
                  </div>
                  <span className="text-2xl font-bold text-slate-800">₹{totalDonations.toLocaleString()}</span>
                </div>
                <p className="text-slate-500 text-sm">Total Donations</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">🤝</span>
                  </div>
                  <span className="text-2xl font-bold text-slate-800">{stats.totalVolunteers}</span>
                </div>
                <p className="text-slate-500 text-sm">Active Volunteers</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <span className="text-2xl font-bold text-slate-800">{stats.totalBeneficiaries}</span>
                </div>
                <p className="text-slate-500 text-sm">Beneficiaries</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">📅</span>
                  </div>
                  <span className="text-2xl font-bold text-slate-800">{stats.totalEvents}</span>
                </div>
                <p className="text-slate-500 text-sm">Events Conducted</p>
              </div>
            </div>

            {/* Volunteer Stats */}
            {user.userType === 'volunteer' && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-8">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Your Volunteer Stats</h3>
                <div className="grid grid-cols-2 gap-5">
                  <div className="text-center p-4 bg-indigo-50 rounded-xl">
                    <div className="text-3xl font-bold text-indigo-600">{totalHours}</div>
                    <div className="text-sm text-slate-600 mt-1">Total Hours</div>
                  </div>
                  <div className="text-center p-4 bg-emerald-50 rounded-xl">
                    <div className="text-3xl font-bold text-emerald-600">{userActivities.length}</div>
                    <div className="text-sm text-slate-600 mt-1">Events Participated</div>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Donations & Events */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Recent Donations</h3>
                {recentDonations.length === 0 ? (
                  <p className="text-slate-500 text-center py-8">No donations yet</p>
                ) : (
                  <div className="space-y-3">
                    {recentDonations.map((d, i) => (
                      <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                        <div>
                          <p className="font-semibold text-slate-800">{d.donorName}</p>
                          <p className="text-xs text-slate-500">{d.purpose || 'General'}</p>
                        </div>
                        <p className="font-bold text-green-600">₹{d.amount.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Upcoming Events</h3>
                {upcomingEvents.length === 0 ? (
                  <p className="text-slate-500 text-center py-8">No upcoming events</p>
                ) : (
                  <div className="space-y-3">
                    {upcomingEvents.map((e, i) => (
                      <div key={i} className="p-3 bg-slate-50 rounded-xl">
                        <p className="font-semibold text-slate-800">{e.title}</p>
                        <p className="text-xs text-slate-500 mt-1">{new Date(e.date).toLocaleDateString()} • {e.location}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========== LOGIN PAGE ========== */}
        {currentPage === 'login' && (
          <div className="min-h-[80vh] flex items-center justify-center py-12">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-4xl">🔐</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Welcome Back</h2>
                <p className="text-slate-500 mt-1">Login to your NGO Seva account</p>
              </div>
              <form onSubmit={handleLogin} className="space-y-4">
                <input type="email" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="Email address" value={loginData.email} onChange={(e) => setLoginData({...loginData, email: e.target.value})} required />
                <input type="password" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="Password" value={loginData.password} onChange={(e) => setLoginData({...loginData, password: e.target.value})} required />
                <button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition">Login</button>
              </form>
              <p className="text-center text-slate-600 mt-6">
                Don't have an account?{' '}
                <button onClick={() => setCurrentPage('register')} className="text-indigo-600 hover:underline font-medium">Create Account</button>
              </p>
            </div>
          </div>
        )}

        {/* ========== REGISTER PAGE ========== */}
        {currentPage === 'register' && (
          <div className="min-h-[80vh] flex items-center justify-center py-12">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-4xl">📝</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Create Account</h2>
                <p className="text-slate-500 mt-1">Join the NGO Seva community</p>
              </div>
              <form onSubmit={handleRegister} className="space-y-3">
                <input type="text" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Full Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                <input type="email" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                <input type="password" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required />
                <select className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" value={formData.userType} onChange={(e) => setFormData({...formData, userType: e.target.value})}>
                  <option value="donor">I want to donate</option>
                  <option value="volunteer">I want to volunteer</option>
                  <option value="beneficiary">I need assistance</option>
                </select>
                <input type="tel" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Phone (Optional)" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                <button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition mt-2">Register</button>
              </form>
              <p className="text-center text-slate-600 mt-6">
                Already have an account?{' '}
                <button onClick={() => setCurrentPage('login')} className="text-indigo-600 hover:underline font-medium">Sign In</button>
              </p>
            </div>
          </div>
        )}

        {/* ========== DONATE PAGE ========== */}
        {currentPage === 'donate' && user && user.userType === 'donor' && (
          <div className="min-h-[80vh] flex items-center justify-center py-12">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-4xl">💝</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Make a Donation</h2>
                <p className="text-slate-500 mt-1">Your contribution makes a difference</p>
              </div>
              <form onSubmit={handleDonation} className="space-y-4">
                <div>
                  <label className="block text-slate-700 mb-2 font-medium">Donor Name</label>
                  <input type="text" className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50" value={user.name} disabled />
                </div>
                <div>
                  <label className="block text-slate-700 mb-2 font-medium">Amount (₹)</label>
                  <input type="number" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Enter amount" value={donationData.amount} onChange={(e) => setDonationData({...donationData, amount: e.target.value})} required />
                </div>
                <div>
                  <label className="block text-slate-700 mb-2 font-medium">Purpose</label>
                  <input type="text" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Education, Healthcare, Food" value={donationData.purpose} onChange={(e) => setDonationData({...donationData, purpose: e.target.value})} required />
                </div>
                <div>
                  <label className="block text-slate-700 mb-2 font-medium">Payment Method</label>
                  <select className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" value={donationData.paymentMethod} onChange={(e) => setDonationData({...donationData, paymentMethod: e.target.value})} required>
                    <option value="">Select payment method</option>
                    <option value="UPI">UPI / Google Pay</option>
                    <option value="Card">Credit / Debit Card</option>
                    <option value="NetBanking">Net Banking</option>
                  </select>
                </div>
                <button type="submit" className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition">Donate Now</button>
              </form>
            </div>
          </div>
        )}

        {/* ========== EVENTS PAGE ========== */}
        {currentPage === 'events' && user && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Upcoming Events</h2>
                <p className="text-slate-500 mt-1">Join events and make an impact</p>
              </div>
              {user.userType === 'volunteer' && user.uniqueId && (
                <div className="bg-indigo-50 rounded-xl px-4 py-2">
                  <span className="text-sm text-indigo-600 font-medium">Your ID: {user.uniqueId}</span>
                </div>
              )}
            </div>

            {events.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-100">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">📅</span>
                </div>
                <p className="text-slate-500">No events scheduled. Check back later!</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {events.map((event, i) => (
                  <div key={i} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg transition">
                    <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-slate-800 mb-2">{event.title}</h3>
                      <p className="text-slate-600 mb-4">{event.description}</p>
                      <div className="space-y-2 mb-6">
                        <p className="text-sm text-slate-500">📅 {new Date(event.date).toLocaleDateString()}</p>
                        <p className="text-sm text-slate-500">📍 {event.location}</p>
                        <p className="text-sm text-slate-500">🤝 {event.volunteers?.length || 0} / {event.maxVolunteers || 'Unlimited'} volunteers</p>
                      </div>
                      {user.userType === 'volunteer' && (
                        <button onClick={() => handleJoinEvent(event._id)} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 rounded-xl font-medium hover:shadow-md transition">Join as Volunteer</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========== AI CHAT PAGE ========== */}
        {currentPage === 'ai-chat' && user && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5 text-white">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">🤖</span>
                  <div>
                    <h2 className="text-xl font-bold">NGO Seva AI Assistant</h2>
                    <p className="text-white/80 text-sm">Ask me about 80G, TDS, FCRA, donations, volunteering, and more</p>
                  </div>
                </div>
              </div>
              <div className="h-96 overflow-y-auto p-4 bg-slate-50">
                {chatMessages.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-4xl">🤖</span>
                    </div>
                    <p className="text-slate-500">Ask me anything about NGO management!</p>
                    <div className="flex flex-wrap justify-center gap-2 mt-6">
                      <button onClick={() => setChatInput("What is 80G certificate?")} className="px-4 py-2 bg-white border border-slate-200 rounded-full text-sm hover:bg-indigo-50 hover:border-indigo-200 transition">80G Certificate</button>
                      <button onClick={() => setChatInput("How to file TDS?")} className="px-4 py-2 bg-white border border-slate-200 rounded-full text-sm hover:bg-indigo-50 transition">TDS Filing</button>
                      <button onClick={() => setChatInput("FCRA rules for NGOs")} className="px-4 py-2 bg-white border border-slate-200 rounded-full text-sm hover:bg-indigo-50 transition">FCRA Rules</button>
                      <button onClick={() => setChatInput("How to volunteer?")} className="px-4 py-2 bg-white border border-slate-200 rounded-full text-sm hover:bg-indigo-50 transition">Volunteer</button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {chatMessages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-xl ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-700'}`}>
                          {msg.content}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <form onSubmit={handleAIChat} className="p-4 border-t border-slate-200 bg-white">
                <div className="flex space-x-3">
                  <input type="text" className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Type your question..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} />
                  <button type="submit" className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition">Send</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========== PROFILE PAGE ========== */}
        {currentPage === 'profile' && user && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-8 text-white">
                <div className="flex items-center space-x-5">
                  <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-4xl font-bold backdrop-blur-sm">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{user.name}</h2>
                    <p className="text-white/80 capitalize">{user.userType}</p>
                    {user.uniqueId && <p className="text-sm text-white/70 font-mono mt-1">{user.uniqueId}</p>}
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Contact Information</h3>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-slate-600 mb-1">Email</label>
                      <input type="email" className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50" value={user.email} disabled />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-600 mb-1">Phone</label>
                      <input type="tel" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" value={profileData.phone} onChange={(e) => setProfileData({...profileData, phone: e.target.value})} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Address</label>
                    <input type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" value={profileData.address} onChange={(e) => setProfileData({...profileData, address: e.target.value})} />
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-slate-600 mb-1">City</label>
                      <input type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" value={profileData.city} onChange={(e) => setProfileData({...profileData, city: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-600 mb-1">State</label>
                      <input type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" value={profileData.state} onChange={(e) => setProfileData({...profileData, state: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-600 mb-1">Pincode</label>
                      <input type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" value={profileData.pincode} onChange={(e) => setProfileData({...profileData, pincode: e.target.value})} />
                    </div>
                  </div>
                  <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition">Update Profile</button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ========== CREATE EVENT PAGE (ADMIN) ========== */}
        {currentPage === 'create-event' && user?.userType === 'admin' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-4xl">📅</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Create New Event</h2>
                <p className="text-slate-500 mt-1">Organize an event for volunteers</p>
              </div>
              <form onSubmit={handleCreateEvent} className="space-y-4">
                <input type="text" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Event Title" value={eventData.title} onChange={(e) => setEventData({...eventData, title: e.target.value})} required />
                <textarea rows="3" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Description" value={eventData.description} onChange={(e) => setEventData({...eventData, description: e.target.value})} required />
                <input type="datetime-local" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" value={eventData.date} onChange={(e) => setEventData({...eventData, date: e.target.value})} required />
                <input type="text" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Location" value={eventData.location} onChange={(e) => setEventData({...eventData, location: e.target.value})} required />
                <input type="number" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Max Volunteers (Optional)" value={eventData.maxVolunteers} onChange={(e) => setEventData({...eventData, maxVolunteers: e.target.value})} />
                <button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition">Create Event</button>
              </form>
            </div>
          </div>
        )}

        {/* ========== VOLUNTEERS PAGE (ADMIN) ========== */}
        {currentPage === 'volunteers' && user?.userType === 'admin' && (
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Volunteers Directory</h2>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">ID</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Name</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Email</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Phone</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {volunteers.map((v, i) => (
                      <tr key={i} className="border-t border-slate-100 hover:bg-slate-50">
                        <td className="px-6 py-4 text-sm font-mono text-indigo-600">{v.uniqueId}</td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-800">{v.name}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{v.email}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{v.phone || '-'}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{new Date(v.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ========== FOOTER ========== */}
      <footer className="bg-white border-t border-slate-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">🤝</span>
                </div>
                <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">NGO Seva</span>
              </div>
              <p className="text-slate-500 text-sm">Empowering NGOs with digital solutions for better management and impact.</p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><button onClick={() => setCurrentPage('home')} className="hover:text-indigo-600 transition">Home</button></li>
                <li><button onClick={() => user ? setCurrentPage('dashboard') : setCurrentPage('login')} className="hover:text-indigo-600 transition">Dashboard</button></li>
                <li><button onClick={() => user ? setCurrentPage('donate') : setCurrentPage('register')} className="hover:text-indigo-600 transition">Donate</button></li>
                <li><button onClick={() => user ? setCurrentPage('events') : setCurrentPage('register')} className="hover:text-indigo-600 transition">Events</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><button className="hover:text-indigo-600 transition">Help Center</button></li>
                <li><button className="hover:text-indigo-600 transition">FAQs</button></li>
                <li><button className="hover:text-indigo-600 transition">Contact Us</button></li>
                <li><button className="hover:text-indigo-600 transition">Privacy Policy</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li>📧 support@ngoseva.org</li>
                <li>📞 +91 98765 43210</li>
                <li>📍 Mumbai, India</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-200 mt-8 pt-8 text-center text-sm text-slate-400">
            <p>© 2024 NGO Seva. All rights reserved. | Made with ❤️ for social impact</p>
            <p className="mt-1">Building a better tomorrow, together.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;