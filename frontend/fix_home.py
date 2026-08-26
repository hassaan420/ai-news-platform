import re

with open('src/pages/Home.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update Layout Columns
content = content.replace('className="lg:col-span-8 space-y-12"', 'className="xl:col-span-9 lg:col-span-8 space-y-12"')
content = content.replace('className="hidden lg:block lg:col-span-4 space-y-8 pb-8"', 'className="hidden lg:block xl:col-span-3 lg:col-span-4 sticky top-[104px] h-[calc(100vh-104px)] overflow-y-auto sidebar-scroll space-y-8 pb-8 pr-2"')

# 2. Update Latest Analysis Grid
content = content.replace('className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start"', 'className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start"')

# 3. Move International Headlines below Latest Analysis
intl_start = content.find('          {/* International Headlines */}')
intl_end = content.find('          {/* LATEST ANALYSIS */}')
intl_block = content[intl_start:intl_end]
latest_end = content.find('        {/* RIGHT COLUMN: Sidebar */}')

new_content = content[:intl_start] + content[intl_end:latest_end] + '\n' + intl_block + '\n' + content[latest_end:]

# 4. Remove Infinite Scroll Load More Button
new_content = re.sub(r'\{latestNews && !latestNews\.last && \([\s\S]*?</button>\s*\)\}\s*</div>\s*\)\}', '', new_content)

with open('src/pages/Home.tsx', 'w', encoding='utf-8') as f:
    f.write(new_content)
print('Done!')
