import ACTION_TYPES from '../constants/actionTypes.js';
import childReducers from '../../child/reducers/reducers.js';

import $ from 'jquery';

function parentReducer(state = {}, action) {

    switch (action.type) {

    case ACTION_TYPES.CHILD_CLOSED: {
        const newState = Object.assign({}, state);

        const newClosedWindow = Object.assign({}, newState[action.windowName], {
            date: Date.now()
        });

        if (newState.closedWindows) {
            newState.closedWindows[action.windowName] = newClosedWindow;
        } else {
            newState.closedWindows = {
                [action.windowName]: newClosedWindow
            };
        }

        delete newState[action.windowName];
        return newState;
    }
    case ACTION_TYPES.INITIALISE_STATE: {
        return state;
    }

    case ACTION_TYPES.DRAG_START: {
        return Object.assign({}, state, {
            draggedFav: {
                code: action.code,
                windowName: action.windowName
            }
        });
    }

    case ACTION_TYPES.REOPEN_WINDOW: {
        const newState = Object.assign({}, state, {
            [action.reopenWindowName]: state.closedWindows[action.reopenWindowName]
        });

        delete newState.closedWindows[action.reopenWindowName];
        return newState;
    }

    case ACTION_TYPES.DRAG_END: {
        const newState = $.extend(true, {}, state);

        if (action.windowName !== newState.draggedFav.windowName) {
            const originWindowName = newState.draggedFav.windowName;
            const movedStockCode = newState.draggedFav.code;
            const movedStockName = newState[originWindowName].favourites.names[movedStockCode];

            // Remove the code and name from the origin window's favourites
            delete newState[originWindowName].favourites.names[movedStockCode];
            const codeIndex = newState[originWindowName].favourites.codes.indexOf(movedStockCode);
            newState[originWindowName].favourites.codes.splice(codeIndex, 1);

            // If it was the selected favourite, select another if available
            // deselect if none available
            if (newState[originWindowName].favourites.codes.length) {
                const newStockCode = newState[originWindowName].favourites.codes[0];
                newState[originWindowName].selection.code = newStockCode;
                newState[originWindowName].selection.name = newState[originWindowName].favourites.names[newStockCode];
            } else {
                delete newState[originWindowName].selection.code;
                delete newState[originWindowName].selection.name;
            }

            // If the new window doesn't have selection, select this new favourite
            if (!newState[action.windowName].selection.code) {
                newState[action.windowName].selection.code = movedStockCode;
                newState[action.windowName].selection.name = movedStockName;
            }

        }
        // Always remove the dragged favourite
        delete newState.draggedFav;

        return newState;
    }

    // If it isn't one of the above actions, it an action relating
    // to the children, let their reducers handle the actions
    default: {
        const childState = state[action.windowName];
        let newState = {};

        if (childState) {
            newState = Object.assign({}, state, {
                [action.windowName]: childReducers(childState, action)
            });
        } else {
            newState = Object.assign({}, state, {
                [action.windowName]: childReducers({}, action)
            });
        }

        return newState;
    }

    }

}

export default parentReducer;
