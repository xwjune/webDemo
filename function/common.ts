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
const downloadByBlod = (
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
const downloadByCanvas = (canvas: HTMLCanvasElement, fileName: string) => {
  const url = canvas.toDataURL('image/png');
  downloadByUrl(url, fileName);
};

// 获取文件base64
const getBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      resolve(e.target?.result as string);
      // resolve(reader.result as string);
    };
    reader.onerror = (error) => reject(error);
  });

// 获取文件名前缀
function getPrefix(filename: string) {
  const pos = filename.lastIndexOf('.');
  let prefix = filename;
  if (pos !== -1) {
    prefix = filename.substring(0, pos);
  }
  return prefix.trim();
}

// 获取文件名后缀
function getSuffix(filename: string) {
  const pos = filename.lastIndexOf('.');
  let suffix = '';
  if (pos !== -1) {
    suffix = filename.substring(pos + 1);
  }
  return suffix.toLowerCase();
}

/**
 * 获取元素样式
 *
 * @param {HTMLElement} element - DOM元素
 * @param {String} name - 样式名称
 */
function getStyle(element: HTMLElement, name: string): string {
  if (document.defaultView && document.defaultView.getComputedStyle) {
    return document.defaultView
      .getComputedStyle(element, null)
      .getPropertyValue(name);
  }
  return element.style[name];
}
