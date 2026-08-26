const fs = require('fs');
const f = 'src/pages/admin/CategoryManagement.tsx';
let c = fs.readFileSync(f, 'utf8');
c = c.replace(/import \{ Add, \{category\.icon\} \} from 'lucide-react';/, "import { Add } from 'lucide-react';\nimport * as LucideIcons from 'lucide-react';");
c = c.replace(/<\{category\.icon\} className="w-5 h-5" \/>/, "{(() => { const Icon = (LucideIcons as any)[category.icon] || (LucideIcons as any).Folder; return <Icon className=\"w-5 h-5\" />; })()}");
fs.writeFileSync(f, c);
