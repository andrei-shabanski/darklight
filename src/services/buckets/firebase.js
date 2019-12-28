// TODO: use `app` instance created during firebase initialization
import * as firebase from 'firebase/app';

import Bucket from './base';
import {
  FileAccessError,
  FileOperationCanceledError,
  FileNotFoundError,
  FileProtectedError,
} from '../../utils/exceptions';
import { globalLogger as logger } from '../../utils/logging';
import { loadFileFromUrl } from '../../utils/files';

export default class FirebaseBucket extends Bucket {
  constructor() {
    super();

    this.storage = firebase.storage();
  }

  async read(path) {
    const ref = this.storage.ref(path);
    try {
      const url = await ref.getDownloadURL();
      const file = await loadFileFromUrl(url);
      return file;
    } catch (error) {
      logger.error(`Firebase: can't read ${path}. Error code: ${error.code}`);
      throw this.toCustomError(error, path);
    }
  }

  async write(path, file) {
    const ref = this.storage.ref(path);
    try {
      await ref.put(file);
    } catch (error) {
      logger.error(`Firebase: can't write a file to ${path}. Error code: ${error.code}`);
      throw this.toCustomError(error, path);
    }
  }

  async delete(path) {
    const ref = this.storage.ref(path);
    try {
      await ref.delete();
    } catch (error) {
      logger.error(`Firebase: can't delete ${path}. Error code: ${error.code}`);
      throw this.toCustomError(error, path);
    }
  }

  async getUrl(path) {
    // const bucket = this.storage.app.options.storageBucket;
    // const encodedPath = encodeURIComponent(path);
    // return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodedPath}?alt=media`;

    const ref = this.storage.ref(path);
    try {
      return await ref.getDownloadURL();
    } catch (error) {
      logger.error(`Firebase: can't get a url of ${path}. Error code: ${error.code}`);
      throw this.toCustomError(error, path);
    }
  }

  toCustomError(error, path) {
    switch (error.code) {
      case 'storage/object-not-found':
        return new FileNotFoundError(path, error);
      case 'storage/unauthorized':
        return new FileProtectedError(path, error);
      case 'storage/canceled':
        return new FileOperationCanceledError(path, error);
      default:
        return new FileAccessError(path, error);
    }
  }
}
