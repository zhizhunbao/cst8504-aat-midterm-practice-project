#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
PDF文件读取器
用于读取CST8504课程PDF文件并提取内容，生成Markdown格式文件
"""

import PyPDF2
import os
import re
from pathlib import Path

def read_pdf_file(pdf_path):
    """
    读取PDF文件并返回文本内容

    Args:
        pdf_path (str): PDF文件路径

    Returns:
        str: PDF文件的文本内容
    """
    try:
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            text_content = ""

            print(f"正在读取PDF文件: {pdf_path}")
            print(f"总页数: {len(pdf_reader.pages)}")

            for page_num, page in enumerate(pdf_reader.pages, 1):
                page_text = page.extract_text()
                text_content += f"\n--- 第 {page_num} 页 ---\n"
                text_content += page_text
                print(f"已读取第 {page_num} 页")

            return text_content

    except Exception as e:
        print(f"读取PDF文件时出错: {e}")
        return None

def format_text_as_markdown(text_content, pdf_name):
    """
    将PDF文本内容格式化为Markdown格式

    Args:
        text_content (str): 原始PDF文本内容
        pdf_name (str): PDF文件名

    Returns:
        str: 格式化后的Markdown内容
    """
    # 创建Markdown头部
    markdown_content = f"# {pdf_name}\n\n"
    markdown_content += "*从PDF文件提取的内容*\n\n"
    markdown_content += "---\n\n"

    # 按页面分割内容
    pages = text_content.split("--- 第")

    for i, page_content in enumerate(pages):
        if not page_content.strip():
            continue

        # 提取页码
        if "页 ---" in page_content:
            page_num = page_content.split("页 ---")[0].strip()
            content = page_content.split("页 ---", 1)[1].strip()
        else:
            page_num = str(i)
            content = page_content.strip()

        if content:
            # 添加页面标题
            markdown_content += f"## 第 {page_num} 页\n\n"

            # 处理内容，添加适当的Markdown格式
            lines = content.split('\n')
            formatted_lines = []

            for line in lines:
                line = line.strip()
                if not line:
                    continue

                # 检测标题（全大写或包含数字的短行）
                if (len(line) < 50 and
                    (line.isupper() or
                     any(char.isdigit() for char in line) or
                     line.endswith(':') or
                     'Week' in line or
                     'Lesson' in line or
                     'Chapter' in line)):
                    formatted_lines.append(f"### {line}\n")
                # 检测列表项
                elif (line.startswith('•') or
                      line.startswith('-') or
                      line.startswith('*') or
                      re.match(r'^\d+\.', line)):
                    formatted_lines.append(f"- {line.lstrip('•-*0123456789. ')}\n")
                # 检测代码相关术语
                elif any(term in line.lower() for term in ['def ', 'import ', 'class ', 'function', 'method', 'variable']):
                    formatted_lines.append(f"`{line}`\n")
                # 普通文本
                else:
                    formatted_lines.append(f"{line}\n")

            markdown_content += ''.join(formatted_lines)
            markdown_content += "\n---\n\n"

    return markdown_content

def save_text_to_file(text_content, output_path):
    """
    将文本内容保存到文件

    Args:
        text_content (str): 要保存的文本内容
        output_path (str): 输出文件路径
    """
    try:
        with open(output_path, 'w', encoding='utf-8') as file:
            file.write(text_content)
        print(f"文本内容已保存到: {output_path}")
    except Exception as e:
        print(f"保存文件时出错: {e}")

def save_markdown_to_file(markdown_content, output_path):
    """
    将Markdown内容保存到文件

    Args:
        markdown_content (str): Markdown格式的内容
        output_path (str): 输出文件路径
    """
    try:
        with open(output_path, 'w', encoding='utf-8') as file:
            file.write(markdown_content)
        print(f"Markdown内容已保存到: {output_path}")
    except Exception as e:
        print(f"保存文件时出错: {e}")

def analyze_pdf_content(text_content, pdf_name):
    """
    分析PDF内容并提取关键信息

    Args:
        text_content (str): PDF文本内容
        pdf_name (str): PDF文件名
    """
    print(f"\n=== {pdf_name} 内容分析 ===")

    # 统计基本信息
    lines = text_content.split('\n')
    non_empty_lines = [line.strip() for line in lines if line.strip()]

    print(f"总行数: {len(lines)}")
    print(f"非空行数: {len(non_empty_lines)}")
    print(f"字符数: {len(text_content)}")

    # 查找关键词
    keywords = ['Python', 'NumPy', 'Pandas', 'DataFrame', 'Array', 'Function', 'Class', 'Import', 'def', 'for', 'if', 'while']
    found_keywords = {}

    for keyword in keywords:
        count = text_content.lower().count(keyword.lower())
        if count > 0:
            found_keywords[keyword] = count

    if found_keywords:
        print("\n发现的关键词:")
        for keyword, count in found_keywords.items():
            print(f"  {keyword}: {count} 次")

    # 查找可能的题目或练习
    question_indicators = ['Question', 'Exercise', 'Problem', 'Practice', 'Example', '题目', '练习', '问题']
    questions_found = []

    for line in non_empty_lines:
        for indicator in question_indicators:
            if indicator.lower() in line.lower():
                questions_found.append(line)
                break

    if questions_found:
        print(f"\n发现可能的题目/练习 ({len(questions_found)} 个):")
        for i, question in enumerate(questions_found[:10], 1):  # 只显示前10个
            print(f"  {i}. {question[:100]}...")

    return {
        'total_lines': len(lines),
        'non_empty_lines': len(non_empty_lines),
        'char_count': len(text_content),
        'keywords': found_keywords,
        'questions': questions_found
    }

def main():
    """主函数"""
    # PDF文件路径
    pdf_files = [
        "docs/CST8504_02_Python_Primer.pdf",
        "docs/CST8504_03_Numpy_Pandas.pdf",
        "docs/CST8504_04_Midterm_Review.pdf"
    ]

    for pdf_file in pdf_files:
        if os.path.exists(pdf_file):
            print(f"\n{'='*60}")
            print(f"处理文件: {pdf_file}")
            print(f"{'='*60}")

            # 读取PDF内容
            text_content = read_pdf_file(pdf_file)

            if text_content:
                # 格式化为Markdown并保存
                pdf_name = Path(pdf_file).stem
                markdown_content = format_text_as_markdown(text_content, pdf_name)
                markdown_file = f"docs/{pdf_name}.md"
                save_markdown_to_file(markdown_content, markdown_file)

                print(f"\n{'-'*40}")
            else:
                print(f"无法读取文件: {pdf_file}")
        else:
            print(f"文件不存在: {pdf_file}")

    print("\n处理完成！所有Markdown文件已保存到docs目录。")

if __name__ == "__main__":
    main()
