import Bucket from './base';
import {
  UnavailableFileStorageError,
  FileNotFoundError,
  FileAccessError,
  FileProtectedError,
} from '../../utils/exceptions';
import { globalLogger as logger } from '../../utils/logging';

const MAX_STORAGE_SIZE = 15 * 1024 * 1024 * 1024; // 15 MB

export default class LocalFileSystemBucket extends Bucket {
  constructor() {
    super();

    this.storage = null;

    this.initializingStorageTask = new Promise((resolve, reject) => {
      const onInitialized = storage => {
        this.storage = storage;
        resolve(storage);
      };

      const onFailed = error => {
        const customError = new UnavailableFileStorageError(error);
        reject(customError);
      };

      // navigator.webkitPersistentStorage.requestQuota(
      //   MAX_STORAGE_SIZE,
      //   () =>
      //     window.webkitRequestFileSystem(
      //       window.PERSISTENT,
      //       MAX_STORAGE_SIZE,
      //       onInitialized,
      //       onFailed
      //     ),
      //   onFailed
      // );

      window.webkitRequestFileSystem(window.PERSISTENT, MAX_STORAGE_SIZE, onInitialized, onFailed);
    });
  }

  async getStorage() {
    if (this.storage) {
      return this.storage;
    }

    return this.initializingStorageTask;
  }

  async read(path) {
    return this.getDirectoryEntry(path).then(dirEntry => {
      return new Promise((resolve, reject) => {
        const fileName = this.getFileName(path);

        dirEntry.getFile(
          fileName,
          { create: false },
          fileEntry => fileEntry.file(resolve),
          error => reject(this.toCustomError(error))
        );
      });
    });
  }

  async write(path, file) {
    return this.getDirectoryEntry(path).then(dirEntry => {
      return new Promise((resolve, reject) => {
        const fileName = this.getFileName(path);

        dirEntry.getFile(
          fileName,
          { create: true, exclusive: false },
          fileEntry => {
            fileEntry.createWriter(
              fileWriter => {
                fileWriter.write(file);
                resolve(file);
              },
              error => reject(this.toCustomError(error))
            );
          },
          error => reject(this.toCustomError(error))
        );
      });
    });
  }

  async delete(path) {
    return this.getDirectoryEntry(path).then(dirEntry => {
      return new Promise(resolve => {
        const fileName = this.getFileName(path);

        dirEntry.getFile(
          fileName,
          { create: false },
          fileEntry => fileEntry.remove(resolve, resolve),
          resolve
        );
      });
    });
  }

  async getUrl(path) {
    return this.getDirectoryEntry(path).then(dirEntry => {
      return new Promise((resolve, reject) => {
        const fileName = this.getFileName(path);

        dirEntry.getFile(
          fileName,
          { create: false },
          fileEntry => resolve(fileEntry.toURL()),
          error => reject(this.toCustomError(error))
        );
      });
    });
  }

  toCustomError(error, path = null) {
    logger.warn(`FileSystemAPI error. ${error.message} (code ${error.code})`);

    switch (error.code) {
      case error.NOT_FOUND_ERR:
      case error.TYPE_MISMATCH_ERR:
        return new FileNotFoundError(path, error);
      case error.INVALID_ACCESS_ERR:
      case error.SECURITY_ERR:
        return new FileProtectedError(path, error);
      default:
        return new FileAccessError(path, error);
    }
  }

  async getDirectoryEntry(path) {
    const storage = await this.getStorage();

    const createDir = (dirs, currentDirEntry, resolve, reject) => {
      const nextDir = dirs.shift();

      currentDirEntry.getDirectory(
        nextDir,
        { create: true },
        nextDirEntry => {
          if (dirs.length) {
            createDir(dirs, nextDirEntry, resolve, reject);
          } else {
            resolve(nextDirEntry);
          }
        },
        reject
      );
    };

    return new Promise((resolve, reject) => {
      const pathParts = path.split('/');
      pathParts.pop(); // remove a file name
      const directories = pathParts.filter(part => part);

      createDir(directories, storage.root, resolve, reject);
    });
  }

  getFileName(path) {
    return path.split('/').pop();
  }
}
