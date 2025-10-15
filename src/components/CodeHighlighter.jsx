import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

const CodeHighlighter = ({ text, className = "" }) => {
  // 正则表达式匹配代码块
  const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g;

  // 分割文本和代码块
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    // 添加代码块前的文本
    if (match.index > lastIndex) {
      const textPart = text.slice(lastIndex, match.index);
      if (textPart.trim()) {
        parts.push({
          type: "text",
          content: textPart,
        });
      }
    }

    // 添加代码块
    const language = match[1] || "text";
    const code = match[2].trim();
    parts.push({
      type: "code",
      language: language,
      content: code,
    });

    lastIndex = match.index + match[0].length;
  }

  // 添加最后一部分文本
  if (lastIndex < text.length) {
    const textPart = text.slice(lastIndex);
    if (textPart.trim()) {
      parts.push({
        type: "text",
        content: textPart,
      });
    }
  }

  // 如果没有找到代码块，直接返回原文本
  if (parts.length === 0) {
    return (
      <div
        className={className}
        dangerouslySetInnerHTML={{ __html: text.replace(/\n/g, "<br>") }}
      />
    );
  }

  return (
    <div className={className}>
      {parts.map((part, index) => {
        if (part.type === "text") {
          return (
            <div
              key={index}
              dangerouslySetInnerHTML={{
                __html: part.content.replace(/\n/g, "<br>"),
              }}
            />
          );
        } else {
          return (
            <div key={index} className="my-4">
              <SyntaxHighlighter
                language={part.language}
                style={oneLight}
                customStyle={{
                  borderRadius: "0.5rem",
                  fontSize: "14px",
                  lineHeight: "1.5",
                  margin: "0",
                  backgroundColor: "#ffffff",
                }}
                showLineNumbers={false}
                wrapLines={true}
              >
                {part.content}
              </SyntaxHighlighter>
            </div>
          );
        }
      })}
    </div>
  );
};

export default CodeHighlighter;
