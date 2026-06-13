const fs = require('fs');

let content = fs.readFileSync('src/component/Sidebar.tsx', 'utf8');

// Add imports
content = content.replace(
  "import { FiHome, FiFolder", 
  "import { FiChevronLeft, FiChevronRight, FiHome, FiFolder"
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
  `          <span className="text-slate-900 dark:text-white font-extrabold tracking-[0.12em] text-sm uppercase group-hover:text-[#00d4aa] transition-colors">
            EASYDEV
          </span>`,
  `          {!isCollapsed && (
            <span className="text-slate-900 dark:text-white font-extrabold tracking-[0.12em] text-sm uppercase group-hover:text-[#00d4aa] transition-colors">
              EASYDEV
            </span>
          )}`
);

// Toggle button
content = content.replace(
  `      <div className="flex flex-col px-3 pt-6 gap-0.5 flex-1 overflow-y-auto">`,
  `      {/* Toggle button */}
      <div className="flex justify-end px-3 -mt-3 relative z-10">
        <button onClick={toggleSidebar} className="w-6 h-6 bg-slate-100 dark:bg-white/10 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors border border-slate-200 dark:border-white/10 translate-x-3 hidden md:flex">
          {isCollapsed ? <FiChevronRight className="w-3.5 h-3.5" /> : <FiChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>
      <div className="flex flex-col px-3 pt-4 gap-0.5 flex-1 overflow-y-auto">`
);

// Section Titles
content = content.replace(
  `<span className="text-[10px] font-bold uppercase tracking-[0.14em] px-3 mb-2 text-slate-500 dark:text-slate-400">
          Área do Cliente
        </span>`,
  `{isCollapsed ? (
          <div className="w-full border-b border-slate-200 dark:border-white/10 my-3" />
        ) : (
          <span className="text-[10px] font-bold uppercase tracking-[0.14em] px-3 mb-2 text-slate-500 dark:text-slate-400">
            Área do Cliente
          </span>
        )}`
);

content = content.replace(
  `<span className="text-[10px] font-bold uppercase tracking-[0.14em] px-3 mt-5 mb-2 text-slate-500 dark:text-slate-400">
              Admin
            </span>`,
  `{isCollapsed ? (
              <div className="w-full border-b border-slate-200 dark:border-white/10 mt-5 mb-3" />
            ) : (
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] px-3 mt-5 mb-2 text-slate-500 dark:text-slate-400">
                Admin
              </span>
            )}`
);

// Link text hiding
content = content.replace(
  `<span>{label}</span>`,
  `{!isCollapsed && <span>{label}</span>}`
);
content = content.replace(
  `{label}
                </Link>`,
  `{!isCollapsed && label}
                </Link>`
);

content = content.replace(
  /<Link\n\s*key=\{href\}\n\s*href=\{href\}\n\s*onClick=\{([^}]+)\}\n\s*className=\{`([^`]+)`\}/g,
  `<Link
              key={href}
              href={href}
              onClick={$1}
              className={\`$2 \${isCollapsed ? 'justify-center !px-0' : ''}\`}`
);

// Footer
content = content.replace(
  `<div className="px-3 py-4">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-slate-50 border border-slate-200 dark:bg-white/5 dark:border-white/10">`,
  `<div className="px-3 py-4">
        <div className={\`flex items-center gap-3 py-3 rounded-xl bg-slate-50 border border-slate-200 dark:bg-white/5 dark:border-white/10 \${isCollapsed ? 'flex-col px-0 justify-center' : 'px-3'}\`}>`
);
content = content.replace(
  `<div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{userName || 'Cliente'}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">{isAdmin ? 'Administrador' : 'Área do cliente'}</p>
          </div>`,
  `{!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{userName || 'Cliente'}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{isAdmin ? 'Administrador' : 'Área do cliente'}</p>
            </div>
          )}`
);

// Sidebar wrapper width
content = content.replace(
  `<nav className="hidden md:flex flex-col fixed top-0 left-0 bottom-0 w-64 z-20 bg-white border-r border-slate-200 dark:bg-[#0a0f1e] dark:border-white/10">`,
  `<nav className={\`hidden md:flex flex-col fixed top-0 left-0 bottom-0 z-20 bg-white border-r border-slate-200 dark:bg-[#0a0f1e] dark:border-white/10 transition-[width] duration-300 \${isCollapsed ? 'w-20' : 'w-64'}\`}>`
);


fs.writeFileSync('src/component/Sidebar.tsx', content, 'utf8');

