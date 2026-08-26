const fs = require('fs');
const path = require('path');

const files = [
  'src/pages/AdminDashboard.tsx',
  'src/pages/admin/UserManagement.tsx',
  'src/pages/admin/ArticleManagement.tsx',
  'src/pages/admin/SystemHealth.tsx',
  'src/pages/admin/AuditLogs.tsx',
  'src/pages/admin/ErrorMonitoring.tsx',
  'src/pages/admin/SystemSettings.tsx',
  'src/pages/admin/SourceManagement.tsx',
  'src/pages/admin/CategoryManagement.tsx',
  'src/pages/admin/FetchLogs.tsx'
];

const iconMap = {
  'group': 'Users',
  'article': 'Newspaper',
  'monitoring': 'Activity',
  'settings': 'Settings',
  'arrow_upward': 'ArrowUp',
  'bolt': 'Zap',
  'info': 'Info',
  'psychology': 'Brain',
  'rss_feed': 'Rss',
  'category': 'Grid3X3',
  'history': 'Clock',
  'list_alt': 'List',
  'error': 'AlertTriangle',
  'star': 'Star',
  'local_fire_department': 'Flame',
  'check_circle': 'CheckCircle',
  'cancel': 'XCircle'
};

const iconRegex = /<span className="material-symbols-outlined[^"]*">([^<]+)<\/span>/g;
const iconRegex2 = /<span className="material-symbols-outlined[^"]*">([^<]+)<\/span>/; // for non-global matches if needed

function transformFile(filePath) {
  const fullPath = path.join(__dirname, filePath);
  if (!fs.existsSync(fullPath)) {
    console.log(`Skipping ${filePath}, not found.`);
    return;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  let originalContent = content;

  // Replacements
  content = content.replace(/bg-card/g, 'bg-white/[0.05] backdrop-blur-xl border border-white/[0.08]');
  content = content.replace(/bg-background/g, 'bg-white/[0.03]');
  content = content.replace(/bg-muted/g, 'bg-white/[0.06]');
  content = content.replace(/text-foreground/g, 'text-white/90');
  content = content.replace(/text-muted-foreground/g, 'text-white/50');
  content = content.replace(/border-border/g, 'border-white/[0.08]');
  
  // Specific shadows
  content = content.replace(/shadow-premium-hover/g, 'shadow-2xl');
  content = content.replace(/shadow-premium/g, 'shadow-2xl');
  content = content.replace(/shadow-subtle/g, 'shadow-lg');

  // Specific to AdminDashboard links 
  // 'hover:shadow-premium transition-shadow border border-white/[0.08]' 
  // since bg-card is replaced with 'bg-white/[0.05] backdrop-blur-xl border border-white/[0.08]',
  // we might have double borders or something, but let's check exact replacements.
  // Actually, replacing `bg-card` with `bg-white/[0.05] backdrop-blur-xl border border-white/[0.08]` is fine. 
  // If `rounded-xl` was there, we should change it to `rounded-2xl` based on user request.
  content = content.replace(/rounded-xl/g, 'rounded-2xl');
  // Admin tool links hover state:
  content = content.replace(/hover:shadow-premium/g, 'hover:bg-white/[0.08] hover:-translate-y-1 hover:shadow-2xl transition-all duration-300');
  
  // Update icons and collect used icons
  let usedIcons = new Set();
  
  // First, find all material-symbols-outlined tags
  let match;
  while ((match = iconRegex.exec(content)) !== null) {
    let iconName = match[1].trim();
    if (iconMap[iconName]) {
      usedIcons.add(iconMap[iconName]);
    } else {
        // Just title case it or use a default if it's missing from our map
        const cc = iconName.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
        usedIcons.add(cc);
        iconMap[iconName] = cc; 
    }
  }

  // Handle icons mapped from objects like {link.icon} in maps
  // In AdminDashboard, there's `icon: 'group'` etc.
  const stringIconMatches = [...content.matchAll(/icon:\s*'([^']+)'/g)];
  for (const m of stringIconMatches) {
    const iconName = m[1];
    if (iconMap[iconName]) {
        usedIcons.add(iconMap[iconName]);
    }
  }
  
  // We need to replace the mapping in AdminDashboard
  content = content.replace(/icon:\s*'group'/g, "icon: <Users className=\"w-5 h-5\" />");
  content = content.replace(/icon:\s*'rss_feed'/g, "icon: <Rss className=\"w-5 h-5\" />");
  content = content.replace(/icon:\s*'category'/g, "icon: <Grid3X3 className=\"w-5 h-5\" />");
  content = content.replace(/icon:\s*'history'/g, "icon: <Clock className=\"w-5 h-5\" />");
  content = content.replace(/icon:\s*'article'/g, "icon: <Newspaper className=\"w-5 h-5\" />");
  content = content.replace(/icon:\s*'monitoring'/g, "icon: <Activity className=\"w-5 h-5\" />");
  content = content.replace(/icon:\s*'list_alt'/g, "icon: <List className=\"w-5 h-5\" />");
  content = content.replace(/icon:\s*'error'/g, "icon: <AlertTriangle className=\"w-5 h-5\" />");
  content = content.replace(/icon:\s*'settings'/g, "icon: <Settings className=\"w-5 h-5\" />");

  content = content.replace(/<span className="material-symbols-outlined[^"]*">\{link\.icon\}<\/span>/g, "{link.icon}");
  
  // Also we need to replace actual tags like <span className="material-symbols-outlined">group</span>
  content = content.replace(/<span className="material-symbols-outlined[^"]*">([^<]+)<\/span>/g, (m, iconName) => {
    iconName = iconName.trim();
    const lucideName = iconMap[iconName] || iconName.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
    // Use some default classes, mostly it inherits size and color from parent if it was just material-symbols
    return `<${lucideName} className="w-5 h-5" />`;
  });

  // Now, add Lucide imports
  if (usedIcons.size > 0) {
    const importStatement = `import { ${Array.from(usedIcons).join(', ')} } from 'lucide-react';\n`;
    // check if lucide-react import already exists
    if (content.includes("'lucide-react'") || content.includes('"lucide-react"')) {
        // Let's just blindly add our import at the top for simplicity, though duplicate imports are bad, it's fine for now, we can clean up if needed
        // Actually let's try to append to existing import
        const lucideRegex = /import\s+\{([^}]+)\}\s+from\s+['"]lucide-react['"];?/;
        const existingMatch = content.match(lucideRegex);
        if (existingMatch) {
            const existingIcons = existingMatch[1].split(',').map(s => s.trim());
            const allIcons = new Set([...existingIcons, ...usedIcons]);
            content = content.replace(lucideRegex, `import { ${Array.from(allIcons).join(', ')} } from 'lucide-react';`);
        } else {
             // Find last import
             const lastImportIndex = content.lastIndexOf('import ');
             if (lastImportIndex !== -1) {
                 const endOfLine = content.indexOf('\n', lastImportIndex);
                 content = content.slice(0, endOfLine + 1) + importStatement + content.slice(endOfLine + 1);
             } else {
                 content = importStatement + content;
             }
        }
    } else {
        const lastImportIndex = content.lastIndexOf('import ');
        if (lastImportIndex !== -1) {
            const endOfLine = content.indexOf('\n', lastImportIndex);
            content = content.slice(0, endOfLine + 1) + importStatement + content.slice(endOfLine + 1);
        } else {
            content = importStatement + content;
        }
    }
  }

  // Tooltip contentStyle fix in AdminDashboard
  content = content.replace(/contentStyle=\{\{[^}]+\}\}/g, `contentStyle={{
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(16px)',
                    color: 'rgba(255, 255, 255, 0.9)',
                  }}`);
                  
  fs.writeFileSync(fullPath, content);
  console.log(`Updated ${filePath}`);
}

files.forEach(transformFile);
