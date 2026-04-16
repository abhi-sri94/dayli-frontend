import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, MapPin, ChevronDown, Menu, Phone, Mail, User, Package, LogOut, ChevronRight, ShoppingBag, Tag } from 'lucide-react';
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

const Navbar = ({ cartCount, onOpenCart, user, onLogout, onOpenAuth, onOpenProfile, searchQuery, onSearch, onHome, currentAddress, onDetectLocation, isDetecting }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <nav className="navbar glass" style={{
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      padding: '0.75rem 0',
      boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
      transition: 'all 0.3s'
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '2rem', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem', flex: 1 }}>
          <div
            onClick={onHome}
            className="logo"
            style={{
              color: 'hsl(var(--primary))',
              fontWeight: 900,
              fontSize: '2rem',
              letterSpacing: '-1.5px',
              cursor: 'pointer',
              userSelect: 'none',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.05))'
            }}
          >
            dayli
          </div>

          <div 
            onClick={onDetectLocation}
            className="location hide-on-mobile" 
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              userSelect: 'none', 
              cursor: 'pointer',
              padding: '0.4rem 0.8rem',
              borderRadius: '0.75rem',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.03)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{ fontWeight: 800, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              Delivery in 20-30 mins
              <ChevronDown size={14} />
            </div>
            <div style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', display: 'flex', alignItems: 'center', gap: '0.3rem', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              <MapPin size={12} color="hsl(var(--primary))" />
              {isDetecting ? 'Detecting...' : (currentAddress || 'Bahraich, Uttar Pradesh')}
            </div>
          </div>
        </div>

        <div className="search-container" style={{ 
          position: 'relative', 
          flex: 2, 
          maxWidth: '500px',
          margin: '0 1rem',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isSearchFocused ? 'scale(1.02)' : 'scale(1)'
        }}>
          <div style={{
            background: 'hsl(var(--muted))',
            borderRadius: '1rem',
            padding: '0.75rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            border: isSearchFocused ? '2px solid hsl(var(--primary) / 0.5)' : '2px solid transparent',
            boxShadow: isSearchFocused ? '0 10px 25px -5px rgba(0,0,0,0.1)' : 'none',
            transition: 'all 0.2s'
          }}>
            <Search size={20} color={isSearchFocused ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'} />
            <input
              type="text"
              placeholder='Search "milk", "bread", "snacks"...'
              value={searchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              onChange={(e) => onSearch(e.target.value)}
              style={{ background: 'none', border: 'none', outline: 'none', width: '100%', fontSize: '0.95rem', fontWeight: 500 }}
            />
          </div>
        </div>

        <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: 1, justifyContent: 'flex-end' }}>
          {user ? (
            <div style={{ position: 'relative' }}>
              <div
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  cursor: 'pointer', 
                  fontWeight: 700, 
                  fontSize: '0.9rem',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '0.75rem',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.03)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'hsl(var(--primary) / 0.1)', color: 'hsl(var(--primary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>
                  {user.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="hide-on-mobile">Hi, {user.name?.split(' ')[0] || 'User'}</span>
                <ChevronDown size={14} />
              </div>

              <AnimatePresence>
                {isDropdownOpen && (
                  <>
                    <div
                      onClick={() => setIsDropdownOpen(false)}
                      style={{ position: 'fixed', inset: 0, zIndex: 10 }}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        marginTop: '0.75rem',
                        background: 'white',
                        borderRadius: '1rem',
                        boxShadow: 'var(--shadow-xl)',
                        border: '1px solid hsl(var(--border))',
                        minWidth: '240px',
                        zIndex: 11,
                        padding: '0.75rem',
                        overflow: 'hidden'
                      }}
                      className="profile-dropdown"
                    >
                      <div style={{ padding: '0.75rem', borderBottom: '1px solid #f1f5f9', marginBottom: '0.5rem' }}>
                         <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{user.name}</div>
                         <div style={{ fontWeight: 500, fontSize: '0.75rem', color: '#64748b' }}>{user.phone_number}</div>
                      </div>
                      <button
                        onClick={() => { onOpenProfile('profile'); setIsDropdownOpen(false); }}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '0.75rem', transition: 'all 0.2s', fontWeight: 600, fontSize: '0.9rem' }}
                        className="hover:bg-slate-50"
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <User size={18} /> My Profile
                      </button>
                      <button
                        onClick={() => { onOpenProfile('orders'); setIsDropdownOpen(false); }}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '0.75rem', transition: 'all 0.2s', fontWeight: 600, fontSize: '0.9rem' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <Package size={18} /> My Orders
                      </button>
                      <div style={{ height: '1px', background: '#f1f5f9', margin: '0.5rem' }} />
                      <button
                        onClick={() => { onLogout(); setIsDropdownOpen(false); }}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '0.75rem', color: '#ef4444', transition: 'all 0.2s', fontWeight: 700, fontSize: '0.9rem' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <LogOut size={18} /> Logout
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button 
              onClick={onOpenAuth} 
              style={{ fontWeight: 700, fontSize: '1rem', cursor: 'pointer', color: 'hsl(var(--foreground))', padding: '0.5rem 1rem' }}
            >
              Login
            </button>
          )}
          <button
            onClick={onOpenCart}
            className="btn btn-primary btn-cart"
            style={{ 
              gap: '0.6rem', 
              padding: '0.75rem 1.25rem',
              borderRadius: '1rem',
              position: 'relative'
            }}
          >
            <ShoppingCart size={20} />
            {cartCount > 0 ? (
              <>
                <span style={{ fontWeight: 800 }}>{cartCount} Items</span>
                <span style={{ 
                  position: 'absolute', 
                  top: '-5px', 
                  right: '-5px', 
                  background: '#ef4444', 
                  color: 'white', 
                  width: '22px', 
                  height: '22px', 
                  borderRadius: '50%', 
                  fontSize: '0.7rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  border: '2px solid white',
                  fontWeight: 900
                }}>{cartCount}</span>
              </>
            ) : (
              <span style={{ fontWeight: 800 }}>My Cart</span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
};

const HeroBanner = () => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    style={{
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      borderRadius: '2rem',
      padding: '3rem',
      color: 'white',
      position: 'relative',
      overflow: 'hidden',
      marginBottom: '3rem',
      boxShadow: '0 20px 40px rgba(16, 185, 129, 0.2)'
    }}
  >
    {/* Abstract Background Shapes */}
    <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', filter: 'blur(50px)' }} />
    <div style={{ position: 'absolute', bottom: '-20%', left: '10%', width: '250px', height: '250px', borderRadius: '50%', background: 'rgba(0,0,0,0.05)', filter: 'blur(40px)' }} />

    <div style={{ position: 'relative', zIndex: 1, maxWidth: '600px' }}>
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)', display: 'inline-block', padding: '0.5rem 1rem', borderRadius: '2rem', fontSize: '0.85rem', fontWeight: 700, marginBottom: '1.5rem', letterSpacing: '0.05em' }}
      >
        ⚡️ FASTEST DELIVERY IN BAHRAICH
      </motion.div>
      <h1 style={{ fontSize: '3.5rem', fontWeight: 950, lineHeight: 1, marginBottom: '1rem', letterSpacing: '-2px' }}>
        Freshness <br />Delivered <span style={{ color: '#ecfdf5' }}>Daily.</span>
      </h1>
      <p style={{ fontSize: '1.1rem', opacity: 0.9, fontWeight: 500, marginBottom: '2.5rem', lineHeight: 1.6 }}>
        Get your groceries, fresh vegetables, and daily essentials delivered to your doorstep within 20-30 minutes.
      </p>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button style={{ background: 'white', color: '#059669', padding: '1rem 2.5rem', borderRadius: '1.25rem', fontWeight: 800, fontSize: '1rem', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}>Shop Now</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ display: 'flex' }}>
             {[1,2,3].map(i => (
               <div key={i} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)', marginLeft: i > 1 ? '-10px' : '0', background: '#fff9c4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🍊</div>
             ))}
          </div>
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Join 5k+ happy families</span>
        </div>
      </div>
    </div>

    <motion.div 
      initial={{ opacity: 0, scale: 0.8, rotate: 10 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ type: 'spring', damping: 15, delay: 0.3 }}
      style={{ position: 'absolute', right: '5%', top: '15%', height: '70%', display: 'flex', alignItems: 'center' }}
      className="hide-on-mobile"
    >
      <div style={{ fontSize: '12rem', filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.2))' }}>🥦</div>
    </motion.div>
  </motion.div>
);

const ProfileModal = ({ isOpen, onClose, user, token, onUpdateUser, onTrackOrder, initialTab = 'profile' }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingName, setEditingName] = useState(user?.name || '');
  const [editingEmail, setEditingEmail] = useState(user?.email?.includes('placeholder') ? '' : (user?.email || ''));
  const [isUpdating, setIsUpdating] = useState(false);
  const emailInputRef = React.useRef(null);

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
        body: JSON.stringify({ name: editingName, email: editingEmail })
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
    <AnimatePresence>
      <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           onClick={onClose}
           style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)' }}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          style={{
            background: 'white',
            borderRadius: '2rem',
            width: '100%',
            maxWidth: '600px',
            maxHeight: '85vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            zIndex: 1,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}
        >
          <div className="glass" style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <button 
                onClick={() => setActiveTab('profile')}
                style={{ 
                  fontSize: '1rem', 
                  fontWeight: 900, 
                  color: activeTab === 'profile' ? 'hsl(var(--primary))' : '#64748b',
                  position: 'relative',
                  padding: '0.5rem 0'
                }}
              >
                Profile
                {activeTab === 'profile' && <motion.div layoutId="modal-tab" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: 'hsl(var(--primary))', borderRadius: '2px' }} />}
              </button>
              <button 
                onClick={() => setActiveTab('orders')}
                style={{ 
                  fontSize: '1rem', 
                  fontWeight: 900, 
                  color: activeTab === 'orders' ? 'hsl(var(--primary))' : '#64748b',
                  position: 'relative',
                  padding: '0.5rem 0'
                }}
              >
                My Orders
                {activeTab === 'orders' && <motion.div layoutId="modal-tab" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: 'hsl(var(--primary))', borderRadius: '2px' }} />}
              </button>
            </div>
            <button onClick={onClose} style={{ color: '#64748b', fontSize: '1.25rem' }}>✕</button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
            {activeTab === 'profile' ? (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2.5rem' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'hsl(var(--primary) / 0.1)', color: 'hsl(var(--primary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 900 }}>
                    {user?.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 900 }}>{user?.name}</h3>
                    <p style={{ color: '#64748b', fontWeight: 600 }}>{user?.phone_number}</p>
                    <div style={{ 
                      fontSize: '0.8rem', 
                      color: (user?.email && !user.email.includes('placeholder')) ? 'hsl(var(--primary))' : '#ef4444', 
                      fontWeight: 700,
                      marginTop: '0.25rem' 
                    }}>
                      {user?.email && !user.email.includes('placeholder') ? user.email : 'Email not added'}
                    </div>
                  </div>
                </div>

                <form onSubmit={handleUpdateProfile} style={{ display: 'grid', gap: '1.5rem' }}>
                   <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '1.25rem', border: '1px solid #f1f5f9' }}>
                     <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>Full Name</label>
                     <input
                        type="text"
                        value={editingName}
                        onChange={e => setEditingName(e.target.value)}
                        style={{ width: '100%', background: 'none', border: 'none', outline: 'none', fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}
                     />
                   </div>
                   <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '1.25rem', border: '1px solid #f1f5f9' }}>
                     <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>Email Address</label>
                     <input
                        ref={emailInputRef}
                        type="email"
                        value={editingEmail}
                        onChange={e => setEditingEmail(e.target.value)}
                        placeholder="Add your email"
                        style={{ width: '100%', background: 'none', border: 'none', outline: 'none', fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}
                     />
                   </div>
                   <motion.button
                     whileTap={{ scale: 0.95 }}
                     type="submit"
                     disabled={isUpdating}
                     className="btn btn-primary"
                     style={{ padding: '1rem', width: '100%' }}
                   >
                     {isUpdating ? 'Updating...' : 'Save Changes'}
                   </motion.button>
                </form>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid #f1f5f9', borderTopColor: 'hsl(var(--primary))', borderRadius: '50%', margin: '0 auto', animation: 'spin 1s linear infinite' }} />
                  </div>
                ) : orders.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <Package size={48} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
                    <p style={{ color: '#64748b', fontWeight: 600 }}>No orders found yet.</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: '1rem' }}>
                    {orders.map(order => (
                      <div 
                        key={order.id} 
                        onClick={() => onTrackOrder(order.order_number)}
                        style={{ 
                          padding: '1.5rem', 
                          borderRadius: '1.25rem', 
                          border: '1px solid #f1f5f9', 
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          background: '#f8fafc'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'hsl(var(--primary) / 0.3)'; e.currentTarget.style.background = 'white'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#f1f5f9'; e.currentTarget.style.background = '#f8fafc'; }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                          <span style={{ fontWeight: 900, fontSize: '0.95rem' }}>#{order.order_number}</span>
                          <span style={{ background: 'white', padding: '0.3rem 0.75rem', borderRadius: '2rem', fontSize: '0.75rem', fontWeight: 800, color: 'hsl(var(--primary))', boxShadow: 'var(--shadow-sm)' }}>
                            {order.order_status?.toUpperCase() || order.status?.toUpperCase()}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
                          {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                        <div style={{ marginTop: '0.75rem', fontWeight: 900, fontSize: '1.1rem' }}>₹{order.payable_amount || order.total_amount}</div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
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
    <motion.div
      whileHover={{ y: -5, scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onClick(id)}
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: '0.75rem',
        cursor: 'pointer',
        minWidth: '160px',
        padding: '0.75rem',
        borderRadius: '1.25rem',
        background: isActive ? 'white' : 'transparent',
        boxShadow: isActive ? 'var(--shadow-md)' : 'none',
        border: isActive ? '1px solid hsl(var(--primary) / 0.1)' : '1px solid transparent',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        userSelect: 'none'
      }}
    >
      <div 
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '1rem',
          background: isActive ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.75rem',
          boxShadow: isActive ? '0 8px 15px rgba(16, 185, 129, 0.2)' : '0 4px 10px rgba(0,0,0,0.05)',
          transition: 'all 0.3s',
          flexShrink: 0
        }}
        className={!isActive ? "glass" : ""}
      >
        <span style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}>{icon && icon.length <= 2 ? icon : emojiFallback}</span>
      </div>
      <span style={{ 
        fontSize: '0.85rem', 
        fontWeight: isActive ? 800 : 700, 
        color: isActive ? 'hsl(var(--primary))' : '#1e293b',
        lineHeight: 1.2
      }}>
        {name}
      </span>
    </motion.div>
  );
};

const ProductDetailModal = ({ product, onClose, quantity, onAdd, onUpdate }) => {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    if (!product) return;
    setLoading(true);
    setActiveImg(0);
    fetch(`${apiBaseUrl}/api/products/${product.slug || product.id}`)
      .then(r => r.json())
      .then(data => {
        if (data.status === 'success') setDetail(data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [product?.id]);

  if (!product) return null;

  const images = detail?.images?.length
    ? detail.images.map(img => img.image_path?.startsWith('http') ? img.image_path : `${apiBaseUrl}/storage/${img.image_path}`)
    : [product.image || 'https://placehold.co/300'];

  const price = detail?.selling_price || product.price;
  const mrp = detail?.mrp || product.mrp;
  const hasDiscount = mrp && parseFloat(mrp) > parseFloat(price);
  const discountPct = hasDiscount ? Math.round(((mrp - price) / mrp) * 100) : 0;
  const shortDesc = detail?.short_description || '';
  const longDesc = detail?.long_description || '';
  const unit = detail?.unit || product.unit;
  const weight = detail?.weight || product.weight;
  const sku = detail?.sku || '';
  const inStock = detail?.stock_status === 'in_stock' || detail?.stock_status == null;

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.55 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'black', zIndex: 200 }}
      />
      <motion.div
        key="drawer"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          maxHeight: '92vh',
          background: 'white',
          borderRadius: '1.5rem 1.5rem 0 0',
          zIndex: 201,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '0.75rem' }}>
          <div style={{ width: '40px', height: '4px', borderRadius: '2px', background: '#e2e8f0' }} />
        </div>

        <div style={{ overflowY: 'auto', flex: 1 }}>
          {loading ? (
            <div style={{ padding: '4rem', textAlign: 'center', color: '#888' }}>
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} style={{ display: 'inline-block', marginBottom: '1rem' }}>
                <Package size={36} color="hsl(var(--primary))" />
              </motion.div>
              <p style={{ fontWeight: 600 }}>Loading product...</p>
            </div>
          ) : (
            <>
              {/* Image Gallery */}
              <div style={{ position: 'relative', background: '#f8fafc' }}>
                <button
                  onClick={onClose}
                  style={{
                    position: 'absolute', top: '1rem', right: '1rem', zIndex: 10,
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: 'white', border: '1px solid #eee',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)', fontSize: '1rem', cursor: 'pointer'
                  }}
                >✕</button>

                <div style={{ height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
                  <motion.img
                    key={activeImg}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    src={images[activeImg]}
                    alt={product.name}
                    style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                  />
                </div>

                {images.length > 1 && (
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', paddingBottom: '1rem' }}>
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImg(idx)}
                        style={{
                          width: '48px', height: '48px', borderRadius: '0.5rem', overflow: 'hidden',
                          border: `2px solid ${activeImg === idx ? 'hsl(var(--primary))' : '#e2e8f0'}`,
                          padding: 0, cursor: 'pointer', background: '#f8fafc'
                        }}
                      >
                        <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div style={{ padding: '1.5rem' }}>
                {/* Badges */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                  {!inStock && (
                    <span style={{ background: '#fee2e2', color: '#dc2626', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.7rem', fontWeight: 700 }}>OUT OF STOCK</span>
                  )}
                  {hasDiscount && (
                    <span style={{ background: '#dcfce7', color: '#16a34a', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.7rem', fontWeight: 700 }}>{discountPct}% OFF</span>
                  )}
                </div>

                <h1 style={{ fontSize: '1.2rem', fontWeight: 800, lineHeight: 1.3, marginBottom: '0.5rem' }}>
                  {detail?.name || product.name}
                </h1>

                {(unit || weight) && (
                  <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.75rem' }}>
                    {[weight && `${weight}`, unit].filter(Boolean).join(' • ')}
                  </p>
                )}

                {shortDesc && (
                  <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.6, marginBottom: '1rem' }}>{shortDesc}</p>
                )}

                {/* Price Row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'hsl(var(--primary))' }}>₹{price}</span>
                  {hasDiscount && (
                    <span style={{ fontSize: '1rem', color: '#94a3b8', textDecoration: 'line-through' }}>₹{mrp}</span>
                  )}
                </div>

                {/* Long Description */}
                {longDesc && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: '0.5rem', color: '#1e293b' }}>About this product</h3>
                    <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.7 }}>{longDesc}</p>
                  </div>
                )}

                {/* Meta Info */}
                {sku && (
                  <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '0.75rem', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <span style={{ color: '#64748b' }}>SKU</span>
                      <span style={{ fontWeight: 700 }}>{sku}</span>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Sticky Add to Cart Footer */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #f1f5f9', background: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '1.3rem', fontWeight: 900 }}>₹{price}</span>
              {unit && <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginLeft: '0.3rem' }}>{unit}</span>}
            </div>
            {quantity > 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', background: 'hsl(var(--primary))', color: 'white', borderRadius: '0.75rem', overflow: 'hidden' }}>
                <button onClick={() => onUpdate(product.id, -1)} style={{ padding: '0.6rem 1rem', color: 'white', fontWeight: 800, fontSize: '1.1rem' }}>-</button>
                <span style={{ minWidth: '2rem', textAlign: 'center', fontWeight: 700 }}>{quantity}</span>
                <button 
                  onClick={() => onUpdate(product.id, 1)} 
                  disabled={quantity >= (detail?.stock_quantity ?? 999)}
                  style={{ padding: '0.6rem 1rem', color: 'white', fontWeight: 800, fontSize: '1.1rem', opacity: quantity >= (detail?.stock_quantity ?? 999) ? 0.5 : 1 }}
                >+</button>
              </div>
            ) : (
              <button
                onClick={() => { onAdd(product); }}
                disabled={!inStock || (detail?.stock_quantity ?? 999) <= 0}
                className="btn btn-primary"
                style={{ padding: '0.75rem 2rem', opacity: (inStock && (detail?.stock_quantity ?? 999) > 0) ? 1 : 0.5 }}
              >
                {(inStock && (detail?.stock_quantity ?? 999) > 0) ? 'Add to Cart' : 'Out of Stock'}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

const ProductCard = ({ product, quantity, onAdd, onUpdate, onOpenDetail }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -8 }}
    transition={{ duration: 0.3 }}
    className="product-card"
    onClick={() => onOpenDetail && onOpenDetail(product)}
    style={{
      background: 'white',
      borderRadius: '1.5rem',
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      cursor: 'pointer',
      boxShadow: 'var(--shadow-md)',
      border: '1px solid #f1f5f9',
      transition: 'box-shadow 0.3s ease',
      height: '100%',
      position: 'relative'
    }}
    onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-xl)'}
    onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
  >
    <div style={{ 
      height: '160px', 
      marginBottom: '0.5rem', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      position: 'relative',
      background: '#f8fafc',
      borderRadius: '1rem',
      padding: '1rem'
    }}>
      {product.mrp && parseFloat(product.mrp) > parseFloat(product.price) && (
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          background: 'hsl(var(--primary))',
          color: 'white',
          fontSize: '0.7rem',
          fontWeight: 900,
          padding: '4px 10px',
          borderRadius: '0.75rem',
          zIndex: 1,
          boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)',
          letterSpacing: '0.02em'
        }}>
          {Math.round(((product.mrp - product.price) / product.mrp) * 100)}% OFF
        </div>
      )}
      <img 
        src={product.image || 'https://placehold.co/200'} 
        alt={product.name} 
        loading="lazy"
        style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.05))' }} 
      />
    </div>
    
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
      <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, letterSpacing: '0.02em' }}>
        {product.unit || product.weight || 'Default'}
      </div>
      <div style={{ 
        fontWeight: 800, 
        fontSize: '1rem', 
        lineHeight: '1.3', 
        color: '#1e293b',
        display: '-webkit-box',
        WebkitLineClamp: '2',
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        minHeight: '2.6rem'
      }}>
        {product.name}
      </div>
    </div>

    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }} onClick={e => e.stopPropagation()}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          <span style={{ 
            fontWeight: 900, 
            fontSize: '1.15rem',
            color: '#0f172a'
          }}>₹{product.price}</span>
          {product.mrp && parseFloat(product.mrp) > parseFloat(product.price) && (
            <span style={{ 
              fontSize: '0.8rem', 
              color: '#94a3b8', 
              textDecoration: 'line-through',
              fontWeight: 500 
            }}>
              ₹{product.mrp}
            </span>
          )}
        </div>
      </div>

      {quantity > 0 ? (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: 'hsl(var(--primary))',
          color: 'white',
          borderRadius: '0.85rem',
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
        }}>
          <button
            onClick={(e) => { e.stopPropagation(); onUpdate(product.id, -1); }}
            style={{ padding: '0.5rem 0.75rem', color: 'white', fontWeight: 900, fontSize: '1.1rem' }}
          >-</button>
          <span style={{ minWidth: '1.2rem', textAlign: 'center', fontWeight: 800, fontSize: '0.95rem' }}>{quantity}</span>
          <button
            onClick={(e) => { e.stopPropagation(); onUpdate(product.id, 1); }}
            disabled={quantity >= (product.stock_quantity ?? 999)}
            style={{ padding: '0.5rem 0.75rem', color: 'white', fontWeight: 900, fontSize: '1.1rem', opacity: quantity >= (product.stock_quantity ?? 999) ? 0.5 : 1 }}
          >+</button>
        </div>
      ) : (
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={(e) => { e.stopPropagation(); onAdd(product); }}
          disabled={(product.stock_quantity ?? 999) <= 0}
          style={{
            color: 'hsl(var(--primary))',
            border: '2px solid hsl(var(--primary) / 0.2)',
            background: 'hsl(var(--primary) / 0.05)',
            padding: '0.5rem 1.25rem',
            borderRadius: '0.85rem',
            fontWeight: 800,
            fontSize: '0.85rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            opacity: (product.stock_quantity ?? 999) <= 0 ? 0.5 : 1,
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'hsl(var(--primary))';
            e.currentTarget.style.color = 'white';
            e.currentTarget.style.border = '2px solid hsl(var(--primary))';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'hsl(var(--primary) / 0.05)';
            e.currentTarget.style.color = 'hsl(var(--primary))';
            e.currentTarget.style.border = '2px solid hsl(var(--primary) / 0.2)';
          }}
        >
          {(product.stock_quantity ?? 999) <= 0 ? 'Sold Out' : 'Add'}
        </motion.button>
      )}
    </div>
  </motion.div>
);

const CartDrawer = ({ 
  isOpen, 
  onClose, 
  cartItems, 
  onUpdateQuantity, 
  onCheckout, 
  isCheckingOut, 
  address, 
  setAddress, 
  onDetectLocation, 
  isDetectingLocation,
  appliedCoupon,
  onApplyCoupon,
  onRemoveCoupon,
  couponInput,
  setCouponInput,
  couponError,
  isApplyingCoupon
}) => {

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
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="glass"
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '100%',
              maxWidth: '420px',
              zIndex: 101,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '-10px 0 50px rgba(0,0,0,0.1)',
              background: 'rgba(255, 255, 255, 0.95)',
              borderLeft: '1px solid rgba(255,255,255,0.5)'
            }}
          >
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ background: 'hsl(var(--primary) / 0.1)', padding: '0.5rem', borderRadius: '0.75rem' }}>
                  <ShoppingBag size={20} color="hsl(var(--primary))" />
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.02em' }}>My Cart</h2>
              </div>
              <motion.button 
                whileHover={{ rotate: 90 }}
                onClick={onClose} 
                style={{ fontSize: '1.25rem', color: '#64748b' }}
              >✕</motion.button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {cartItems.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    textAlign: 'center',
                    marginTop: '4rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '0 2rem'
                  }}
                >
                  <div style={{
                    width: '140px',
                    height: '140px',
                    background: 'hsl(var(--primary) / 0.1)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '2rem',
                    position: 'relative'
                  }}>
                    <ShoppingBag size={64} style={{ color: 'hsl(var(--primary))' }} />
                  </div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.75rem' }}>Your cart is empty</h3>
                  <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '2.5rem', lineHeight: 1.6 }}>
                    Looks like you haven't added anything yet. Let's start with some fresh essentials!
                  </p>
                  <button
                    onClick={onClose}
                    className="btn btn-primary"
                    style={{ padding: '1rem 3rem', fontSize: '1rem' }}
                  >
                    Start Shopping
                  </button>
                </motion.div>
              ) : (
                <>
                  <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '1.25rem', border: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e293b' }}>Delivery Address</label>
                      <button 
                        onClick={onDetectLocation}
                        disabled={isDetectingLocation}
                        style={{ 
                          fontSize: '0.75rem', 
                          color: 'hsl(var(--primary))', 
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          background: 'white',
                          padding: '0.4rem 0.8rem',
                          borderRadius: '0.6rem',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                        }}
                      >
                       <MapPin size={12} />
                       {isDetectingLocation ? '...' : 'Change'}
                      </button>
                    </div>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      style={{ width: '100%', background: 'none', border: 'none', fontSize: '0.9rem', outline: 'none', resize: 'none', color: '#475569', fontWeight: 500, lineHeight: 1.6 }}
                      rows={2}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {cartItems.map(item => (
                      <motion.div 
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={item.id} 
                        style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}
                      >
                        <div style={{ width: '70px', height: '70px', background: '#f8fafc', borderRadius: '1rem', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <img src={item.image} alt={item.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1e293b', marginBottom: '0.2rem' }}>{item.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>{item.weight}</div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                            <div style={{ fontWeight: 900, fontSize: '1rem' }}>₹{item.price * item.quantity}</div>
                            <div style={{ display: 'flex', alignItems: 'center', background: '#f1f5f9', borderRadius: '0.75rem', padding: '2px' }}>
                              <button onClick={() => onUpdateQuantity(item.id, -1)} style={{ width: '28px', height: '28px', borderRadius: '0.6rem', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>-</button>
                              <span style={{ padding: '0 0.75rem', fontSize: '0.9rem', fontWeight: 800 }}>{item.quantity}</span>
                              <button onClick={() => onUpdateQuantity(item.id, 1)} style={{ width: '28px', height: '28px', borderRadius: '0.6rem', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>+</button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Coupon Section */}
                  <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '1.25rem', border: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1e293b' }}>
                      <Tag size={16} color="hsl(var(--primary))" />
                      Coupons & Offers
                    </div>
                    
                    {appliedCoupon ? (
                      <div style={{ 
                        background: 'hsl(var(--primary) / 0.1)', 
                        padding: '1rem', 
                        borderRadius: '1rem', 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        border: '1px dashed hsl(var(--primary) / 0.3)'
                      }}>
                        <div>
                          <div style={{ fontWeight: 900, color: 'hsl(var(--primary))', fontSize: '0.9rem' }}>{appliedCoupon.code}</div>
                          <div style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', fontWeight: 600 }}>You saved ₹{appliedCoupon.discount_amount}!</div>
                        </div>
                        <button 
                          onClick={onRemoveCoupon}
                          style={{ color: '#ef4444', fontWeight: 800, fontSize: '0.8rem' }}
                        >
                          REMOVE
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input 
                          type="text" 
                          placeholder="APPLY CODE"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                          style={{ 
                            flex: 1, 
                            padding: '0.75rem 1rem', 
                            borderRadius: '0.85rem', 
                            border: '1px solid #e2e8f0',
                            fontSize: '0.85rem',
                            fontWeight: 800,
                            outline: 'none',
                            background: 'white'
                          }}
                        />
                        <button 
                          onClick={() => onApplyCoupon(cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0))}
                          disabled={isApplyingCoupon || !couponInput.trim()}
                          className="btn btn-primary"
                          style={{ 
                            padding: '0 1.5rem',
                            height: 'auto',
                            opacity: (isApplyingCoupon || !couponInput.trim()) ? 0.6 : 1
                          }}
                        >
                          {isApplyingCoupon ? '...' : 'APPLY'}
                        </button>
                      </div>
                    )}
                    {couponError && (
                      <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.75rem', fontWeight: 700, textAlign: 'center' }}>
                        {couponError}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {cartItems.length > 0 && (() => {
              const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
              const deliveryFee = subtotal < 100 ? 20 : 0;
              const couponDiscount = appliedCoupon ? appliedCoupon.discount_amount : 0;
              const total = Math.max(0, subtotal + deliveryFee - couponDiscount);

              return (
                <div style={{ padding: '1.5rem', borderTop: '1px solid #eee', background: 'white' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#666' }}>
                      <span>Subtotal</span>
                      <span>₹{subtotal}</span>
                    </div>

                    {couponDiscount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'hsl(var(--primary))', fontWeight: 600 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Tag size={12} />
                          Coupon Discount ({appliedCoupon.code})
                        </span>
                        <span>-₹{couponDiscount}</span>
                      </div>
                    )}

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
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
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
  const [address, setAddress] = useState('Bahraich, Uttar Pradesh');
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsDetectingLocation(true);
    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const userAgent = "DayliApp/1.0";
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`, {
            headers: { "User-Agent": userAgent }
          });
          const data = await response.json();
          
          if (data && data.address) {
            const addr = data.address;
            // Build a precision address: Road/Neighborhood, Area, City
            const parts = [];
            if (addr.road) parts.push(addr.road);
            else if (addr.amenity) parts.push(addr.amenity);
            
            if (addr.suburb) parts.push(addr.suburb);
            else if (addr.neighbourhood) parts.push(addr.neighbourhood);
            else if (addr.residential) parts.push(addr.residential);

            if (addr.city === 'Bahraich' || addr.town === 'Bahraich' || addr.village === 'Bahraich') {
                parts.push('Bahraich');
            } else {
                parts.push(addr.city || addr.town || addr.village || 'Bahraich');
            }

            const formattedAddress = parts.length > 0 ? parts.join(', ') : data.display_name;
            setAddress(formattedAddress);
          } else if (data && data.display_name) {
            setAddress(data.display_name);
          } else {
            setAddress(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
          }
        } catch (error) {
          alert("Could not detect exact area. Please enter it manually.");
        } finally {
          setIsDetectingLocation(false);
        }
      },
      (error) => {
        setIsDetectingLocation(false);
        if (error.code === 1) {
          alert("Please allow 'Precise Location' access in your settings for exact area detection.");
        } else {
          alert("Could not detect your exact area. Please try moving outdoors.");
        }
      },
      options
    );
  };
  const [token, setToken] = useState(() => localStorage.getItem('dayli_token'));
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
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
    setAppliedCoupon(null);
    localStorage.removeItem('dayli_user');
    localStorage.removeItem('dayli_token');
  };

  const handleApplyCoupon = async (subtotal) => {
    if (!token) {
      setCouponError('Please login to apply coupon');
      return;
    }
    if (!couponInput.trim()) {
      setCouponError('Enter a coupon code');
      return;
    }

    setIsApplyingCoupon(true);
    setCouponError('');
    try {
      const response = await fetch(`${apiBaseUrl}/api/coupons/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          code: couponInput.trim(),
          amount: subtotal
        })
      });
      const data = await response.json();
      if (data.success) {
        setAppliedCoupon(data.data);
        setCouponError('');
      } else {
        setCouponError(data.message || 'Invalid coupon');
      }
    } catch (err) {
      setCouponError('Failed to apply coupon');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError('');
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
        // Silently handle search fail
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
          fetch(`${apiBaseUrl}/api/products?featured=1&v=${Date.now()}`),
          fetch(`${apiBaseUrl}/api/categories?v=${Date.now()}`)
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
        const res = await fetch(`${apiBaseUrl}/api/products?category_id=${selectedCategoryId}${searchQuery ? `&search=${searchQuery}` : ''}&v=${Date.now()}`);
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
      const stock = product.stock_quantity ?? 999;
      
      if (existing) {
        if (existing.quantity >= stock) {
          alert(`Only ${stock} units available in stock.`);
          return prev;
        }
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      
      if (stock <= 0) {
        alert("This item is currently out of stock.");
        return prev;
      }
      
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id, delta) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        const stock = item.stock_quantity ?? 999;

        if (delta > 0 && newQty > stock) {
          alert(`Only ${stock} units available in stock.`);
          return item;
        }

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
          payment_method: paymentMethod,
          coupon_code: appliedCoupon ? appliedCoupon.code : null
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
        currentAddress={address}
        onDetectLocation={handleDetectLocation}
        isDetecting={isDetectingLocation}
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

      <main className="container" style={{ paddingTop: '1.5rem', paddingBottom: '4rem' }}>
        {trackingOrderNumber ? (
          <OrderStatus
            orderNumber={trackingOrderNumber}
            onBack={() => {
              setTrackingOrderNumber(null);
              window.history.pushState({}, '', window.location.pathname);
            }}
          />
        ) : orderSuccess ? (
          <div style={{ maxWidth: '500px', margin: '4rem auto', textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '2.5rem', boxShadow: 'var(--shadow-xl)', border: '1px solid #eee' }}>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#f0fdf4', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', fontSize: '2.5rem' }}>
              ✓
            </motion.div>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '1rem' }}>Order Placed!</h1>
            <p style={{ color: '#666', marginBottom: '2.5rem', lineHeight: 1.6 }}>Thank you for shopping with Dayli. Your order <strong>#{orderSuccess.order_number}</strong> is being prepared.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <button 
                onClick={() => {
                  setOrderSuccess(null);
                  setTrackingOrderNumber(orderSuccess.order_number);
                  window.history.pushState({}, '', `?orderNumber=${orderSuccess.order_number}`);
                }}
                className="btn btn-primary"
                style={{ padding: '1.2rem', fontSize: '1rem' }}
              >
                Track Order Status
              </button>
              <button 
                onClick={() => setOrderSuccess(null)}
                style={{ padding: '1rem', fontWeight: 700, color: '#666' }}
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
                      mrp: product.mrp,
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
                    onOpenDetail={setSelectedProduct}
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
                flexWrap: 'wrap',
                justifyContent: 'center',
                padding: '0.5rem 0 1.5rem',
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
                        mrp: product.mrp,
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
                      onOpenDetail={setSelectedProduct}
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
        address={address}
        setAddress={setAddress}
        onDetectLocation={handleDetectLocation}
        isDetectingLocation={isDetectingLocation}
        appliedCoupon={appliedCoupon}
        onApplyCoupon={handleApplyCoupon}
        onRemoveCoupon={handleRemoveCoupon}
        couponInput={couponInput}
        setCouponInput={setCouponInput}
        couponError={couponError}
        isApplyingCoupon={isApplyingCoupon}
      />

      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          quantity={cartItems.find(item => item.id === selectedProduct.id)?.quantity || 0}
          onAdd={(p) => { addToCart(p); }}
          onUpdate={updateQuantity}
        />
      )}

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
