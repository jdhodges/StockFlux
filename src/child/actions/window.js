import { WINDOW as ACTION_TYPES } from '../constants/actionTypes.js';
import configService from '../../shared/ConfigService';
import currentWindowService from '../services/currentWindowService';

export function minimise() {
    return {
        windowName: currentWindowService.getCurrentWindow().name,
        type: ACTION_TYPES.MINIMIZE
    };
}

export function compact() {
    return {
        windowName: currentWindowService.getCurrentWindow().name,
        type: ACTION_TYPES.TOGGLE_COMPACT,
        state: true
    };
}

export function expand() {
    return {
        windowName: currentWindowService.getCurrentWindow().name,
        type: ACTION_TYPES.TOGGLE_COMPACT,
        state: false
    };
}

export function resizing() {
    return {
        windowName: currentWindowService.getCurrentWindow().name,
        type: ACTION_TYPES.RESIZING
    };
}

export function fullView() {
    return {
        windowName: currentWindowService.getCurrentWindow().name,
        type: ACTION_TYPES.STATE_FULL_VIEW
    };
}

export function maximize() {
    return {
        windowName: currentWindowService.getCurrentWindow().name,
        type: ACTION_TYPES.MAXIMIZE
    };
}

export function restore() {
    return {
        windowName: currentWindowService.getCurrentWindow().name,
        type: ACTION_TYPES.RESTORE
    };
}

export function open() {
    return {
        windowName: currentWindowService.getCurrentWindow().name,
        type: ACTION_TYPES.OPEN
    };
}

export function close() {
    return {
        windowName: currentWindowService.getCurrentWindow().name,
        type: ACTION_TYPES.CLOSE
    };
}

export function resizeError() {
    return {
        windowName: currentWindowService.getCurrentWindow().name,
        type: ACTION_TYPES.RESIZE_ERROR
    };
}

export function windowClosed() {
    return (dispatch, getState) => {
        if (Object.keys(getState()).filter(key => key !== 'closedWindows').length === 1) {
            currentWindowService.getCurrentWindow().contentWindow.parent.close();
        } else {
            dispatch(close());
        }
    };
}

export function resizeToCompact() {
    return dispatch => {
        dispatch(resizing());
        const compactWindowDimensions = configService.getCompactWindowDimensions();
        fin.desktop.Window.getCurrent().resizeTo(
            compactWindowDimensions[0],
            compactWindowDimensions[1],
            'top-right',
            () => dispatch(compact()),
            () => dispatch(resizeError())
        );
    };
}

export function resizeToDefault() {
    return dispatch => {
        dispatch(resizing());
        const defaultWindowDimensions = configService.getDefaultWindowDimensions();
        fin.desktop.Window.getCurrent().resizeTo(
            defaultWindowDimensions[0],
            defaultWindowDimensions[1],
            'top-right',
            () => dispatch(expand()),
            () => dispatch(resizeError())
        );
    };
}
