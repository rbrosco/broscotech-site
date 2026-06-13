const fs = require('fs');

const files = [
  'src/app/dev/page.tsx',
  'src/app/dev/comunicacao/page.tsx',
  'src/app/dev/kanban/page.tsx',
  'src/app/dev/clientes/page.tsx',
  'src/component/DevSidebar.tsx'
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');

  // Hardcoded colors to Tailwind classes
  
  // Backgrounds
  content = content.replace(/style={{ background: '#0a0f1e' }}/g, '');
  content = content.replace(/className="([^"]+)" style={{ background: '#0a0f1e' }}/g, 'className="$1 bg-slate-50 dark:bg-[#0a0f1e]"');
  content = content.replace(/className="flex h-screen overflow-hidden"\s+style={{ background: '#0a0f1e' }}/g, 'className="flex h-screen overflow-hidden bg-slate-50 dark:bg-[#0a0f1e]"');
  
  content = content.replace(/className="([^"]+)"\s+style={{ background: '#0d1224', border: '1px solid #1e2a4a' }}/g, 'className="$1 bg-white dark:bg-[#0d1224] border border-slate-200 dark:border-[#1e2a4a]"');
  content = content.replace(/className="([^"]+)"\s+style={{ background: '#1a2035', border: '1px solid #2a3555' }}/g, 'className="$1 bg-slate-50 dark:bg-[#1a2035] border border-slate-200 dark:border-[#2a3555]"');
  content = content.replace(/className="([^"]+)"\s+style={{ background: '#1a2035', border: '1px solid #2a3555', color: '#00b09b' }}/g, 'className="$1 bg-slate-50 dark:bg-[#1a2035] border border-slate-200 dark:border-[#2a3555] text-[#00b09b]"');
  
  content = content.replace(/className="([^"]+)"\s+style={{ background: '#0a0f1e', border: '1px solid #1a2240' }}/g, 'className="$1 bg-white dark:bg-[#0a0f1e] border border-slate-200 dark:border-[#1a2240]"');
  content = content.replace(/className="([^"]+)"\s+style={{ background: '#1a2035', border: '1px solid #2a3555', minHeight: 100 }}/g, 'className="$1 bg-slate-50 dark:bg-[#1a2035] border border-slate-200 dark:border-[#2a3555] min-h-[100px]"');
  
  // DevSidebar Backgrounds
  content = content.replace(/style={{ background: '#080c18' }}/g, '');
  content = content.replace(/className="flex flex-col h-full relative" style={{ background: '#080c18' }}/g, 'className="flex flex-col h-full relative bg-slate-50 dark:bg-[#080c18]"');
  content = content.replace(/className="flex flex-col h-full relative"\s+style={{ background: '#080c18' }}/g, 'className="flex flex-col h-full relative bg-slate-50 dark:bg-[#080c18]"');
  
  // DevSidebar specific classes
  content = content.replace(/style={{ borderBottom: '1px solid rgba\(255,255,255,0.07\)' }}/g, 'className="border-b border-slate-200 dark:border-white/10"');
  content = content.replace(/className="flex flex-col items-center pt-8 pb-6 px-5"\s+style={{ borderBottom: '1px solid rgba\(255,255,255,0.07\)' }}/g, 'className="flex flex-col items-center pt-8 pb-6 px-5 border-b border-slate-200 dark:border-white/10"');
  content = content.replace(/className="text-white font-extrabold/g, 'className="text-slate-900 dark:text-white font-extrabold');
  
  content = content.replace(/style={{ borderColor: 'rgba\(255,255,255,0.1\)' }}/g, 'className="border-slate-200 dark:border-white/10"');
  content = content.replace(/className="mx-4 mb-2 border-b"\s+style={{ borderColor: 'rgba\(255,255,255,0.1\)' }}/g, 'className="mx-4 mb-2 border-b border-slate-200 dark:border-white/10"');
  content = content.replace(/className="mx-4 mt-4 mb-2 border-b"\s+style={{ borderColor: 'rgba\(255,255,255,0.1\)' }}/g, 'className="mx-4 mt-4 mb-2 border-b border-slate-200 dark:border-white/10"');
  
  content = content.replace(/style={{ color: '#475569' }}/g, 'className="text-slate-500"');
  content = content.replace(/className="text-\[10px\] font-bold uppercase tracking-\[0.14em\] px-6 mb-2"\s+style={{ color: '#475569' }}/g, 'className="text-[10px] font-bold uppercase tracking-[0.14em] px-6 mb-2 text-slate-500"');
  content = content.replace(/className="text-\[10px\] font-bold uppercase tracking-\[0.14em\] px-6 mt-5 mb-2"\s+style={{ color: '#475569' }}/g, 'className="text-[10px] font-bold uppercase tracking-[0.14em] px-6 mt-5 mb-2 text-slate-500"');
  
  content = content.replace(/style={{\s*background: active \? 'rgba\(0,176,155,0.12\)' : 'transparent',\s*color: active \? '#00d4aa' : 'rgba\(255,255,255,0.55\)',\s*borderLeft: `2px solid \${active \? '#00b09b' : 'transparent'}`,?\s*}}/g, '');
  content = content.replace(/style={{\s*background: active \? 'rgba\(0,74,173,0.15\)' : 'transparent',\s*color: active \? '#60a5fa' : 'rgba\(255,255,255,0.55\)',\s*borderLeft: `2px solid \${active \? '#004aad' : 'transparent'}`,?\s*}}/g, '');
  
  // To avoid breaking the complex JS conditions for links, let's target the exact link tags in DevSidebar
  // Actually, I can just write a separate pass for those if they're broken.

  content = content.replace(/className="text-white/g, 'className="text-slate-900 dark:text-white');
  content = content.replace(/className="text-xs font-bold text-white/g, 'className="text-xs font-bold text-slate-900 dark:text-white');
  content = content.replace(/text-gray-400/g, 'text-slate-500 dark:text-gray-400');
  content = content.replace(/text-gray-500/g, 'text-slate-400 dark:text-gray-500');
  content = content.replace(/text-gray-200/g, 'text-slate-700 dark:text-gray-200');
  
  content = content.replace(/style={{ borderColor: '#1e2a4a' }}/g, '');
  content = content.replace(/className="px-5 py-3 border-b"\s+style={{ borderColor: '#1e2a4a' }}/g, 'className="px-5 py-3 border-b border-slate-200 dark:border-[#1e2a4a]"');

  content = content.replace(/className="([^"]+)"\s+style={{ background: 'rgba\(239,68,68,0.1\)', border: '1px solid rgba\(239,68,68,0.2\)' }}/g, 'className="$1 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20"');

  // DevSidebar link active fix
  content = content.replace(/className={`flex items-center gap-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group mx-3 \${([^}]+)}`}/g, 'className={`flex items-center gap-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group mx-3 border-l-2 ${$1} ${active ? "bg-[#00b09b]/10 text-[#00b09b] dark:text-[#00d4aa] border-[#00b09b]" : "border-transparent text-slate-600 dark:text-white/55 hover:bg-slate-50 dark:hover:bg-white/5"}`}')
  
  // DevSidebar user footer
  content = content.replace(/style={{ background: 'rgba\(255,255,255,0.04\)', border: '1px solid rgba\(255,255,255,0.07\)' }}/g, 'className="bg-slate-50 border border-slate-200 dark:bg-white/5 dark:border-white/10"');
  content = content.replace(/className={`flex items-center gap-2 py-2 rounded-xl text-xs font-semibold transition \${([^}]+)}`}\s*style={{ background: 'rgba\(255,255,255,0.04\)', color: 'rgba\(255,255,255,0.4\)', border: '1px solid rgba\(255,255,255,0.07\)' }}/g, 'className={`flex items-center gap-2 py-2 rounded-xl text-xs font-semibold transition border ${$1} bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 dark:bg-white/5 dark:text-white/40 dark:border-white/10 dark:hover:bg-white/10`}')
  content = content.replace(/className={`flex items-center rounded-xl transition-all \${([^}]+)}`}\s*className="bg-slate-50 border border-slate-200 dark:bg-white\/5 dark:border-white\/10"/g, 'className={`flex items-center rounded-xl transition-all border ${$1} bg-slate-50 border-slate-200 dark:bg-white/5 dark:border-white/10`}')

  // Kanban / Clientes specific backgrounds
  content = content.replace(/style={{ minHeight: '100vh', background: '#080c18' }}/g, 'className="min-h-screen bg-slate-50 dark:bg-[#080c18]"');
  content = content.replace(/<div\s+className="min-h-screen bg-slate-50 dark:bg-\[#080c18\]">/g, '<div className="min-h-screen bg-slate-50 dark:bg-[#080c18]">');
  content = content.replace(/<div\s+style={{ minHeight: '100vh', background: '#080c18' }}>/g, '<div className="min-h-screen bg-slate-50 dark:bg-[#080c18]">');

  fs.writeFileSync(file, content, 'utf8');
});
console.log('Processed lightmode fixes.');
