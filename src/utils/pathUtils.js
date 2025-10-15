// 获取数据文件的路径
// 由于数据文件放在 public/data 目录下，可以直接使用相对路径
export const getDataPath = (relativePath) => {
  // 确保路径以 / 开头，这样在 GitHub Pages 上也能正确工作
  return `/data/${relativePath}`;
};
