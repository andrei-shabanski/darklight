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
