interface NewsArticle {
  title: string;
  url: string;
  urlToImage?: string;
  description?: string;
}

interface NewsProps {
  articles: NewsArticle[];
}

export default function NewsCard({ articles }: NewsProps) {
  return (
    <div className="mt-8 w-full max-w-4xl">
      <h2 className="text-2xl font-bold text-white mb-4">📰 Latest Weather News</h2>
      <div className="grid md:grid-cols-2 gap-6">
        {articles.map((article, i) => (
          <a
            key={i}
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg overflow-hidden hover:scale-105 transition-transform"
          >
            {article.urlToImage && (
              <img src={article.urlToImage} alt={article.title} className="w-full h-40 object-cover" />
            )}
            <div className="p-4">
              <h3 className="text-lg font-semibold">{article.title}</h3>
              {article.description && <p className="text-sm text-gray-600 mt-2">{article.description}</p>}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
