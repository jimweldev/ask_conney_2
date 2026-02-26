import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

const MarkdownRenderer = ({ text }: { text: string }) => {
  const components: Components = {
    h1: ({ children }) => (
      <h1 className="mt-4 mb-3 text-xl font-bold">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="mt-3 mb-2 text-lg font-semibold">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-3 mb-2 font-semibold">{children}</h3>
    ),
    p: ({ children }) => <p className="mb-3 leading-relaxed">{children}</p>,
    strong: ({ children }) => (
      <strong className="font-semibold">{children}</strong>
    ),
    em: ({ children }) => <em className="italic">{children}</em>,
    ul: ({ children }) => (
      <ul className="mb-3 ml-6 list-disc space-y-1">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="mb-3 ml-6 list-decimal space-y-1">{children}</ol>
    ),
    li: ({ children }) => {
      const hasNestedList =
        Array.isArray(children) &&
        children.some(
          child =>
            typeof child === 'object' &&
            child !== null &&
            'type' in child &&
            (child.type === 'ul' || child.type === 'ol'),
        );

      return (
        <li className={`${hasNestedList ? 'mb-2' : ''} pl-1`}>{children}</li>
      );
    },
    blockquote: ({ children }) => (
      <blockquote className="my-3 border-l-4 border-gray-300 pl-4 italic">
        {children}
      </blockquote>
    ),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- missing types
    code: ({ inline, children, ...props }: any) =>
      inline ? (
        <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-sm">
          {children}
        </code>
      ) : (
        <code
          className="block overflow-x-auto rounded-lg bg-gray-900 p-4 font-mono text-sm"
          {...props}
        >
          {children}
        </code>
      ),
    a: ({ children, href }) => (
      <a
        href={href}
        className="text-blue-500 underline hover:text-blue-600"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
    hr: () => <hr className="my-4 border-gray-300" />,
    table: ({ children }) => (
      <div className="my-4 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-300">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => <thead className="bg-gray-50">{children}</thead>,
    tbody: ({ children }) => (
      <tbody className="divide-y divide-gray-200">{children}</tbody>
    ),
    tr: ({ children }) => <tr>{children}</tr>,
    th: ({ children }) => (
      <th className="px-4 py-2 text-left text-sm font-semibold">{children}</th>
    ),
    td: ({ children }) => <td className="px-4 py-2 text-sm">{children}</td>,
  };

  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {text}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;
