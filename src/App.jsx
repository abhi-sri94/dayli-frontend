import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, MapPin, ChevronDown, Menu, Phone, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, googleProvider } from './firebase';
import { signInWithPopup, signInWithPhoneNumber, RecaptchaVerifier } from "firebase/auth";

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

const Navbar = ({ cartCount, onOpenCart, user, onLogout, onOpenAuth }) => (
  <nav className="navbar" style={{
    position: 'sticky',
    top: 0,
    zIndex: 50,
    background: 'white',
    padding: '0.75rem 0',
    borderBottom: '1px solid hsl(var(--border))',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
  }}>
    <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
      <div className="logo" style={{ color: 'hsl(var(--primary))', fontWeight: 800, fontSize: '1.75rem', letterSpacing: '-1px' }}>
        dayli
      </div>

      <div className="location" style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
        <div style={{ fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          Delivery in 20-30 mins
          <ChevronDown size={14} />
        </div>
        <div style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <MapPin size={12} />
          Bahraich, Uttar Pradesh
        </div>
      </div>

      <div className="search-bar" style={{ flex: 1, position: 'relative' }}>
        <div style={{
          background: 'hsl(var(--muted))',
          borderRadius: 'var(--radius)',
          padding: '0.75rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <Search size={20} color="hsl(var(--muted-foreground))" />
          <input
            type="text"
            placeholder='Search "milk"'
            style={{ background: 'none', border: 'none', outline: 'none', width: '100%', fontSize: '0.9rem' }}
          />
        </div>
      </div>

      <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Hi, {user.name.split(' ')[0]}</span>
            <button onClick={onLogout} style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))', fontWeight: 500 }}>Logout</button>
          </div>
        ) : (
          <div onClick={onOpenAuth} style={{ fontWeight: 600, fontSize: '1rem', cursor: 'pointer' }}>Login</div>
        )}
        <button
          onClick={onOpenCart}
          className="btn btn-primary"
          style={{ gap: '0.75rem', padding: '0.75rem 1.25rem' }}
        >
          <ShoppingCart size={20} />
          {cartCount > 0 ? (
            <span>{cartCount} Items</span>
          ) : (
            <span>My Cart</span>
          )}
        </button>
      </div>
    </div>
  </nav>
);

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
    const apiBaseUrl = window.location.hostname === 'localhost' ? '' : 'https://api.dayli.co.in';
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
    const apiBaseUrl = window.location.hostname === 'localhost' ? '' : 'https://api.dayli.co.in';

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
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.75rem', border: '1px solid #ddd' }}
                    />
                )}
                <input 
                    type="email" placeholder="Email Address" required 
                    value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.75rem', border: '1px solid #ddd' }}
                />
                <input 
                    type="password" placeholder="Password" required 
                    value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.75rem', border: '1px solid #ddd' }}
                />
                {!isLogin && (
                    <input 
                    type="password" placeholder="Confirm Password" required 
                    value={formData.password_confirmation} onChange={e => setFormData({...formData, password_confirmation: e.target.value})}
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
                    <input 
                        type="tel" placeholder="+91 9876543210" required 
                        value={formData.phone_number} onChange={e => setFormData({...formData, phone_number: e.target.value})}
                        style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.75rem', border: '1px solid #ddd' }}
                    />
                ) : (
                    <input 
                        type="text" placeholder="6-digit OTP" required 
                        value={formData.otp} onChange={e => setFormData({...formData, otp: e.target.value})}
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

const CategoryItem = ({ name, icon, color }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer'
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
      transition: 'transform 0.2s'
    }} className="category-icon">
      {icon}
    </div>
    <div style={{ fontSize: '0.75rem', fontWeight: 600, textAlign: 'center', maxWidth: '80px' }}>
      {name}
    </div>
  </div>
);

const ProductCard = ({ product, quantity, onAdd, onUpdate }) => (
  <motion.div
    whileHover={{ y: -4 }}
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
    <div style={{ height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                <div style={{ textAlign: 'center', marginTop: '4rem', color: 'hsl(var(--muted-foreground))' }}>
                  <ShoppingCart size={64} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                  <p>Your cart is empty</p>
                </div>
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

            {cartItems.length > 0 && (
              <div style={{ padding: '1.5rem', borderTop: '1px solid #eee', background: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontWeight: 600 }}>
                  <span>Grand Total</span>
                  <span>₹{cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0)}</span>
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
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

function App() {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('dayli_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('dayli_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('dayli_token'));
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

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
    const fetchData = async () => {
      setLoading(true);
      try {
        const apiBaseUrl = window.location.hostname === 'localhost' ? '' : 'https://api.dayli.co.in';
        const [prodRes, catRes] = await Promise.all([
          fetch(`${apiBaseUrl}/api/products?featured=1`),
          fetch(`${apiBaseUrl}/api/categories`)
        ]);
        const prodData = await prodRes.json();
        const catData = await catRes.json();

        if (catData.status === 'success') setCategories(catData.data);
        if (prodData.status === 'success') setProducts(prodData.data.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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
      const apiBaseUrl = window.location.hostname === 'localhost' ? '' : 'https://api.dayli.co.in';
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

      if (data.status !== 'success') {
        alert('Failed to create order: ' + data.message);
        return;
      }

      const orderId = data.data.id;
      const orderNumber = data.data.order_number;

      // Step 2: If COD, we're done
      if (paymentMethod === 'cod') {
        alert('Order placed! Order #' + orderNumber);
        setCartItems([]);
        localStorage.removeItem('dayli_cart');
        setIsCartOpen(false);
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
        return;
      }

      // Step 4: Open Razorpay Checkout popup
      const options = {
        key: rzpData.key_id,
        amount: rzpData.amount,
        currency: rzpData.currency,
        name: 'Dayli',
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
              alert('✅ Payment successful! Your Order #' + orderNumber + ' is confirmed.');
              setCartItems([]);
              localStorage.removeItem('dayli_cart');
              setIsCartOpen(false);
            } else {
              alert('Payment verification failed: ' + verifyData.message);
            }
          } catch {
            alert('Error verifying payment. Please contact support with Order #' + orderNumber);
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
      />

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onAuthSuccess={handleAuthSuccess} 
      />

      <main className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        {/* Categories Section */}
        <section style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem' }}>Shop by Category</h2>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
            gap: '2rem 1rem'
          }}>
            {loading ? (
              [1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} style={{ width: '80px', height: '100px', background: '#f5f5f5', borderRadius: 'var(--radius)' }}></div>
              ))
            ) : categories.map(cat => (
              <CategoryItem key={cat.id} name={cat.name} icon={cat.icon || '📦'} color={cat.color || '#f0f0f0'} />
            ))}
          </div>
        </section>

        {/* Featured Products Section */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem' }}>Daily Essentials</h2>
            <a href="#" style={{ color: 'hsl(var(--primary))', fontWeight: 600, fontSize: '0.9rem' }}>View All</a>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '1.5rem'
          }}>
            {loading ? (
              [1, 2, 3, 4].map(i => (
                <div key={i} style={{ height: '250px', background: '#f5f5f5', borderRadius: 'var(--radius)' }}></div>
              ))
            ) : products.map(product => (
              <ProductCard
                key={product.id}
                product={{
                  ...product,
                  price: product.selling_price,
                  image: (() => {
                    if (!product.primary_image || !product.primary_image.image_path) return 'https://placehold.co/200';
                    const path = product.primary_image.image_path;
                    const isExternal = /^https?:\/\//.test(path);
                    return isExternal ? path : `/storage/${path}`;
                  })()
                }}
                quantity={cartItems.find(item => item.id === product.id)?.quantity || 0}
                onAdd={addToCart}
                onUpdate={updateQuantity}
              />
            ))}
          </div>
        </section>
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
