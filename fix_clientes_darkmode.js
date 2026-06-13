const fs = require('fs');

let file = 'src/app/dev/clientes/page.tsx';
let text = fs.readFileSync(file, 'utf8');

text = text.replace(/style={{ background: '#1e2a4a' }}/g, 'className="bg-slate-200 dark:bg-[#1e2a4a]"');
text = text.replace(/style={{ background: '#1a2035', color: '#00b09b' }}/g, 'className="bg-slate-100 dark:bg-[#1a2035] text-[#00b09b]"');
text = text.replace(/style={{ borderTop: i > 0 \? '1px solid #1a2240' : undefined }}/g, 'className={i > 0 ? "border-t border-slate-200 dark:border-[#1a2240]" : ""}');
text = text.replace(/style={{ background: '#1a2035' }}/g, 'className="bg-slate-100 dark:bg-[#1a2035]"');

// Also replace double classNames
for (let i = 0; i < 5; i++) {
  text = text.replace(/className="([^"]+)"\s+className="([^"]+)"/g, 'className="$1 $2"');
}

fs.writeFileSync(file, text, 'utf8');
console.log('Fixed dev/clientes');
