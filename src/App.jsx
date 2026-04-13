import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, MapPin, ChevronDown, Menu, Phone, Mail, User, Package, LogOut, ChevronRight, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, googleProvider } from './firebase';
import { signInWithPopup, signInWithPhoneNumber, RecaptchaVerifier } from "firebase/auth";

const apiBaseUrl = 'https://api.dayli.co.in';

// Mock Data (will be replaced by API calls)
const CATEGORIES = [
  { id: 1, name: 'Vegetables & Fruits', icon: '🥦', color: '#e8f5e9' },
  { id: 2, name: 'Dairy, Bread & Eggs', icon: '🥛', color: '#fff9c4' },
  { id: 3, name: 'Cold Drinks & Juices', icon: '🥤', color: '#e1f5fe' },
  { id: 4, name: 'Snacks & Munchies', icon: '🍿', color: '#fff3e0' },
  { id: 5, name: 'Breakfast & Instant Food', icon: '🥣', color: '#f3e5f5' },
  { id: 6, name: 'Sweet Tooth', icon: '🍰', color: '#fce4ec' },
];

const PRODUCTS = [
  { id: 101, name: 'Fresh Banana (Robusta)', weight: '1 kg', price: 60, image: 'https://images.unsplash.com/photo-1571771894821-ad99026.jpg?auto=format&fit=crop&q=80&w=200' },
  { id: 102, name: 'Amul Taaza Toned Milk', weight: '500 ml', price: 27, image: 'https://images.unsplash.com/photo-1550583724-12558142279d?auto=format&fit=crop&q=80&w=200' },
  { id: 103, name: 'Coca-Cola Zero Sugar', weight: '300 ml', price: 40, image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef.jpg?auto=format&fit=crop&q=80&w=200' },
  { id: 104, name: 'Lay\'s Classic Salted', weight: '50 g', price: 20, image: 'https://images.unsplash.com/photo-1566478989037-eec170784d.jpg?auto=format&fit=crop&q=80&w=200' },
];

const Navbar = ({ cartCount, onOpenCart, user, onLogout, onOpenAuth, onOpenProfile, searchQuery, onSearch, onHome }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <nav className="navbar" style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'white',
      padding: '0.5rem 0',
      borderBottom: '1px solid hsl(var(--border))',
      boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
        <div
          onClick={onHome}
          className="logo"
          style={{ 
            color: 'hsl(var(--primary))', 
            fontWeight: 800, 
            fontSize: '1.75rem', 
            letterSpacing: '-1px', 
            cursor: 'pointer',
            userSelect: 'none',
            WebkitUserSelect: 'none'
          }}
        >
          dayli
        </div>

        <div className="location hide-on-mobile" style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem', userSelect: 'none', cursor: 'pointer' }}>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            Delivery in 20-30 mins
            <ChevronDown size={14} />
          </div>
          <div style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <MapPin size={12} />
            Bahraich, Uttar Pradesh
          </div>
        </div>

        <div className="search-container" style={{ position: 'relative' }}>
          <div style={{
            background: 'hsl(var(--muted))',
            borderRadius: 'var(--radius)',
            padding: '0.6rem 1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <Search size={18} color="hsl(var(--muted-foreground))" />
            <input
              type="text"
              placeholder='Search "milk"'
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
              style={{ background: 'none', border: 'none', outline: 'none', width: '100%', fontSize: '0.9rem' }}
            />
          </div>
        </div>

        <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {user ? (
            <div style={{ position: 'relative' }}>
              <div
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}
              >
                Hi, {user.name ? (user.name.length > 15 ? 'User' : user.name.split(' ')[0]) : 'User'}
                <ChevronDown size={16} />
              </div>

              <AnimatePresence>
                {isDropdownOpen && (
                  <>
                    <div
                      onClick={() => setIsDropdownOpen(false)}
                      style={{ position: 'fixed', inset: 0, zIndex: 10 }}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        marginTop: '1rem',
                        background: 'white',
                        borderRadius: 'var(--radius)',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                        border: '1px solid #eee',
                        minWidth: '220px',
                        zIndex: 11,
                        padding: '0.5rem'
                      }}
                      className="profile-dropdown"
                    >
                      <button
                        onClick={() => { onOpenProfile('profile'); setIsDropdownOpen(false); }}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '0.5rem', transition: 'background 0.2s' }}
                        className="hover:bg-slate-50"
                      >
                        <User size={18} /> My Profile
                      </button>
                      <button
                        onClick={() => { onOpenProfile('orders'); setIsDropdownOpen(false); }}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '0.5rem', transition: 'background 0.2s' }}
                        className="hover:bg-slate-50"
                      >
                        <Package size={18} /> My Orders
                      </button>
                      <div style={{ height: '1px', background: '#eee', margin: '0.5rem' }} />
                      <button
                        onClick={() => { onLogout(); setIsDropdownOpen(false); }}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '0.5rem', color: '#ef4444', transition: 'background 0.2s' }}
                        className="hover:bg-red-50"
                      >
                        <LogOut size={18} /> Logout
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div onClick={onOpenAuth} style={{ fontWeight: 600, fontSize: '1rem', cursor: 'pointer' }}>Login</div>
          )}
          <button
            onClick={onOpenCart}
            className="btn btn-primary btn-cart"
            style={{ gap: '0.5rem', padding: '0.6rem 1rem' }}
          >
            <ShoppingCart size={18} />
            {cartCount > 0 ? (
              <>
                <span className="hide-on-mobile">{cartCount} Items</span>
                <span className="show-on-mobile">{cartCount}</span>
              </>
            ) : (
              <span>My Cart</span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
};

const ProfileModal = ({ isOpen, onClose, user, token, onUpdateUser, onTrackOrder, initialTab = 'profile' }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingName, setEditingName] = useState(user?.name || '');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (isOpen && activeTab === 'orders' && token) {
      fetchOrders();
    }
  }, [isOpen, activeTab, token]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiBaseUrl}/api/orders/my`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.status === 'success') {
        setOrders(data.data);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const response = await fetch(`${apiBaseUrl}/api/user`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: editingName })
      });
      const data = await response.json();
      if (data.status === 'success') {
        onUpdateUser(data.data.user);
        alert('Profile updated!');
      }
    } catch (err) {
      alert('Failed to update profile.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'black' }}
      />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '450px',
          height: '100%',
          background: 'white',
          boxShadow: '-10px 0 30px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Account</h2>
          <button onClick={onClose} style={{ fontSize: '1.5rem' }}>✕</button>
        </div>

        <div style={{ display: 'flex', borderBottom: '1px solid #eee' }}>
          <button
            onClick={() => setActiveTab('profile')}
            style={{ flex: 1, padding: '1rem', fontWeight: 700, fontSize: '0.9rem', color: activeTab === 'profile' ? 'hsl(var(--primary))' : '#888', borderBottom: activeTab === 'profile' ? '2px solid hsl(var(--primary))' : 'none' }}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            style={{ flex: 1, padding: '1rem', fontWeight: 700, fontSize: '0.9rem', color: activeTab === 'orders' ? 'hsl(var(--primary))' : '#888', borderBottom: activeTab === 'orders' ? '2px solid hsl(var(--primary))' : 'none' }}
          >
            My Orders
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          {activeTab === 'profile' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'hsl(var(--primary))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800 }}>
                  {user?.name?.[0]}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{user?.name}</div>
                  <div style={{ fontSize: '0.85rem', color: '#666' }}>{user?.email || user?.phone_number}</div>
                </div>
              </div>

              <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#666', display: 'block', marginBottom: '0.5rem' }}>Full Name</label>
                  <input
                    type="text"
                    value={editingName}
                    onChange={e => setEditingName(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid #ddd', outline: 'none' }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="btn btn-primary"
                  style={{ width: 'fit-content', padding: '0.75rem 2rem' }}
                >
                  {isUpdating ? 'Saving...' : 'Update Name'}
                </button>
              </form>

              <div style={{ borderTop: '1px solid #eee', paddingTop: '1.5rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#666', marginBottom: '1rem' }}>Account Details</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {user?.email && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <Mail size={18} color="#888" />
                      <span style={{ fontSize: '0.9rem' }}>{user.email}</span>
                    </div>
                  )}
                  {user?.phone_number && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <Phone size={18} color="#888" />
                      <span style={{ fontSize: '0.9rem' }}>{user.phone_number}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <User size={18} color="#888" />
                    <span style={{ fontSize: '0.9rem' }}>ID: {user?.firebase_uid || user?.id}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>Loading orders...</div>
              ) : orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#999' }}>
                  <Package size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                  <p>No orders yet</p>
                </div>
              ) : (
                orders.map(order => (
                  <div key={order.id} style={{ border: '1px solid #eee', borderRadius: '1rem', padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>Order #{order.order_number}</div>
                        <div style={{ fontSize: '0.75rem', color: '#888' }}>{new Date(order.created_at).toLocaleDateString()}</div>
                      </div>
                      <div style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '2rem',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        background: order.status === 'delivered' ? '#dcfce7' : order.status === 'pending' ? '#fef9c3' : '#f3f4f6',
                        color: order.status === 'delivered' ? '#166534' : order.status === 'pending' ? '#854d0e' : '#374151'
                      }}>
                        {order.status}
                      </div>
                    </div>
                    <div style={{ borderTop: '1px dashed #eee', margin: '0.75rem 0', paddingTop: '0.75rem' }}>
                      {order.items?.map((item, idx) => (
                        <div key={idx} style={{ fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                          <span>{item.quantity} x {item.product?.name || 'Item'}</span>
                          <span style={{ color: '#666' }}>₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                      <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>
                        <span style={{ color: '#666', fontWeight: 400, marginRight: '0.5rem' }}>Total Paid</span>
                        ₹{order.payable_amount || order.total_amount}
                      </div>
                      <button
                        onClick={() => onTrackOrder(order.order_number)}
                        style={{
                          background: 'hsl(var(--primary))',
                          color: 'white',
                          padding: '0.5rem 1rem',
                          borderRadius: '0.75rem',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          boxShadow: '0 2px 5px hsl(var(--primary) / 0.2)'
                        }}
                      >
                        Track Order
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

const AuthModal = ({ isOpen, onClose, onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [authMethod, setAuthMethod] = useState('email'); // 'email', 'phone'
  const [formData, setFormData] = useState({ name: '', email: '', password: '', password_confirmation: '', phone_number: '', otp: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verificationId, setVerificationId] = useState(null);

  if (!isOpen) return null;

  const setupRecaptcha = () => {
    if (window.recaptchaVerifier) return;
    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-admin', {
      'size': 'invisible',
      'callback': (response) => {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
      }
    });
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      await firebaseBackendLogin({
        uid: user.uid,
        email: user.email,
        name: user.displayName,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setupRecaptcha();
    const appVerifier = window.recaptchaVerifier;
    try {
      const confirmationResult = await signInWithPhoneNumber(auth, formData.phone_number, appVerifier);
      setVerificationId(confirmationResult);
      alert('OTP sent to ' + formData.phone_number);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await verificationId.confirm(formData.otp);
      const user = result.user;
      await firebaseBackendLogin({
        uid: user.uid,
        phone_number: user.phoneNumber,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const firebaseBackendLogin = async (payload) => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/firebase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (data.status === 'success') {
        onAuthSuccess(data.data.user, data.data.access_token);
        onClose();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Could not sync with backend.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const endpoint = isLogin ? '/api/login' : '/api/register';

    try {
      const response = await fetch(`${apiBaseUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();

      if (data.status === 'success') {
        onAuthSuccess(data.data.user, data.data.access_token);
        onClose();
      } else {
        setError(data.message || (data.errors ? Object.values(data.errors)[0][0] : 'Authentication failed'));
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div id="recaptcha-admin"></div>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} />
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{ position: 'relative', width: '100%', maxWidth: '400px', background: 'white', borderRadius: '1.5rem', padding: '2rem', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}
      >
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
        <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          {authMethod === 'email' ? (isLogin ? 'Log in to your account' : 'Join dayli today') : 'Quick login with Phone'}
        </p>

        {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '0.75rem', borderRadius: '0.75rem', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</div>}

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <button
            onClick={() => setAuthMethod('email')}
            style={{ flex: 1, padding: '0.5rem', borderRadius: '0.5rem', fontSize: '0.8rem', fontWeight: 600, background: authMethod === 'email' ? 'hsl(var(--primary))' : '#f0f0f0', color: authMethod === 'email' ? 'white' : 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <Mail size={16} /> Email
          </button>
          <button
            onClick={() => setAuthMethod('phone')}
            style={{ flex: 1, padding: '0.5rem', borderRadius: '0.5rem', fontSize: '0.8rem', fontWeight: 600, background: authMethod === 'phone' ? 'hsl(var(--primary))' : '#f0f0f0', color: authMethod === 'phone' ? 'white' : 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <Phone size={16} /> Phone
          </button>
        </div>

        {authMethod === 'email' ? (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {!isLogin && (
              <input
                type="text" placeholder="Full Name" required
                value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.75rem', border: '1px solid #ddd' }}
              />
            )}
            <input
              type="email" placeholder="Email Address" required
              value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
              style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.75rem', border: '1px solid #ddd' }}
            />
            <input
              type="password" placeholder="Password" required
              value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })}
              style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.75rem', border: '1px solid #ddd' }}
            />
            {!isLogin && (
              <input
                type="password" placeholder="Confirm Password" required
                value={formData.password_confirmation} onChange={e => setFormData({ ...formData, password_confirmation: e.target.value })}
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.75rem', border: '1px solid #ddd' }}
              />
            )}

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}>
              {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
            </button>
          </form>
        ) : (
          <form onSubmit={verificationId ? handleOtpVerify : handlePhoneSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {!verificationId ? (
              <div style={{ display: 'flex', borderRadius: '0.75rem', border: '1px solid #ddd', overflow: 'hidden' }}>
                <span style={{ background: '#f5f5f5', padding: '0.75rem 0.75rem', fontWeight: 700, fontSize: '0.9rem', borderRight: '1px solid #ddd', color: '#444' }}>🇮🇳 +91</span>
                <input
                  type="tel" placeholder="XXXXXXXXXX" required
                  value={formData.phone_number.replace(/^\+91/, '')}
                  onChange={e => {
                    const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setFormData({ ...formData, phone_number: '+91' + digits });
                  }}
                  style={{ flex: 1, padding: '0.75rem', border: 'none', outline: 'none', fontSize: '1rem' }}
                />
              </div>
            ) : (
              <input
                type="text" placeholder="6-digit OTP" required
                value={formData.otp} onChange={e => setFormData({ ...formData, otp: e.target.value })}
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.75rem', border: '1px solid #ddd' }}
              />
            )}
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}>
              {loading ? 'Processing...' : (verificationId ? 'Verify OTP' : 'Send OTP')}
            </button>
          </form>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.5rem 0' }}>
          <div style={{ flex: 1, height: '1px', background: '#eee' }}></div>
          <span style={{ fontSize: '0.8rem', color: '#999' }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: '#eee' }}></div>
        </div>

        <button
          onClick={handleGoogleLogin}
          style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid #ddd', background: 'white', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/smartlock/google.svg" width="20" alt="Google" />
          Continue with Google
        </button>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'hsl(var(--muted-foreground))' }}>
          {authMethod === 'email' ? (isLogin ? "Don't have an account?" : "Already have an account?") : "Try another method?"}{' '}
          <span onClick={() => { setIsLogin(!isLogin); setAuthMethod('email'); }} style={{ color: 'hsl(var(--primary))', fontWeight: 700, cursor: 'pointer' }}>
            {authMethod === 'email' ? (isLogin ? 'Sign Up' : 'Login') : 'Cancel'}
          </span>
        </p>
      </motion.div>
    </div>
  );
};

const CATEGORY_MAPPER = {
  'Vegetables & Fruits': '🥦',
  'Spares and tools': '🔧',
  'Spares and Tools': '🔧',
  'Wellness and Hygiene': '🧼',
  'Wellness and hygiene': '🧼',
  'Electricals and lighting': '💡',
  'Electricals and Lighting': '💡',
  'Dairy, Bread & Eggs': '🥛',
  'Cold Drinks & Juices': '🥤',
  'Snacks & Munchies': '🍿',
  'Meat': '🥩',
  'Breakfast & Instant Food': '🥣',
  'Sweet Tooth': '🍰',
  'Cleaning Essentials': '🧹',
  'Baby Care': '👶',
  'Pooja Needs': '🙏',
  'Home & Office': '🏢'
};

const CategoryItem = ({ id, name, icon, color, isActive, onClick }) => {
  const [imgError, setImgError] = useState(false);
  const emojiFallback = CATEGORY_MAPPER[name] || '📦';
  const isEmoji = !icon || icon.length <= 2 || !icon.includes('.');
  const iconUrl = isEmoji ? null : (icon.startsWith('http') ? icon : `https://api.dayli.co.in/storage/${icon}`);

  return (
    <div
      onClick={() => onClick(id)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.5rem',
        cursor: 'pointer',
        flexShrink: 0,
        userSelect: 'none',
        WebkitUserSelect: 'none'
      }}>
      <div style={{
        width: '80px',
        height: '80px',
        background: color,
        borderRadius: '1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '2rem',
        transition: 'transform 0.2s',
        border: isActive ? '3px solid hsl(var(--primary))' : 'none',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }} className="category-icon">
        {isEmoji || imgError ? (
          <span>{icon && icon.length <= 2 ? icon : emojiFallback}</span>
        ) : (
          <img 
            src={iconUrl} 
            alt={name} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            onError={() => setImgError(true)}
          />
        )}
      </div>
      <div style={{ fontSize: '0.75rem', fontWeight: isActive ? 800 : 600, textAlign: 'center', maxWidth: '80px', color: isActive ? 'hsl(var(--primary))' : 'inherit' }}>
        {name}
      </div>
    </div>
  );
};

const FastCategoryItem = ({ id, name, icon, isActive, onClick }) => {
  const [imgError, setImgError] = useState(false);
  const emojiFallback = CATEGORY_MAPPER[name] || '📦';
  const isEmoji = !icon || icon.length <= 2 || !icon.includes('.');
  const iconUrl = isEmoji ? null : (icon.startsWith('http') ? icon : `https://api.dayli.co.in/storage/${icon}`);

  return (
    <div
      onClick={() => onClick(id)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.75rem',
        cursor: 'pointer',
        flexShrink: 0,
        userSelect: 'none',
        WebkitUserSelect: 'none'
      }}>
      <div
        className="category-circle"
        style={{
          width: '90px',
          height: '90px',
          background: 'white',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2.5rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: isActive ? '3px solid hsl(var(--primary))' : 'none',
          boxSizing: 'border-box',
          overflow: 'hidden',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
        {isEmoji || imgError ? (
          <span>{icon && icon.length <= 2 ? icon : emojiFallback}</span>
        ) : iconUrl ? (
          <img 
            src={iconUrl} 
            alt={name} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            onError={() => setImgError(true)}
          />
        ) : (
          <span>{emojiFallback}</span>
        )}
      </div>
      <div
        className="category-text"
        style={{
          fontSize: '0.7rem',
          fontWeight: 800,
          textAlign: 'center',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: isActive ? 'hsl(var(--primary))' : '#1a1a1a'
        }}>
        {name}
      </div>
    </div>
  );
};

const ProductCard = ({ product, quantity, onAdd, onUpdate }) => (
  <motion.div
    whileHover={{ y: -4 }}
    className="product-card"
    style={{
      background: 'white',
      border: '1px solid hsl(var(--border))',
      borderRadius: 'var(--radius)',
      padding: '0.75rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem'
    }}
  >
    <div className="product-image-container" style={{ height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <img src={product.image} alt={product.name} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
    </div>
    <div style={{ fontSize: '0.7rem', color: 'hsl(var(--muted-foreground))', fontWeight: 500 }}>
      {product.weight}
    </div>
    <div style={{ fontWeight: 700, fontSize: '0.9rem', minHeight: '2.4rem', lineHeight: '1.2' }}>
      {product.name}
    </div>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
      <div style={{ fontWeight: 700 }}>₹{product.price}</div>
      {quantity > 0 ? (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: 'hsl(var(--primary))',
          color: 'white',
          borderRadius: '0.5rem',
          overflow: 'hidden'
        }}>
          <button
            onClick={() => onUpdate(product.id, -1)}
            style={{ padding: '0.4rem 0.6rem', color: 'white', fontWeight: 800 }}
          >-</button>
          <span style={{ minWidth: '1.5rem', textAlign: 'center', fontWeight: 700, fontSize: '0.85rem' }}>{quantity}</span>
          <button
            onClick={() => onUpdate(product.id, 1)}
            style={{ padding: '0.4rem 0.6rem', color: 'white', fontWeight: 800 }}
          >+</button>
        </div>
      ) : (
        <button
          onClick={() => onAdd(product)}
          style={{
            color: 'hsl(var(--primary))',
            border: '1px solid hsl(var(--primary))',
            padding: '0.4rem 1.25rem',
            borderRadius: '0.5rem',
            fontWeight: 700,
            fontSize: '0.8rem',
            textTransform: 'uppercase'
          }}
          className="add-btn"
        >
          Add
        </button>
      )}
    </div>
  </motion.div>
);

const CartDrawer = ({ isOpen, onClose, cartItems, onUpdateQuantity, onCheckout, isCheckingOut }) => {
  const [address, setAddress] = React.useState('Bahraich, Uttar Pradesh');

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, background: 'black', zIndex: 100 }}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '400px',
              background: 'white',
              zIndex: 101,
              boxShadow: '-10px 0 30px rgba(0,0,0,0.1)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.25rem' }}>My Cart</h2>
              <button onClick={onClose} style={{ fontSize: '1.5rem' }}>✕</button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
              {cartItems.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ 
                    textAlign: 'center', 
                    marginTop: '6rem', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    padding: '0 2rem'
                  }}
                >
                  <div style={{ 
                    width: '120px', 
                    height: '120px', 
                    background: 'hsl(var(--primary) / 0.08)', 
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '2rem'
                  }}>
                    <ShoppingBag size={56} style={{ color: 'hsl(var(--primary))' }} />
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Your cart is empty</h3>
                  <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.85rem', marginBottom: '2rem', lineHeight: 1.5 }}>
                    Your cart is feeling a bit light... let's fix that with some fresh groceries!
                  </p>
                  <button 
                    onClick={onClose}
                    style={{ 
                      background: 'hsl(var(--primary))', 
                      color: 'white', 
                      padding: '0.8rem 2rem', 
                      borderRadius: '2rem',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      boxShadow: '0 4px 15px hsl(var(--primary) / 0.3)',
                      transition: 'transform 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                  >
                    Start Shopping
                  </button>
                </motion.div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ background: 'hsl(var(--muted))', padding: '1rem', borderRadius: 'var(--radius)', marginBottom: '1rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Delivery Address</label>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      style={{ width: '100%', background: 'none', border: 'none', fontSize: '0.9rem', outline: 'none', resize: 'none' }}
                      rows={2}
                    />
                  </div>

                  {cartItems.map(item => (
                    <div key={item.id} style={{ display: 'flex', gap: '1rem' }}>
                      <img src={item.image} alt={item.name} style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))' }}>{item.weight}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                          <div style={{ fontWeight: 700 }}>₹{item.price * item.quantity}</div>
                          <div style={{ display: 'flex', alignItems: 'center', background: 'hsl(var(--primary))', color: 'white', borderRadius: '0.25rem', overflow: 'hidden' }}>
                            <button onClick={() => onUpdateQuantity(item.id, -1)} style={{ padding: '0.2rem 0.5rem', color: 'white' }}>-</button>
                            <span style={{ padding: '0 0.5rem', fontSize: '0.85rem', fontWeight: 700 }}>{item.quantity}</span>
                            <button onClick={() => onUpdateQuantity(item.id, 1)} style={{ padding: '0.2rem 0.5rem', color: 'white' }}>+</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cartItems.length > 0 && (() => {
              const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
              const deliveryFee = subtotal < 100 ? 20 : 0;
              const total = subtotal + deliveryFee;

              return (
                <div style={{ padding: '1.5rem', borderTop: '1px solid #eee', background: 'white' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#666' }}>
                      <span>Subtotal</span>
                      <span>₹{subtotal}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#666' }}>
                      <span>Delivery Fee</span>
                      <span>{deliveryFee === 0 ? <span style={{ color: '#22c55e', fontWeight: 700 }}>FREE</span> : `₹${deliveryFee}`}</span>
                    </div>

                    {deliveryFee > 0 && (
                      <div style={{ background: 'hsl(var(--primary) / 0.05)', padding: '0.75rem', borderRadius: '0.75rem', fontSize: '0.8rem', color: 'hsl(var(--primary))', fontWeight: 600, marginTop: '0.5rem' }}>
                        💡 Add ₹{100 - subtotal} more for FREE delivery!
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #eee', fontWeight: 800, fontSize: '1.1rem' }}>
                      <span>Grand Total</span>
                      <span>₹{total}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', flexDirection: 'column' }}>
                    <button
                      disabled={isCheckingOut}
                      onClick={() => onCheckout(address, 'razorpay')}
                      className="btn btn-primary"
                      style={{ width: '100%', padding: '1rem', opacity: isCheckingOut ? 0.7 : 1 }}
                    >
                      {isCheckingOut ? 'Processing...' : '💳 Pay Online (UPI / Card)'}
                    </button>
                    <button
                      disabled={isCheckingOut}
                      onClick={() => onCheckout(address, 'cod')}
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '0.75rem', fontWeight: 600, fontSize: '0.9rem', background: 'white' }}
                    >
                      🏠 Cash on Delivery
                    </button>
                  </div>
                </div>
              );
            })()}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const OrderStatus = ({ orderNumber, onBack }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [orderNumber]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/orders/track/${orderNumber}`);
      const data = await response.json();
      if (data.status === 'success') {
        setOrder(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Failed to fetch order status.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusStep = (status) => {
    const s = status?.toLowerCase() || '';
    if (['received', 'accepted', 'pending'].includes(s)) return 0;
    if (['preparing', 'delayed', 'processing', 'vendor_confirmation'].includes(s)) return 1;
    if (['in_transit', 'delivered_otp', 'rider_assigned', 'at_pick_up', 'at_pickup', 'shipped'].includes(s)) return 2;
    if (['delivered'].includes(s)) return 3;
    return 0;
  };

  if (loading) return (
    <div style={{ padding: '4rem', textAlign: 'center' }}>
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} style={{ display: 'inline-block' }}>
        <Package size={40} color="hsl(var(--primary))" />
      </motion.div>
      <p style={{ marginTop: '1rem', fontWeight: 600 }}>Locating your order...</p>
    </div>
  );

  if (error) return (
    <div style={{ padding: '4rem', textAlign: 'center' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>😕</div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Order Not Found</h2>
      <p style={{ color: '#666', marginBottom: '2rem' }}>We couldn't find an order with number <strong>{orderNumber}</strong></p>
      <button onClick={onBack} className="btn btn-primary">Go Back Home</button>
    </div>
  );

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, marginBottom: '2rem', color: '#666' }}>
        <ChevronRight size={18} style={{ transform: 'rotate(180deg)' }} /> Back to Shopping
      </button>

      <div style={{ background: 'white', borderRadius: '1.5rem', padding: '2rem', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', border: '1px solid #eee' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.25rem' }}>Track Order</h1>
            <p style={{ fontSize: '0.9rem', color: '#888' }}>Order #{order.order_number}</p>
          </div>
          <div style={{ background: 'hsl(var(--primary) / 0.1)', color: 'hsl(var(--primary))', padding: '0.5rem 1rem', borderRadius: '2rem', fontWeight: 700, fontSize: '0.85rem', textTransform: 'capitalize' }}>
            {order.order_status}
          </div>
        </div>

        {/* Timeline */}
        <div style={{ position: 'relative', paddingLeft: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {/* Vertical Line */}
          <div style={{ position: 'absolute', left: '0.625rem', top: '1rem', bottom: '1rem', width: '2px', background: '#f1f5f9' }} />

          {[
            { id: 'pending', label: 'Order Placed', desc: 'We have received your order' },
            { id: 'processing', label: 'Processing', desc: 'Your items are being packed' },
            { id: 'shipped', label: 'Out for Delivery', desc: 'Our partner is on the way' },
            { id: 'delivered', label: 'Delivered', desc: 'Enjoy your fresh daily essentials!' }
          ].map((step, idx) => {
            const isCompleted = getStatusStep(order.order_status?.toLowerCase() || '') >= idx;
            const isCurrent = getStatusStep(order.order_status?.toLowerCase() || '') === idx;

            return (
              <div key={step.id} style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: '-2.5rem',
                  width: '1.25rem',
                  height: '1.25rem',
                  borderRadius: '50%',
                  background: isCompleted ? 'hsl(var(--primary))' : 'white',
                  border: `3px solid ${isCompleted ? 'hsl(var(--primary))' : '#e2e8f0'}`,
                  zIndex: 2,
                  transition: 'all 0.3s'
                }}>
                  {isCompleted && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                      <svg width="8" height="6" viewBox="0 0 8 6" fill="none"><path d="M1 3L3 5L7 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </motion.div>
                  )}
                </div>
                <div style={{ opacity: isCompleted ? 1 : 0.4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h3 style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '0.25rem', color: isCurrent ? 'hsl(var(--primary))' : 'inherit' }}>{step.label}</h3>
                    {isCurrent && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.65rem', fontWeight: 800, color: '#4caf50', background: '#e8f5e9', padding: '0.2rem 0.6rem', borderRadius: '1rem', textTransform: 'uppercase' }}>
                        <span style={{ width: '6px', height: '6px', background: '#4caf50', borderRadius: '50%', display: 'inline-block', animation: 'pulse 2s infinite' }}></span>
                        Live
                      </div>
                    )}
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#64748b' }}>{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {order.delivery_person && (
          <div style={{ marginTop: '3rem', padding: '1.25rem', background: '#f8fafc', borderRadius: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid #f1f5f9' }}>
            <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'white', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={24} color="hsl(var(--primary))" />
            </div>
            <div>
              <p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1px' }}>Delivery Partner</p>
              <p style={{ fontWeight: 800, fontSize: '1.1rem' }}>{order.delivery_person.name}</p>
            </div>
            {order.delivery_person.phone && (
              <a href={`tel:${order.delivery_person.phone}`} style={{ marginLeft: 'auto', background: 'white', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0', color: 'hsl(var(--primary))', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                <Phone size={18} />
              </a>
            )}
          </div>
        )}

        <div style={{ marginTop: '3rem', borderTop: '1px solid #f1f5f9', paddingTop: '2rem' }}>
          <h3 style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '1.25rem' }}>Order Summary</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {order.items.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '0.9rem', color: '#4b5563' }}>
                  <span style={{ fontWeight: 800, color: 'black' }}>{item.quantity}x</span> {item.product.name}
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>₹{item.total_price}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px dashed #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#666' }}>
              <span>Subtotal</span>
              <span>₹{order.total_amount}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#666' }}>
              <span>Delivery Fee</span>
              <span>{order.delivery_charge === 0 ? <span style={{ color: '#22c55e', fontWeight: 700 }}>FREE</span> : `₹${order.delivery_charge}`}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #eee' }}>
              <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>Total Amount</span>
              <span style={{ fontWeight: 900, fontSize: '1.3rem', color: 'hsl(var(--primary))' }}>₹{order.payable_amount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('dayli_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('dayli_categories');
    return saved ? JSON.parse(saved) : [];
  });
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('dayli_products');
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(!categories.length);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('dayli_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileModalTab, setProfileModalTab] = useState('profile');
  const [token, setToken] = useState(() => localStorage.getItem('dayli_token'));
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [isCategoryLoading, setIsCategoryLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [trackingOrderNumber, setTrackingOrderNumber] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('orderNumber');
  });

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      setTrackingOrderNumber(params.get('orderNumber'));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleAuthSuccess = (userData, accessToken) => {
    setUser(userData);
    setToken(accessToken);
    localStorage.setItem('dayli_user', JSON.stringify(userData));
    localStorage.setItem('dayli_token', accessToken);
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('dayli_user');
    localStorage.removeItem('dayli_token');
  };

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!searchQuery.trim()) {
        setSearchResults(null);
        return;
      }
      setIsSearching(true);
      try {
        const response = await fetch(`${apiBaseUrl}/api/products?search=${encodeURIComponent(searchQuery)}`);
        const data = await response.json();
        if (data.status === 'success') {
          setSearchResults(data.data.data);
        }
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(fetchSearchResults, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch(`${apiBaseUrl}/api/products?featured=1`),
          fetch(`${apiBaseUrl}/api/categories`)
        ]);
        const prodData = await prodRes.json();
        const catData = await catRes.json();

        if (catData.status === 'success') {
          setCategories(catData.data);
          localStorage.setItem('dayli_categories', JSON.stringify(catData.data));
        }
        if (prodData.status === 'success') {
          setProducts(prodData.data.data);
          localStorage.setItem('dayli_products', JSON.stringify(prodData.data.data));
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Fetch products for selected category from server
  useEffect(() => {
    if (!selectedCategoryId) {
      setCategoryProducts([]);
      return;
    }
    const fetchCategoryProducts = async () => {
      setIsCategoryLoading(true);
      try {
        const res = await fetch(`${apiBaseUrl}/api/products?category_id=${selectedCategoryId}&limit=50`);
        const data = await res.json();
        if (data.status === 'success') setCategoryProducts(data.data.data);
      } catch (err) {
        console.error('Category fetch failed:', err);
      } finally {
        setIsCategoryLoading(false);
      }
    };
    fetchCategoryProducts();
  }, [selectedCategoryId]);

  useEffect(() => {
    localStorage.setItem('dayli_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id, delta) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const handleCheckout = async (address, paymentMethod = 'razorpay') => {
    setIsCheckingOut(true);
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      // Step 1: Create order in DB
      const response = await fetch(`${apiBaseUrl}/api/orders`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          items: cartItems.map(item => ({ product_id: item.id, quantity: item.quantity })),
          delivery_address: address,
          payment_method: paymentMethod
        })
      });
      const data = await response.json();
      
      if (response.status === 401) {
        setToken(null);
        setUser(null);
        localStorage.removeItem('dayli_token');
        localStorage.removeItem('dayli_user');
        alert("Your session has expired. Please login again.");
        setIsCheckingOut(false);
        return;
      }

      if (data.status !== 'success') {
        alert('Failed to create order: ' + (data.message || "Order creation failed"));
        setIsCheckingOut(false);
        return;
      }

      const orderId = data.data.id;
      const orderNumber = data.data.order_number;

      // Step 2: If COD, we're done
      if (paymentMethod === 'cod') {
        setOrderSuccess({ id: orderId, order_number: orderNumber });
        setCartItems([]);
        localStorage.removeItem('dayli_cart');
        setIsCartOpen(false);
        setIsCheckingOut(false);
        return;
      }

      // Step 3: Create Razorpay order
      const rzpRes = await fetch(`${apiBaseUrl}/api/payment/razorpay/create`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ order_id: orderId })
      });
      const rzpData = await rzpRes.json();

      if (!rzpData.razorpay_order_id) {
        alert('Could not initiate payment. Please try again.');
        setIsCheckingOut(false);
        return;
      }

      // Step 4: Open Razorpay Checkout popup
      const options = {
        key: rzpData.key_id,
        amount: rzpData.amount,
        currency: rzpData.currency,
        name: 'Dayli Delivery',
        description: 'Order #' + rzpData.order_number,
        order_id: rzpData.razorpay_order_id,
        handler: async (paymentResponse) => {
          // Step 5: Verify payment on backend
          try {
            const verifyRes = await fetch(`${apiBaseUrl}/api/payment/razorpay/verify`, {
              method: 'POST',
              headers,
              body: JSON.stringify({
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_signature: paymentResponse.razorpay_signature,
              })
            });
            const verifyData = await verifyRes.json();
            if (verifyRes.ok) {
              setOrderSuccess({ id: orderId, order_number: orderNumber });
              setCartItems([]);
              localStorage.removeItem('dayli_cart');
              setIsCartOpen(false);
            } else {
              alert('Payment verification failed: ' + verifyData.message);
            }
          } catch {
            alert('Error verifying payment. Please contact support with Order #' + orderNumber);
          } finally {
            setIsCheckingOut(false);
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone_number || '',
        },
        theme: { color: '#7c3aed' },
        modal: {
          ondismiss: () => {
            alert('Payment cancelled. Your order (#' + orderNumber + ') was saved. You can complete payment later.');
            setIsCheckingOut(false);
          }
        }
      };

      if (!window.Razorpay) {
        alert('Razorpay is not loaded. Please check your internet connection.');
        return;
      }
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      alert('Error placing order. Please try again.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="app">
      <Navbar
        cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        user={user}
        onLogout={handleLogout}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenProfile={(tab) => {
          setProfileModalTab(tab);
          setIsProfileModalOpen(true);
        }}
        searchQuery={searchQuery}
        onSearch={setSearchQuery}
        onHome={() => {
          setTrackingOrderNumber(null);
          setOrderSuccess(null);
          setSearchQuery('');
          setSelectedCategoryId(null);
          window.history.pushState({}, '', window.location.pathname);
        }}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={user}
        token={token}
        onUpdateUser={(updatedUser) => {
          setUser(updatedUser);
          localStorage.setItem('dayli_user', JSON.stringify(updatedUser));
        }}
        onTrackOrder={(orderNumber) => {
          setTrackingOrderNumber(orderNumber);
          setIsProfileModalOpen(false);
          window.history.pushState({}, '', `?orderNumber=${orderNumber}`);
        }}
        initialTab={profileModalTab}
      />

      <main className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        {trackingOrderNumber ? (
          <OrderStatus
            orderNumber={trackingOrderNumber}
            onBack={() => {
              setTrackingOrderNumber(null);
              window.history.pushState({}, '', window.location.pathname);
            }}
          />
        ) : orderSuccess ? (
          <div style={{ maxWidth: '500px', margin: '4rem auto', textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '2rem', boxShadow: '0 20px 50px rgba(0,0,0,0.05)', border: '1px solid #eee' }}>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#f0fdf4', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', fontSize: '2.5rem' }}>
              ✓
            </motion.div>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '1rem' }}>Order Placed!</h1>
            <p style={{ color: '#666', marginBottom: '2rem', lineHeight: '1.6' }}>
              Your order <strong>#{orderSuccess.order_number}</strong> has been successfully placed and is being prepared.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <button
                onClick={() => {
                  setTrackingOrderNumber(orderSuccess.order_number);
                  window.history.pushState({}, '', `?orderNumber=${orderSuccess.order_number}`);
                }}
                className="btn btn-primary"
                style={{ width: '100%', padding: '1rem' }}
              >
                Track Real-Time Status
              </button>
              <button
                onClick={() => setOrderSuccess(null)}
                style={{ width: '100%', padding: '1rem', fontWeight: 700, color: '#666' }}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        ) : searchResults !== null ? (
          /* Search Results ... Same as before */
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem' }}>Search Results for "{searchQuery}"</h2>
              <button
                onClick={() => setSearchQuery('')}
                style={{ color: 'hsl(var(--primary))', fontWeight: 600, fontSize: '0.9rem' }}
              >
                Clear Search
              </button>
            </div>
            {isSearching ? (
              <div style={{ textAlign: 'center', padding: '4rem' }}>Searching...</div>
            ) : searchResults.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem', color: '#666' }}>
                <Search size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                <p>No products found for "{searchQuery}"</p>
              </div>
            ) : (
              <div className="grid">
                {searchResults.map(product => (
                  <ProductCard
                    key={product.id}
                    product={{
                      ...product,
                      price: product.selling_price,
                      image: (() => {
                        if (!product.primary_image || !product.primary_image.image_path) return 'https://placehold.co/200';
                        const path = product.primary_image.image_path;
                        const isExternal = /^https?:\/\//.test(path);
                        return isExternal ? path : `https://api.dayli.co.in/storage/${path}`;
                      })()
                    }}
                    quantity={cartItems.find(item => item.id === product.id)?.quantity || 0}
                    onAdd={addToCart}
                    onUpdate={updateQuantity}
                  />
                ))}
              </div>
            )}
          </section>
        ) : (
          <>
            {/* Fast Categories Section */}
            <section style={{ marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem', fontWeight: 800, userSelect: 'none', WebkitUserSelect: 'none', cursor: 'default' }}>Shop by Category</h2>
              <div style={{
                display: 'flex',
                gap: '1.5rem',
                overflowX: 'auto',
                padding: '0.5rem 1rem 1.5rem',
                margin: '0 -1rem',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch'
              }}>
                {loading ? (
                  [1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} style={{ minWidth: '90px', height: '90px', borderRadius: '50%', background: '#f5f5f5' }}></div>
                  ))
                ) : categories.map(cat => (
                  <FastCategoryItem
                    key={cat.id}
                    id={cat.id}
                    name={cat.name}
                    icon={cat.icon}
                    isActive={selectedCategoryId === cat.id}
                    onClick={(id) => setSelectedCategoryId(prev => prev === id ? null : id)}
                  />
                ))}
              </div>
            </section>

            {/* Featured Products Section */}
            <section>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem' }}>
                  {selectedCategoryId ? categories.find(c => c.id === selectedCategoryId)?.name : 'Daily Essentials'}
                </h2>
                {!selectedCategoryId && <a href="#" style={{ color: 'hsl(var(--primary))', fontWeight: 600, fontSize: '0.9rem' }}>View All</a>}
              </div>
              <div className="grid">
                {loading || isCategoryLoading ? (
                  [1, 2, 3, 4].map(i => (
                    <div key={i} style={{ height: '250px', background: '#f5f5f5', borderRadius: 'var(--radius)' }}></div>
                  ))
                ) : (() => {
                  const displayProducts = selectedCategoryId ? categoryProducts : products;
                  if (selectedCategoryId && displayProducts.length === 0) {
                    return (
                      <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', color: '#999' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛒</div>
                        <p>No products in this category yet. Check back soon!</p>
                      </div>
                    );
                  }
                  return displayProducts.map(product => (
                    <ProductCard
                      key={product.id}
                      product={{
                        ...product,
                        price: product.selling_price,
                        image: (() => {
                          if (!product.primary_image || !product.primary_image.image_path) return 'https://placehold.co/200';
                          const path = product.primary_image.image_path;
                          const isExternal = /^https?:\/\//.test(path);
                          return isExternal ? path : `https://api.dayli.co.in/storage/${path}`;
                        })()
                      }}
                      quantity={cartItems.find(item => item.id === product.id)?.quantity || 0}
                      onAdd={addToCart}
                      onUpdate={updateQuantity}
                    />
                  ))
                })()}
              </div>
            </section>
          </>
        )}
      </main>

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={updateQuantity}
        onCheckout={handleCheckout}
        isCheckingOut={isCheckingOut}
      />

      <footer style={{ borderTop: '1px solid #eee', padding: '4rem 0', background: '#f8f9fa' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem' }}>
          <div>
            <div style={{ color: 'hsl(var(--primary))', fontWeight: 800, fontSize: '1.5rem', marginBottom: '1rem' }}>dayli</div>
            <p style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))', lineHeight: '1.5' }}>
              Bahraich's own quick commerce platform. Fresh groceries delivered to your doorstep in 20-30 minutes.
            </p>
          </div>
        </div>
      </footer>

      <style>{`
        .category-icon:hover { transform: scale(1.05); }
        .add-btn:hover { background: hsl(var(--primary) / 0.1); }
      `}</style>
    </div>
  );
}

export default App;
