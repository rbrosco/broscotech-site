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
  let text = fs.readFileSync(file, 'utf8');

  // Fix multiple classNames in the same line/tag
  for (let i = 0; i < 10; i++) {
    text = text.replace(/className="([^"]+)"\s+className="([^"]+)"/g, 'className="$1 $2"');
    text = text.replace(/className={`([^}]+)`}\s+className="([^"]+)"/g, 'className={`$1 $2`}');
    text = text.replace(/className="([^"]+)"\s+className={`([^}]+)`}/g, 'className={`$1 $2`}');
  }

  // Also in dev/clientes there was:
  // className="flex items-center gap-4 px-4 py-3" className={i > 0 ? "border-t border-slate-200 dark:border-[#1a2240]" : ""}
  for (let i = 0; i < 5; i++) {
    text = text.replace(/className="([^"]+)"\s+className={([^}]+)}/g, 'className={`$1 ${$2}`}');
  }

  fs.writeFileSync(file, text, 'utf8');
});
console.log('Fixed multiple classNames');
