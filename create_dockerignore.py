import os

ignore_content = """
target/
!.mvn/wrapper/maven-wrapper.jar
!target/*.jar
*~
*.swp
.git
.idea
.vscode
.env
"""

services = ['auth-service', 'news-service', 'category-service', 'search-service', 'scheduler-service', 'admin-service', 'gateway-service', 'frontend', 'common-library']
base_dir = r'c:\Users\hp\ai-news-platform'

for svc in services:
    file_path = os.path.join(base_dir, svc, '.dockerignore')
    content = ignore_content
    if svc == 'frontend':
        content += "node_modules/\ndist/\n"
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content.strip() + '\n')
    print(f'Created .dockerignore in {svc}')
