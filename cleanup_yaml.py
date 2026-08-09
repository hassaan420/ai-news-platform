import os
import re

services = ['news-service', 'category-service', 'search-service', 'scheduler-service', 'admin-service']
base_dir = r'c:\Users\hp\ai-news-platform'

for svc in services:
    file_path = os.path.join(base_dir, svc, 'src', 'main', 'resources', 'application.yml')
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Remove management block
        content = re.sub(r'(?m)^management:.*?$(?:\n[ \t]+.*)*', '', content)
        # Remove hikari block
        content = re.sub(r'(?m)^[ \t]+hikari:.*?$(?:\n[ \t]{6,}.*)*', '', content)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content.strip() + '\n')
        print(f'Cleaned up {svc}')
