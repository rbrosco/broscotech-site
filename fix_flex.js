const fs = require('fs');

['src/app/dev/clientes/page.tsx', 'src/app/dev/comunicacao/page.tsx'].forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(
    'className="flex-1 flex flex-col min-w-0"',
    'className="flex-1 flex flex-col min-w-0 md:pl-[var(--sidebar-width,5rem)] transition-[padding] duration-300"'
  );
  fs.writeFileSync(file, content, 'utf8');
});
