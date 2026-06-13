const fs = require('fs');

let content = fs.readFileSync('src/component/DevSidebar.tsx', 'utf8');

// Add imports
content = content.replace(
  "FiGrid, FiLayers, FiMessageSquare, FiUsers,", 
  "FiChevronLeft, FiChevronRight, FiGrid, FiLayers, FiMessageSquare, FiUsers,"
);

// Add state & effects
content = content.replace(
  "const [mobileOpen, setMobileOpen] = useState(false);",
  `const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('sidebarCollapsed');
      if (stored !== null) setIsCollapsed(stored === 'true');
      else localStorage.setItem('sidebarCollapsed', 'true');
    }
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-width', isCollapsed ? '5rem' : '16rem');
  }, [isCollapsed]);

  const toggleSidebar = () => {
    const val = !isCollapsed;
    setIsCollapsed(val);
    localStorage.setItem('sidebarCollapsed', String(val));
  };`
);

// Logo section
content = content.replace(
  `          <div className="text-center">
            <span className="text-white font-extrabold tracking-[0.12em] text-sm uppercase group-hover:text-[#00d4aa] transition-colors">
              EASYDEV
            </span>
            <div className="flex items-center justify-center gap-1 mt-0.5">
              <FiCode className="w-2.5 h-2.5" style={{ color: '#00b09b' }} />
              <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: '#00b09b' }}>
                Dev Panel
              </span>
            </div>
          </div>`,
  `          {!isCollapsed && (
            <div className="text-center">
              <span className="text-white font-extrabold tracking-[0.12em] text-sm uppercase group-hover:text-[#00d4aa] transition-colors">
                EASYDEV
              </span>
              <div className="flex items-center justify-center gap-1 mt-0.5">
                <FiCode className="w-2.5 h-2.5" style={{ color: '#00b09b' }} />
                <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: '#00b09b' }}>
                  Dev Panel
                </span>
              </div>
            </div>
          )}`
);

// Toggle button & Section titles
content = content.replace(
  `      {/* Nav */}
      <div className="flex flex-col px-3 pt-6 gap-0.5 flex-1 overflow-y-auto">`,
  `      {/* Toggle button */}
      <div className="flex justify-end px-3 -mt-3 relative z-10">
        <button onClick={toggleSidebar} className="w-6 h-6 rounded-full flex items-center justify-center transition-colors hidden md:flex" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
          {isCollapsed ? <FiChevronRight className="w-3.5 h-3.5" /> : <FiChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>
      <div className="flex flex-col px-3 pt-4 gap-0.5 flex-1 overflow-y-auto">`
);

content = content.replace(
  `<span className="text-[10px] font-bold uppercase tracking-[0.14em] px-3 mb-2" style={{ color: '#475569' }}>
          Desenvolvimento
        </span>`,
  `{isCollapsed ? (
          <div className="w-full border-b my-3" style={{ borderColor: 'rgba(255,255,255,0.1)' }} />
        ) : (
          <span className="text-[10px] font-bold uppercase tracking-[0.14em] px-3 mb-2" style={{ color: '#475569' }}>
            Desenvolvimento
          </span>
        )}`
);

content = content.replace(
  `<span className="text-[10px] font-bold uppercase tracking-[0.14em] px-3 mt-5 mb-2" style={{ color: '#475569' }}>
          Sistema
        </span>`,
  `{isCollapsed ? (
          <div className="w-full border-b mt-5 mb-3" style={{ borderColor: 'rgba(255,255,255,0.1)' }} />
        ) : (
          <span className="text-[10px] font-bold uppercase tracking-[0.14em] px-3 mt-5 mb-2" style={{ color: '#475569' }}>
            Sistema
          </span>
        )}`
);

// Link texts
content = content.replace(
  /<span>\{label\}<\/span>/g,
  `{!isCollapsed && <span>{label}</span>}`
);
content = content.replace(
  /\{label\}\n\s*<\/Link>/g,
  `{!isCollapsed && label}
            </Link>`
);

content = content.replace(
  /className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group"/g,
  `className={\`flex items-center gap-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group \${isCollapsed ? 'px-0 justify-center' : 'px-3'}\`}`
);

// Switch to client view button
content = content.replace(
  `            <FiUsers className="w-3.5 h-3.5" />
            Ver área do cliente
          </Link>`,
  `            <FiUsers className="w-3.5 h-3.5" />
            {!isCollapsed && "Ver área do cliente"}
          </Link>`
);

// Footer
content = content.replace(
  `          className="flex items-center gap-3 px-3 py-3 rounded-xl"`,
  `          className={\`flex items-center gap-3 py-3 rounded-xl \${isCollapsed ? 'flex-col px-0 justify-center' : 'px-3'}\`}`
);
content = content.replace(
  `          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">{userName || 'Developer'}</p>
            <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>Admin</p>
          </div>`,
  `          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{userName || 'Developer'}</p>
              <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>Admin</p>
            </div>
          )}`
);

// Wrapper width
content = content.replace(
  `        className="fixed top-0 left-0 h-full w-64 z-40 hidden md:block"`,
  `        className={\`fixed top-0 left-0 h-full z-40 hidden md:block transition-[width] duration-300 \${isCollapsed ? 'w-20' : 'w-64'}\`}`
);

fs.writeFileSync('src/component/DevSidebar.tsx', content, 'utf8');

