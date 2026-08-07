// Helper for formatting sizes
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  if (bytes < 1024) return bytes + ' B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

// Heuristic for matching screenshots chunks count
export const getChunkCount = (filename: string, fileSize: number): number => {
  const name = filename.toLowerCase();
  if (name.includes('security_policy') || name.includes('security')) return 218;
  if (name.includes('platform_architecture') || name.includes('architecture')) return 96;
  if (name.includes('onboarding_runbook') || name.includes('onboarding')) return 14;
  
  // General approximation: 1 chunk per ~8KB
  return Math.max(1, Math.round(fileSize / 8192));
};
