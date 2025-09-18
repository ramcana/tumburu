export const formatTime = (t: number) => `${Math.floor(t / 60)}:${('0' + Math.floor(t % 60)).slice(-2)}`;
export const formatBytes = (b: number) => {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
};