import { ExternalLink, Bookmark, Share2 } from 'lucide-react';

const ResultCard = ({ title, description, source, category, icon: Icon, gradient }) => {
  return (
    <article className="group glass-panel glass-panel-hover rounded-2xl p-6 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {/* Icon */}
          {Icon && (
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient || 'from-primary to-primary-dark'}
                            flex items-center justify-center flex-shrink-0
                            group-hover:scale-110 transition-transform duration-300`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
          )}

          {/* Category Badge */}
          {category && (
            <span className="px-3 py-1 rounded-full text-xs font-medium
                           bg-primary/10 text-primary border border-primary/20">
              {category}
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            className="p-2 rounded-lg hover:bg-white/[0.05] transition-colors"
            aria-label="Bookmark"
          >
            <Bookmark className="w-4 h-4 text-dark-muted" />
          </button>
          <button
            className="p-2 rounded-lg hover:bg-white/[0.05] transition-colors"
            aria-label="Share"
          >
            <Share2 className="w-4 h-4 text-dark-muted" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-dark-text mb-3 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-dark-muted text-sm leading-relaxed line-clamp-3">
          {description}
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/[0.05]">
        {source && (
          <span className="text-xs text-dark-muted flex items-center space-x-1">
            <ExternalLink className="w-3 h-3" />
            <span>{source}</span>
          </span>
        )}
        <button className="text-xs text-primary hover:text-primary-light font-medium transition-colors">
          Learn more →
        </button>
      </div>
    </article>
  );
};

export default ResultCard;
