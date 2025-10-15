// 获取数据文件的路径
// 由于数据文件放在 public/data 目录下，可以直接使用相对路径
export const getDataPath = (relativePath) => {
  // 获取当前页面的基础路径
  const basePath = import.meta.env.BASE_URL || "/";
  // 确保路径正确拼接，处理 GitHub Pages 的子路径
  return `${basePath}data/${relativePath}`;
};
