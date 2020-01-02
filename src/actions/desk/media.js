import { saveAs } from 'file-saver';

import { loadImageFromFile } from '../../utils/files';
import { copyToClipboard, dateToString } from '../../utils/other';
import getFileBucket from '../../services/buckets';
import {
  LOAD_IMAGE_REQUEST,
  LOAD_IMAGE_SUCCESS,
  LOAD_IMAGE_FAILURE,
  DELETE_IMAGE_REQUEST,
  DELETE_IMAGE_SUCCESS,
  DELETE_IMAGE_FAILURE,
  SAVE_IMAGE_REQUEST, SAVE_IMAGE_SUCCESS, SAVE_IMAGE_FAILURE, SET_SAVE_STATUS,
} from '../../constants/actionType';
import { fillIn } from './options';
import { NOT_SAVED_STATUS, SAVED_STATUS, SAVING_STATUS } from '../../constants/desk';

const buildImagePath = imageId => `images/${imageId}`;

export function setSaveStatus(status) {
  return {
    type: SET_SAVE_STATUS,
    status,
  };
}

export function loadImage(imageId) {
  return async (dispatch, getState) => {
    const { drawingDesk } = getState().desk;
    const path = buildImagePath(imageId);
    const storage = getFileBucket();

    // TODO: check whether previous image has been saved
    dispatch({
      type: LOAD_IMAGE_REQUEST,
      imageId,
    });

    try {
      const file = await storage.read(path);
      const image = await loadImageFromFile(file);

      drawingDesk.loadImage(image);
      dispatch(fillIn());
      dispatch({
        type: LOAD_IMAGE_SUCCESS,
        imageId,
      });
    } catch (e) {
      dispatch({
        type: LOAD_IMAGE_FAILURE,
        error: e.message,
        imageId,
      });
    }
  };
}

export function saveImage() {
  return async (dispatch, getState) => {
    const state = getState();
    const { drawingDesk } = state.desk;
    const { imageId } = state.desk;
    const path = buildImagePath(imageId);
    const storage = getFileBucket();

    dispatch({
      type: SAVE_IMAGE_REQUEST,
    });
    dispatch(setSaveStatus(SAVING_STATUS));

    try {
      const file = await drawingDesk.toBlobAsync();
      await storage.write(path, file);

      dispatch({
        type: SAVE_IMAGE_SUCCESS,
      });
      dispatch(setSaveStatus(SAVED_STATUS));
    } catch (e) {
      dispatch({
        type: SAVE_IMAGE_FAILURE,
        error: e.message,
      });
      dispatch(setSaveStatus(NOT_SAVED_STATUS));
    }
  };
}

export function download() {
  return (dispatch, getState) => {
    const { drawingDesk } = getState().desk;
    const now = new Date();
    const fileName = `Image-${dateToString(now, 'dd-mm-yyyy_H-M-S')}.png`;

    drawingDesk.toBlob(blob => {
      saveAs(blob, fileName);
    });
  };
}

// TODO: It's not a desk-related move this code out
export function deleteImage(imageId) {
  return async dispatch => {
    const storage = getFileBucket();

    dispatch({
      type: DELETE_IMAGE_REQUEST,
      imageId,
    });

    try {
      await storage.delete(buildImagePath(this.imageId));
      dispatch({
        type: DELETE_IMAGE_SUCCESS,
        imageId,
      });
    } catch (e) {
      dispatch({
        type: DELETE_IMAGE_FAILURE,
        error: e.message,
        imageId,
      });
    }
  };
}

// TODO: It's not a desk-related move this code out
export function copyLink() {
  // TODO: generate a correct url to preview page and copy this
  copyToClipboard(window.location.href);
}

// TODO: It's not a desk-related move this code out
export function copyDirectLink(imageId) {
  return async () => {
    const storage = getFileBucket();
    const path = buildImagePath(imageId);
    const directImageUrl = await storage.getUrl(path);
    if (directImageUrl) {
      copyToClipboard(directImageUrl);
    }
  };
}
