import { saveAs } from 'file-saver';

import { loadImageFromFile } from '../../utils/files';
import { copyToClipboard, dateToString, randomString } from '../../utils/other';
import getFileBucket from '../../services/buckets';
import {
  LOAD_IMAGE_REQUEST,
  LOAD_IMAGE_SUCCESS,
  LOAD_IMAGE_FAILURE,
  DELETE_IMAGE_REQUEST,
  DELETE_IMAGE_SUCCESS,
  DELETE_IMAGE_FAILURE,
  SAVE_IMAGE_REQUEST,
  SAVE_IMAGE_SUCCESS,
  SAVE_IMAGE_FAILURE,
  SET_SAVE_STATUS,
  UPLOAD_IMAGE_SUCCESS,
  UPLOAD_IMAGE_FAILURE,
  UPLOAD_IMAGE_REQUEST, SET_DESK_IMAGE,
} from '../../constants/actionType';
import { NOT_SAVED_STATUS, SAVED_STATUS, SAVING_STATUS } from '../../constants/desk';
import { fillIn, setDrawingDesk } from './options';
import DrawingDesk from '../../services/desk';

const buildImagePath = imageId => `images/${imageId}`;

export function createDrawingDesk() {
  return async dispatch => {
    // TODO check prev drawingDesk and save changes
    const drawingDesk = new DrawingDesk(imageCanvas, drawingCanvas);

    drawingDesk.on('image-changed', () => dispatch(saveImage()));

    dispatch(setDrawingDesk(drawingDesk));
  };
}

export function setImage(imageId, image) {
  return async (dispatch, getState) => {
    dispatch(createDrawingDesk());

    const state = getState();
    const { drawingDesk } = state.desk;
    drawingDesk.loadImage(image);
    dispatch(fillIn());

    dispatch({
      type: SET_DESK_IMAGE,
      imageId,
    });
  };
}

export function setSaveStatus(status) {
  return {
    type: SET_SAVE_STATUS,
    status,
  };
}

export function uploadImage(file) {
  return async dispatch => {
    const storage = getFileBucket();

    const imageId = `${randomString()}.png`;
    const path = buildImagePath(imageId);

    dispatch({
      type: UPLOAD_IMAGE_REQUEST,
      imageId,
    });

    try {
      await storage.write(path, file);
      dispatch({
        type: UPLOAD_IMAGE_SUCCESS,
        imageId,
      });

      const image = await loadImageFromFile(file);
      dispatch(setImage(imageId, image));

      window.history.pushState({ imageId }, '', imageId);
    } catch (e) {
      dispatch({
        type: UPLOAD_IMAGE_FAILURE,
        error: e.message,
      });
    }
  };
}

export function loadImage(imageId) {
  return async dispatch => {
    const path = buildImagePath(imageId);
    const storage = getFileBucket();

    // TODO: check whether previous image has been saved
    dispatch({
      type: LOAD_IMAGE_REQUEST,
      imageId,
    });

    try {
      const file = await storage.read(path);
      dispatch({
        type: LOAD_IMAGE_SUCCESS,
        imageId,
      });

      const image = await loadImageFromFile(file);
      dispatch(setImage(imageId, image));
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
  return () => {
    copyToClipboard(window.location.href);
  };
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
