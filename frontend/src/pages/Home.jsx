import React, { useState, useEffect } from 'react';
import { 
  MapPin, User, Search, Mic, Home as HomeIcon, Grid, 
  Sparkles, ShoppingBag, Plus, ShoppingCart, Apple, 
  Milk, Cookie, Coffee, Package, Heart, CreditCard, 
  Bell, Settings, Smartphone, Sun, Moon, Minus, 
  Trash2, ChevronDown, MoreHorizontal, CheckCircle2,
  Gift
} from 'lucide-react';

const Home = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // Left Navigation Items
  const navItems = [
    { icon: <HomeIcon size={20} />, label: 'Home', active: true },
    { icon: <Grid size={20} />, label: 'Categories' },
    { icon: <Sparkles size={20} />, label: 'Cook with AI', badge: 'AI' },
    { icon: <Package size={20} />, label: 'Orders' },
    { icon: <Heart size={20} />, label: 'Favourites' },
    { icon: <CreditCard size={20} />, label: 'Wallet & Payments' },
    { icon: <Bell size={20} />, label: 'Notifications', count: 3 },
    { icon: <Settings size={20} />, label: 'Settings' },
  ];

  const categories = [
    { icon: <Apple color="var(--color-error)" size={28} />, name: 'Fruits & Veggies' },
    { icon: <Milk color="var(--color-info)" size={28} />, name: 'Dairy & Eggs' },
    { icon: <Cookie color="var(--color-warning)" size={28} />, name: 'Snacks & Branded' },
    { icon: <Coffee color="#8B5CF6" size={28} />, name: 'Beverages' },
    { icon: <ShoppingBag color="var(--color-success)" size={28} />, name: 'Staples' },
    { icon: <Sparkles color="var(--color-info)" size={28} />, name: 'Personal Care' },
    { icon: <HomeIcon color="var(--border-focus)" size={28} />, name: 'Home Care' },
    { icon: <Heart color="var(--color-error)" size={28} />, name: 'Baby Care' },
    { icon: <MoreHorizontal color="var(--text-secondary)" size={28} />, name: 'More' }
  ];

  const cartItems = [
    { name: 'Premium Tomato', qty: '1 kg', price: 28, count: 1 },
    { name: 'Amul Fresh Milk', qty: '500 ml', price: 24, count: 1 },
    { name: 'Banana', qty: '1 kg', price: 40, count: 2 },
    { name: 'Aashirvaad Atta', qty: '5 kg', price: 249, count: 1 },
  ];

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: '260px 1fr 340px', 
      minHeight: '100vh',
      backgroundColor: 'var(--bg-app)',
      color: 'var(--text-primary)'
    }}>
      
      {/* ── LEFT SIDEBAR ───────────────────────────────────── */}
      <aside style={{
        backgroundColor: 'var(--bg-card)',
        borderRight: '1px solid var(--border-divider)',
        padding: '24px 20px',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowY: 'auto'
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px', paddingLeft: '8px' }}>
          <div style={{ 
            width: '36px', height: '36px', borderRadius: '10px', 
            background: 'var(--grad-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
          }}>
            <ShoppingBag size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 'var(--fw-bold)', lineHeight: 1 }}>freshcart</h1>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Groceries in minutes.</span>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item, i) => (
            <button key={i} className="hover-elevate" style={{
              display: 'flex', alignItems: 'center', gap: '16px',
              padding: '12px 16px', borderRadius: 'var(--radius-lg)',
              backgroundColor: item.active ? 'var(--bg-surface)' : 'transparent',
              color: item.active ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: item.active ? 'var(--fw-semibold)' : 'var(--fw-medium)',
              textAlign: 'left',
              width: '100%',
              transition: 'background 0.2s, transform 0.2s'
            }}>
              <div style={{ color: item.active ? 'var(--border-focus)' : 'inherit' }}>
                {item.icon}
              </div>
              <span style={{ flex: 1 }}>{item.label}</span>
              
              {item.badge && (
                <span style={{ 
                  background: 'var(--grad-primary)', color: '#fff', fontSize: '10px', 
                  padding: '2px 8px', borderRadius: 'var(--radius-full)', fontWeight: 'var(--fw-bold)' 
                }}>{item.badge}</span>
              )}
              {item.count && (
                <span style={{ 
                  backgroundColor: 'var(--color-error)', color: '#fff', fontSize: '11px', 
                  width: '20px', height: '20px', borderRadius: 'var(--radius-full)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'var(--fw-bold)' 
                }}>{item.count}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Theme Toggle & Install Banner */}
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <button onClick={toggleTheme} className="hover-elevate btn-premium" style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '12px 16px', borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-default)', backgroundColor: 'var(--bg-surface)'
          }}>
            {isDarkMode ? <Sun size={20} color="var(--warning)" /> : <Moon size={20} color="var(--border-focus)" />}
            <span style={{ fontWeight: 'var(--fw-medium)' }}>
              {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </span>
          </button>

          <div style={{
            padding: '20px', borderRadius: 'var(--radius-xl)',
            backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)',
            textAlign: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ padding: '8px', background: 'var(--grad-primary)', borderRadius: 'var(--radius-md)', color: '#fff' }}>
                <Smartphone size={24} />
              </div>
              <div style={{ textAlign: 'left', fontSize: '13px', lineHeight: 1.3, color: 'var(--text-secondary)' }}>
                Get the app for faster delivery & better offers
              </div>
            </div>
            <button className="btn-premium" style={{
              width: '100%', padding: '12px', borderRadius: 'var(--radius-lg)',
              background: 'var(--grad-cta)', color: '#fff', fontWeight: 'var(--fw-semibold)'
            }}>
              Install App
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT ───────────────────────────────────── */}
      <main style={{ padding: '32px 40px', overflowY: 'auto' }}>
        
        {/* Top Header / Search */}
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center', marginBottom: '40px' }}>
          <div className="search-glow" style={{
            flex: 1, display: 'flex', alignItems: 'center', gap: '12px',
            padding: '14px 20px', borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <Search size={20} color="var(--text-secondary)" />
            <input 
              type="text" 
              placeholder="Search for &quot;milk&quot;, &quot;bread&quot; or &quot;apple&quot;" 
              style={{ flex: 1, border: 'none', background: 'transparent', fontSize: '15px' }}
            />
            <Mic size={20} color="var(--text-secondary)" style={{ cursor: 'pointer' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <MapPin size={20} color="var(--border-focus)" />
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Deliver to</div>
                <div style={{ fontWeight: 'var(--fw-semibold)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Home - 17, Green Park <ChevronDown size={14} />
                </div>
              </div>
            </div>
            
            <div style={{ position: 'relative', padding: '8px', cursor: 'pointer' }}>
              <ShoppingCart size={24} color="var(--text-primary)" />
              <div style={{
                position: 'absolute', top: '0', right: '0',
                background: 'var(--color-error)', color: '#fff', fontSize: '10px',
                width: '16px', height: '16px', borderRadius: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
              }}>4</div>
            </div>
            
            <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--bg-surface)', overflow: 'hidden' }}>
              <img src="https://i.pravatar.cc/100?img=33" alt="User" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div style={{ 
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', 
          gap: '16px', marginBottom: '40px' 
        }}>
          {categories.map((cat, i) => (
            <div key={i} className="hover-elevate" style={{
              backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-lg)', padding: '16px 8px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
              cursor: 'pointer', textAlign: 'center'
            }}>
              {cat.icon}
              <span style={{ fontSize: '12px', fontWeight: 'var(--fw-medium)' }}>{cat.name}</span>
            </div>
          ))}
        </div>

        {/* Promo Section (Hero & Buy Again) */}
        <div style={{ display: 'flex', gap: '24px', marginBottom: '40px' }}>
          
          {/* AI Hero */}
          <div className="animate-ambient-glow" style={{
            flex: '1.5', background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)',
            padding: '32px', position: 'relative', overflow: 'hidden',
            border: '1px solid var(--border-default)',
            color: 'var(--text-inverse)',
            boxShadow: 'var(--shadow-md)'
          }}>
            {/* Dark overlay for text readability on both themes */}
            <div style={{ position: 'absolute', inset: 0, background: '#111827', zIndex: 0 }}></div>
            
            <div style={{ position: 'relative', zIndex: 1, width: '60%' }}>
              <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--fw-bold)', marginBottom: '16px', color: '#fff' }}>
                Cook something<br/>delicious today! ✨
              </h2>
              <p style={{ color: '#A3A3A3', marginBottom: '32px', lineHeight: 1.5 }}>
                Tell us your dish and AI will build the perfect cart for you.
              </p>
              <button className="btn-premium" style={{
                background: 'var(--grad-cta)', color: '#fff', padding: '12px 24px',
                borderRadius: 'var(--radius-lg)', fontWeight: 'var(--fw-semibold)',
                display: 'flex', alignItems: 'center', gap: '8px'
              }}>
                Try Cook with AI <span style={{ fontSize: '18px' }}>→</span>
              </button>
            </div>

            {/* Decorative Image Placeholders */}
            <div style={{ position: 'absolute', right: '-40px', top: '-40px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(236,72,153,0.2) 0%, transparent 70%)', zIndex: 1 }}></div>
            <div style={{ 
              position: 'absolute', right: '20px', top: '20px', zIndex: 2,
              width: '200px', height: '200px', borderRadius: '50%', background: 'var(--grad-accent)', opacity: 0.1
            }}></div>
            {/* We will fake the food plate with CSS circles for the prototype */}
            <div style={{
              position: 'absolute', right: '40px', top: '40px', zIndex: 3,
              width: '160px', height: '160px', borderRadius: '50%', border: '8px solid rgba(255,255,255,0.1)',
              background: '#F97316', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <span style={{ fontSize: '64px' }}>🍝</span>
            </div>
          </div>

          {/* Right Column Promos */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Buy it again */}
            <div style={{ 
              background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', padding: '24px', 
              border: '1px solid var(--border-default)', flex: 1, boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 'var(--fw-bold)' }}>Buy it again</h3>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Your past orders</span>
                </div>
                <span style={{ color: 'var(--border-focus)', fontSize: '13px', fontWeight: 'var(--fw-medium)', cursor: 'pointer' }}>View all</span>
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                {['🥛', '🍌', '🌾'].map((emoji, i) => (
                  <div key={i} style={{ 
                    flex: 1, height: '80px', backgroundColor: 'var(--bg-surface)', 
                    borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px'
                  }}>
                    {emoji}
                  </div>
                ))}
              </div>
            </div>

            {/* Discount Banner */}
            <div style={{
              background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', padding: '20px 24px',
              border: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', gap: '16px',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <Gift size={24} color="#EC4899" />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'var(--fw-bold)', fontSize: '15px' }}>Get 10% off on your first 3 orders</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Use code: <span style={{ color: '#EC4899' }}>HELLO10</span></div>
              </div>
              <span style={{ color: 'var(--text-secondary)' }}>›</span>
            </div>
          </div>
        </div>

        {/* Best Deals Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 'var(--fw-bold)' }}>Best deals for you</h3>
          <span style={{ color: 'var(--border-focus)', fontSize: '14px', fontWeight: 'var(--fw-medium)', cursor: 'pointer' }}>View all</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '24px' }}>
          {[
            { n: 'Premium Tomato', w: '1 kg', p: 28, o: 32, d: '12% OFF', e: '🍅' },
            { n: 'Amul Fresh Milk', w: '500 ml', p: 24, o: 27, d: '11% OFF', e: '🥛' },
            { n: 'Aashirvaad Atta', w: '5 kg', p: 249, o: 310, d: '20% OFF', e: '🌾' },
            { n: 'Banana', w: '1 kg', p: 40, o: 50, d: '20% OFF', e: '🍌' },
          ].map((item, i) => (
            <div key={i} className="hover-elevate" style={{
              backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-xl)', padding: '16px', display: 'flex', gap: '16px',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ 
                width: '72px', height: '72px', backgroundColor: 'var(--bg-surface)', 
                borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px' 
              }}>
                {item.e}
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 'var(--fw-semibold)', lineHeight: 1.2, marginBottom: '4px' }}>{item.n}</h4>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>{item.w}</span>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '16px', fontWeight: 'var(--fw-bold)' }}>₹{item.p}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', textDecoration: 'line-through' }}>₹{item.o}</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                  <span style={{ color: 'var(--color-success)', fontSize: '10px', fontWeight: 'var(--fw-bold)' }}>{item.d}</span>
                  <button className="btn-premium" style={{ 
                    width: '28px', height: '28px', borderRadius: '50%', 
                    background: 'var(--grad-primary)', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)'
                  }}>
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </main>

      {/* ── RIGHT SIDEBAR (CART) ───────────────────────────── */}
      <aside style={{
        backgroundColor: 'var(--bg-card)',
        borderLeft: '1px solid var(--border-divider)',
        padding: '32px 24px',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
      }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'var(--fw-bold)' }}>My Cart (4)</h2>
          <span style={{ color: 'var(--border-focus)', fontSize: '13px', fontWeight: 'var(--fw-medium)', cursor: 'pointer' }}>Clear all</span>
        </div>

        {/* Cart Items List */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '24px' }}>
          {cartItems.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ 
                width: '48px', height: '48px', backgroundColor: 'var(--bg-surface)', 
                borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <ShoppingBag size={24} color="var(--text-secondary)" />
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '14px', fontWeight: 'var(--fw-semibold)', lineHeight: 1.2, marginBottom: '4px' }}>{item.name}</h4>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{item.qty}</div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {item.count === 1 ? (
                    <Trash2 size={16} color="var(--color-error)" style={{ cursor: 'pointer' }} />
                  ) : (
                    <Minus size={16} color="var(--text-secondary)" style={{ cursor: 'pointer' }} />
                  )}
                  <span style={{ fontSize: '14px', fontWeight: 'var(--fw-semibold)' }}>{item.count}</span>
                  <Plus size={16} color="var(--text-secondary)" style={{ cursor: 'pointer' }} />
                </div>
                <div style={{ fontSize: '14px', fontWeight: 'var(--fw-bold)' }}>₹{item.price * item.count}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Checkout Section */}
        <div style={{ borderTop: '1px solid var(--border-divider)', paddingTop: '24px', marginTop: 'auto' }}>
          
          <div style={{ 
            backgroundColor: 'rgba(34, 197, 94, 0.1)', borderRadius: 'var(--radius-lg)', 
            padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' 
          }}>
            <CheckCircle2 color="var(--color-success)" size={20} />
            <div>
              <div style={{ color: 'var(--color-success)', fontWeight: 'var(--fw-semibold)', fontSize: '13px' }}>Wallet Discount Applied</div>
              <div style={{ color: 'var(--color-success)', fontSize: '11px', opacity: 0.8 }}>You saved ₹60</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Item Total</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 'var(--fw-medium)' }}>₹401</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Delivery Fee</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 'var(--fw-medium)' }}>₹15</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Packaging Fee</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 'var(--fw-medium)' }}>₹5</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Wallet Discount</span>
              <span style={{ color: 'var(--color-success)', fontWeight: 'var(--fw-medium)' }}>-₹60</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <span style={{ fontSize: '16px', fontWeight: 'var(--fw-bold)' }}>To Pay</span>
            <span style={{ fontSize: '20px', fontWeight: 'var(--fw-bold)' }}>₹361</span>
          </div>

          <button className="btn-premium hover-elevate" style={{
            width: '100%', padding: '16px', borderRadius: 'var(--radius-lg)',
            background: 'var(--grad-cta)', color: '#fff', fontWeight: 'var(--fw-bold)', fontSize: '16px',
            boxShadow: 'var(--shadow-glow)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'
          }}>
            Checkout <span style={{ fontSize: '18px' }}>→</span>
          </button>
        </div>
      </aside>

    </div>
  );
};

export default Home;
