import ReactMarkdown from 'react-markdown';

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  const imageMap = {};
  if (message.images) message.images.forEach(img => { imageMap[img.place] = img.url; });

  return (
    <div className={`flex items-start gap-3 chat-message-enter ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm ${
        isUser
          ? 'bg-primary text-primary-foreground font-semibold'
          : 'bg-primary/10'
      }`}>
        {isUser ? '👤' : '✈️'}
      </div>

      {/* Bubble */}
      <div className={`max-w-[80%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div className={`px-4 py-3 rounded-2xl shadow-sm text-sm leading-relaxed ${
          isUser
            ? 'bg-primary text-primary-foreground rounded-tr-sm'
            : 'bg-card border border-border text-card-foreground rounded-tl-sm'
        }`}>
          {isUser ? (
            <p>{message.content}</p>
          ) : (
            <>
            <ReactMarkdown
              className="prose prose-sm max-w-none prose-headings:font-semibold prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-li:text-foreground prose-a:text-primary"
              components={{
                h1: ({ children }) => <h1 className="text-lg font-bold mt-4 mb-2 first:mt-0">{children}</h1>,
                h2: ({ children }) => <h2 className="text-base font-semibold mt-3 mb-1.5">{children}</h2>,
                h3: ({ children }) => <h3 className="text-sm font-semibold mt-2 mb-1">{children}</h3>,
                ul: ({ children }) => <ul className="list-disc ml-4 space-y-0.5 my-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal ml-4 space-y-0.5 my-1">{children}</ol>,
                li: ({ children }) => <li className="text-sm">{children}</li>,
                p: ({ children }) => <p className="my-1">{children}</p>,
                hr: () => <hr className="my-3 border-border" />,
                strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-2 border-primary/40 pl-3 my-2 text-muted-foreground italic">
                    {children}
                  </blockquote>
                ),
                a: ({ href, children }) => {
                  const linkText = typeof children === 'string' ? children : (Array.isArray(children) ? children.join('') : '');
                  const imgUrl = imageMap[linkText];
                  return (
                    <>
                      <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 hover:opacity-70">{children}</a>
                      {imgUrl && (
                        <img src={imgUrl} alt={linkText} className="block w-full max-w-[240px] h-28 object-cover rounded-lg my-2" />
                      )}
                    </>
                  );
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
            </>
          )}
        </div>
        <span className="text-xs text-muted-foreground px-1">
          {message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
        </span>
      </div>
    </div>
  );
}