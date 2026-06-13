const fs = require('fs');

function processFile(filename) {
  if (!fs.existsSync(filename)) return;
  let text = fs.readFileSync(filename, 'utf8');

  // Replace text-white with text-slate-900 dark:text-white
  text = text.replace(/text-white(?!(\/|\]))/g, 'text-slate-900 dark:text-white');
  
  // Replace white/opacity with slate/white
  text = text.replace(/rgba\(255,255,255,0\.4\)/g, 'rgba(156, 163, 175, 0.8)'); // Or just replace the styles
  
  // Let's use specific replacements for Kanban
  text = text.replace(/style={{ background: 'rgba\(255,255,255,0\.06\)', border: '1px solid rgba\(255,255,255,0\.1\)', color: 'white', minWidth: '220px' }}/g, 'className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 min-w-[220px]"');
  
  text = text.replace(/style={{ background: '#111827', border: '1px solid rgba\(255,255,255,0\.1\)', boxShadow: '0 8px 24px rgba\(0,0,0,0\.4\)' }}/g, 'className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/10 shadow-xl"');
  
  text = text.replace(/style={{ borderBottom: '1px solid rgba\(255,255,255,0\.05\)' }}/g, 'className="border-b border-slate-200 dark:border-white/5"');
  
  text = text.replace(/style={{ width: '272px', background: 'rgba\(255,255,255,0\.03\)', border: '1px solid rgba\(255,255,255,0\.07\)' }}/g, 'className="w-[272px] bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.07]"');
  
  text = text.replace(/style={{ background: 'rgba\(255,255,255,0\.05\)', border: '1px solid rgba\(255,255,255,0\.08\)' }}/g, 'className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/[0.08]"');
  
  text = text.replace(/style={{ borderTop: '1px solid rgba\(255,255,255,0\.05\)' }}/g, 'className="border-t border-slate-200 dark:border-white/5"');
  
  text = text.replace(/style={{ background: 'rgba\(255,255,255,0\.06\)', border: '1px solid rgba\(255,255,255,0\.08\)' }}/g, 'className="bg-slate-50 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08]"');
  
  text = text.replace(/style={{ background: 'rgba\(255,255,255,0\.04\)', border: '1px dashed rgba\(255,255,255,0\.12\)' }}/g, 'className="bg-slate-50 dark:bg-white/[0.04] border border-slate-200 border-dashed dark:border-white/[0.12]"');
  
  text = text.replace(/style={{ color: 'rgba\(255,255,255,0\.4\)' }}/g, 'className="text-slate-500 dark:text-white/40"');
  text = text.replace(/style={{ color: 'rgba\(255,255,255,0\.3\)' }}/g, 'className="text-slate-400 dark:text-white/30"');
  
  // Remove duplicate classNames that were just injected if the element already had a className
  // E.g. <div className="..." className="..."> -> merge them.
  // A simple way is to replace `className="([^"]+)"\s+className="([^"]+)"` with `className="$1 $2"`
  for (let i = 0; i < 5; i++) {
    text = text.replace(/className="([^"]+)"\s+className="([^"]+)"/g, 'className="$1 $2"');
  }

  // Also replace some dev/page.tsx specific ones:
  text = text.replace(/style={{ background: 'rgba\(255,255,255,0\.05\)' }}/g, 'className="bg-slate-50 dark:bg-white/5"');
  text = text.replace(/style={{ borderTop: '1px solid rgba\(255,255,255,0\.08\)' }}/g, 'className="border-t border-slate-200 dark:border-white/[0.08]"');
  
  fs.writeFileSync(filename, text, 'utf8');
}

['src/app/dev/kanban/page.tsx', 'src/app/dev/page.tsx', 'src/app/dev/clientes/page.tsx'].forEach(processFile);
console.log('Done');
