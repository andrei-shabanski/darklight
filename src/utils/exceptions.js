export class AppError extends Error {}

export class UnavailableFileStorageError extends AppError {}

export class FileAccessError extends AppError {
  constructor(path, ...args) {
    super(...args);
    this.path = path;
  }
}

export class FileOperationCanceledError extends FileAccessError {}

export class FileNotFoundError extends FileAccessError {}

export class FileProtectedError extends FileAccessError {}
