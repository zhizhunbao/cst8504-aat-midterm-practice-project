# Scripts 目录

这个目录包含项目相关的实用脚本。

## 脚本说明

### pdf_reader.py

PDF 文件读取和分析脚本，用于：

- 读取 CST8504 课程的 PDF 文件
- 提取文本内容
- 分析关键词和题目
- 生成分析报告

**使用方法：**

```bash
# 激活虚拟环境
.venv\Scripts\activate

# 运行脚本
python scripts/pdf_reader.py
```

**输出文件：**

- `docs/*_extracted.txt` - 提取的 PDF 文本内容
- `docs/pdf_analysis_report.txt` - 分析报告

## 注意事项

- 运行前请确保已安装 PyPDF2 库：`pip install PyPDF2`
- 脚本会自动处理 docs 目录下的所有 PDF 文件
- 生成的文本文件用于后续的学习和复习
