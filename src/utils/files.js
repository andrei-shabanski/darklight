export function loadFileFromUrl(url) {
  return fetch(url).then(res => res.blob());
}

export function loadImageFromUrl(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = () => reject();
    image.src = url;
  });
}

export function loadImageFromFile(file) {
  return loadImageFromUrl(URL.createObjectURL(file));
}

export function extractFileFromDataTransfer(dataTransfer, mimeTypePattern = 'image/') {
  if (!dataTransfer.types.length || dataTransfer.types[0] !== 'Files') {
    return;
  }

  const dataTransferItem = dataTransfer.items[0];
  const file = dataTransferItem.getAsFile();
  if (file && file.type.startsWith(mimeTypePattern)) {
    return file;
  }

  return null;
}

export function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

export function fromBase64(b64) {
  return fetch(b64).then(res => res.blob());
}
