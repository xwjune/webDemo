// 文件下载
const downloadByUrl = (url: string, name: string) => {
  const aLink = document.createElement('a');
  aLink.setAttribute('style', 'display: none');
  aLink.setAttribute('href', url);
  aLink.setAttribute('download', name);
  document.body.appendChild(aLink);
  aLink.click();
  document.body.removeChild(aLink);
};

// 二进制文件下载
export const downloadByBlod = (
  content: Blob | BlobPart[],
  fileName: string,
  type?: string,
) => {
  const blob = content instanceof Blob ? content : new Blob(content, { type });
  const blobUrl = window.URL.createObjectURL(blob);
  downloadByUrl(blobUrl, fileName);
  window.URL.revokeObjectURL(blobUrl);
};

// canvas图片下载
export const downloadByCanvas = (canvas: HTMLCanvasElement, fileName: string) => {
  const url = canvas.toDataURL('image/png');
  downloadByUrl(url, fileName);
};
