import FirebaseBucket from './firebase';
import LocalFileSystemBucket from './local';

export default function getBucket() {
  // Local file system only for development. Use FirebaseBucket on production
  // return new FirebaseBucket();
  return new LocalFileSystemBucket();
}