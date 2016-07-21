import parentStore from './store/configureStore';
import { openWindow } from '../child/actions/sidebar.js';
import 'babel-polyfill';

function createChildWindows() {
    fin.desktop.Window.getCurrent().contentWindow.store = parentStore();

    if (!Object.keys(fin.desktop.Window.getCurrent().contentWindow.store.getState()).length) {
        fin.desktop.Window.getCurrent().contentWindow.store.dispatch(openWindow());
        fin.desktop.Window.getCurrent().contentWindow.store.dispatch(openWindow());
        // createChildWindow();
        // createChildWindow();
    } else {
        Object.keys(fin.desktop.Window.getCurrent().contentWindow.store.getState()).forEach((windowName) => {
            const newWindowName = windowName === 'undefined' ? null : windowName;
            fin.desktop.Window.getCurrent().contentWindow.store.dispatch(openWindow(newWindowName));
        });
    }
}

fin.desktop.main(() => createChildWindows());

window.parent = window;
