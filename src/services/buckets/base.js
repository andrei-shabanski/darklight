export default class Bucket {
  async read(path) {
    /**
     * Downloads a file from the storage.
     * @param  {String} path Slash delimited sequence of a path to the file.
     * @return {String}      File object.
     */
    throw new TypeError("Function isn't implemented");
  }

  async write(path, file) {
    /**
     * Uploads a file to the storage.
     * @param {String} path Slash delimited sequence of a path to the file.
     * @param {String} file File or Blob object.
     */
    throw new TypeError("Function isn't implemented");
  }

  async delete(path) {
    /**
     * Deletes a file to the storage.
     * @param {String} path Slash delimited sequence of a path to the file.
     */
    throw new TypeError("Function isn't implemented");
  }

  async getUrl(path) {
    /**
     * Generates a downloadable URL of the file.
     * @param  {String} path Slash delimited sequence of a path to the file.
     * @return {String}      URL string.
     */
    return null;
  }
}
