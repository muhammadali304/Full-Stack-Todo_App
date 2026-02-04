/**
 * Message Renderer Component
 *
 * Renders individual chat messages with proper styling and formatting.
 */

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { formatTimestamp } from '../../utils/message_utils';

interface MessageRendererProps {
  message: {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    formattedTimestamp: string;
    displayClass: string;
    status: string;
    hasToolCalls: boolean;
    hasToolCallResults: boolean;
  };
}

export const MessageRenderer: React.FC<MessageRendererProps> = ({ message }) => {
  const isUserMessage = message.role === 'user';
  const isStreaming = message.status === 'streaming';
  const isError = message.status === 'error';

  return (
    <div
      className={`chat-message ${message.displayClass} flex flex-col ${
        isUserMessage ? 'items-end' : 'items-start'
      } mb-4 max-w-[85%]`}
    >
      <div
        className={`${
          isUserMessage
            ? 'bg-green-100 border border-green-200 text-gray-800'
            : 'bg-white border border-gray-200 text-gray-800'
        } rounded-2xl p-4 shadow-sm relative max-w-full break-words`}
      >
        {isError && (
          <div className="text-red-600 font-semibold text-sm mb-1 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Error
          </div>
        )}

        <div className={`${message.hasToolCalls || message.hasToolCallResults ? 'mb-2' : ''}`}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ node, ...props }) => <p className="my-2" {...props} />,
              ul: ({ node, ...props }) => <ul className="my-2 pl-5 list-disc" {...props} />,
              ol: ({ node, ...props }) => <ol className="my-2 pl-5 list-decimal" {...props} />,
              li: ({ node, ...props }) => <li className="my-1" {...props} />,
              code: ({ node, ...props }) => {
                // Check if it's inline code or block code
                const isBlockCode = node?.children?.some((child: any) => child.type === 'text' && child.value.includes('\n'));
                if (isBlockCode) {
                  return (
                    <pre className="bg-gray-800 text-gray-100 p-3 rounded-md my-2 overflow-x-auto">
                      <code {...props} />
                    </pre>
                  );
                }
                return (
                  <code className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded-md font-mono text-sm" {...props} />
                );
              },
              pre: ({ node, ...props }) => (
                <pre className="bg-gray-800 text-gray-100 p-3 rounded-md my-2 overflow-x-auto" {...props} />
              ),
              strong: ({ node, ...props }) => <strong className="font-semibold" {...props} />,
              em: ({ node, ...props }) => <em className="italic" {...props} />,
              blockquote: ({ node, ...props }) => (
                <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600" {...props} />
              ),
              a: ({ node, ...props }) => (
                <a className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />
              )
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>

        {(message.hasToolCalls || message.hasToolCallResults) && (
          <div className="border-t border-dashed border-gray-300 pt-2 mt-2 text-xs text-gray-500 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            {message.hasToolCalls && <span>Using tools</span>}
            {message.hasToolCallResults && message.hasToolCalls && <span className="mx-1">•</span>}
            {message.hasToolCallResults && <span>Tool results</span>}
          </div>
        )}
      </div>

      <div className="text-xs text-gray-500 mt-1 text-right min-w-[60px] flex items-center">
        {message.formattedTimestamp}
        {isStreaming && (
          <span className="ml-1 text-blue-600 font-bold">
            ●
          </span>
        )}
      </div>
    </div>
  );
};