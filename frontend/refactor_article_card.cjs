const fs = require('fs');

let content = fs.readFileSync('src/components/ArticleCard.tsx', 'utf-8');

const newBody = 
\      {/* Card body */}
      <div className="p-5 flex flex-col flex-1">
        {/* Category / Source */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[12px] font-bold text-primary tracking-wider uppercase">{article.category}</span>
          <span className="text-[12px] text-muted-theme/40">•</span>
          <div className="flex items-center gap-1.5">
            <img
              src={\https://www.google.com/s2/favicons?domain=\&sz=16\}
              alt=""
              className="w-3.5 h-3.5 object-contain rounded-sm opacity-70"
              onError={(e) => e.currentTarget.style.display = 'none'}
            />
            <span className="font-sans text-[12px] font-medium text-secondary-theme">{article.source?.name}</span>
          </div>
        </div>

        {/* Title */}
        <Link to={\/news/\\} className="block mb-2.5">
          <h3 className="font-serif text-[20px] leading-[1.3] text-heading-theme group-hover:text-primary transition-colors line-clamp-2 font-bold tracking-tight">
            {article.title}
          </h3>
        </Link>

        {/* Description */}
        <p className="font-sans text-[14px] leading-relaxed text-secondary-theme mb-5 line-clamp-2">
          {article.summary || article.description}
        </p>

        {/* Footer: Date + Metadata + Action */}
        <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <time className="font-sans text-[12px] font-medium text-muted-theme" dateTime={article.publishedAt}>
              {formattedDate}
            </time>
            {article.sentiment && (
              <span className={\	ext-[11px] font-medium px-2 py-0.5 rounded-md \\}>
                {article.sentiment}
              </span>
            )}
          </div>
          
          <motion.button 
            whileTap={{ scale: 0.88 }}
            animate={isSaved ? { scale: [1, 1.25, 1] } : {}}
            transition={{ duration: 0.25 }}
            className={\	ransition-colors p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 \\}
            onClick={handleSave} 
            aria-label={isSaved ? "Unsave article" : "Save article"}
          >
            {isSaved ? <BookmarkCheck className="w-4.5 h-4.5 block" /> : <BookmarkPlus className="w-4.5 h-4.5 block" />}
          </motion.button>
        </div>
      </div>
    </motion.article>\;

const bodyStart = content.indexOf('      {/* Card body */}');
content = content.substring(0, bodyStart) + newBody + '\n  );\n}\n';

content = content.replace(/\{\/\* Category badge over image \*\/\}[\s\S]*?<\/div>/, '');

fs.writeFileSync('src/components/ArticleCard.tsx', content, 'utf-8');
console.log('ArticleCard updated.');
