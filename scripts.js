import { TABLES, COLUMNS, state, createOrderData, updateDragging, html, createOrderHtml, moveToColumn, updateDraggingHtml } from './view.js';

/**
 * Event handler for opening the "Add Order" overlay.
 */
const handleAddToggle = () => {
    html.add.overlay.showModal();
    html.add.title.value = '';
    html.add.table.selectedIndex = 0;
};

/**
 * Event handler for submitting the "Add Order" form.
 */
const handleAddSubmit = (event) => {
    event.preventDefault();

    const title = html.add.title.value.trim();
    const table = html.add.table.value;

    if (title && table) {
        const order = createOrderData({ title, table, column: 'ordered' });
        state.orders[order.id] = order;

        const orderElement = createOrderHtml(order);
        html.columns.ordered.appendChild(orderElement);

        html.add.overlay.close();
    }
};

/**
 * Event handler for opening the "Edit Order" overlay.
 */
const handleEditToggle = (event) => {
    const orderElement = event.target.closest('.order');
    if (!orderElement) return;

    const orderId = orderElement.dataset.id;
    const order = state.orders[orderId];

    if (!order) return;

    html.edit.id.value = orderId;
    html.edit.title.value = order.title;
    html.edit.table.value = order.table;
    html.edit.column.value = order.column;

    html.edit.overlay.showModal();
};

/**
 * Event handler for submitting the "Edit Order" form.
 */
const handleEditSubmit = (event) => {
    event.preventDefault();

    const orderId = html.edit.id.value;
    const order = state.orders[orderId];

    if (!order) return;

    const newTitle = html.edit.title.value.trim();
    const newTable = html.edit.table.value;
    const newColumn = html.edit.column.value;

    if (newTitle && newTable && newColumn) {
        order.title = newTitle;
        order.table = newTable;
        order.column = newColumn;

        const orderElement = document.querySelector(`[data-id="${orderId}"]`);
        if (orderElement) {
            orderElement.querySelector('[data-order-title]').textContent = newTitle;
            orderElement.querySelector('[data-order-table]').textContent = newTable;
        }

        if (newColumn !== order.column) {
            moveToColumn(orderId, newColumn);
            order.column = newColumn;
        }
    }

    html.edit.overlay.close();
};

/**
 * Event handler for deleting an order.
 */
const handleDelete = (event) => {
    const orderId = html.edit.id.value;
    const orderElement = document.querySelector(`[data-id="${orderId}"]`);

    if (orderElement && orderId in state.orders) {
        delete state.orders[orderId];
        orderElement.remove();
        html.edit.overlay.close();
    }
};
/**
 * Event handler for opening the "Help" overlay.
 */
const handleHelpToggle = () => {
    const helpOverlay = html.help.overlay;

    if (helpOverlay.open) {
        helpOverlay.close();
        html.other.add.focus(); // Return focus to the "Add Order" button
    } else {
        const helpContent = document.querySelector('[data-help-overlay]'); // Get the Help overlay content
        const helpTitle = helpContent.querySelector('.overlay__title').textContent; // Get the title
        const helpText = Array.from(helpContent.querySelectorAll('p')).map((p) => p.textContent).join('\n'); // Get the paragraphs

        const helpMessage = `${helpTitle}\n\n${helpText}`; // Combine the title and paragraphs

        // Display the help message in an alert (you can replace this with your desired popup method)
        alert(helpMessage);

        // If you want to show the overlay instead of an alert, you can use the following line:
        // helpOverlay.showModal();
    }
};

html.help.addEventListener('click', handleHelpToggle);


const addOverlay = document.createElement('dialog');
addOverlay.setAttribute('data-add-overlay', ''); 
/**
 * Event handler for closing an overlay (Add Order, Edit Order, or Help).
 */
const handleCloseOverlay = (event) => {
    const overlay = event.target.closest('dialog');
    if (overlay) {
        overlay.close();
        html.add.overlay.close();
        html.edit.overlay.close();
        html.help.overlay.close();
        html.add.overlay.remove();
        html.edit.overlay.remove();
        html.help.overlay.remove();
        html.add.overlay.show();
    }

    html.other.add.focus();
};


html.add.cancel.addEventListener('click', handleCloseOverlay);
html.edit.cancel.addEventListener('click', handleCloseOverlay);
html.help.cancel.addEventListener('click', handleCloseOverlay);

/**
 * Event handler for drag start.
 */
const handleDragStart = (event) => {
    const orderId = event.target.dataset.id;
    if (!orderId) return;

    event.dataTransfer.setData('text/plain', orderId);
    event.dataTransfer.effectAllowed = 'move';
    updateDragging({ source: orderId });
};

/**
 * Event handler for drag end.
 */
const handleDragEnd = () => {
    updateDragging({ source: null });
    updateDraggingHtml({});
};

/**
 * Event handler for drag over.
 */
const handleDragOver = (event) => {
    event.preventDefault();
    const path = event.path || event.composedPath();
    let column = null;

    for (const element of path) {
        const { area } = element.dataset;
        if (area) {
            column = area;
            break;
        }
    }

    if (!column) return;
    updateDragging({ over: column });
    updateDraggingHtml({ over: column });
};

/**
 * Initialize event listeners.
 */
html.add.overlay.addEventListener('close', handleCloseOverlay);
html.add.cancel.addEventListener('click', handleAddToggle);
html.add.form.addEventListener('submit', handleAddSubmit);
html.other.add.addEventListener('click', handleAddToggle);
html.other.grid.addEventListener('click', handleEditToggle);
html.edit.overlay.addEventListener('close', handleCloseOverlay);
html.edit.cancel.addEventListener('click', handleEditToggle);
html.edit.form.addEventListener('submit', handleEditSubmit);
html.edit.delete.addEventListener('click', handleDelete);
html.help.overlay.addEventListener('close', handleCloseOverlay);
html.help.cancel.addEventListener('click', handleHelpToggle);

for (const htmlColumn of Object.values(html.columns)) {
    htmlColumn.addEventListener('dragstart', handleDragStart);
    htmlColumn.addEventListener('dragend', handleDragEnd);
}

for (const htmlArea of Object.values(html.area)) {
    htmlArea.addEventListener('dragover', handleDragOver);
}

html.add.table.appendChild(createTableOptionsHtml());
html.edit.table.appendChild(createTableOptionsHtml());

/**
 * Start the app focused on the "Add Order" button.
 */
html.other.add.focus();

/**
 * Helper function to create table options in the "Add Order" and "Edit Order" forms.
 */
function createTableOptionsHtml() {
    const fragment = document.createDocumentFragment();
    for (const singleTable of TABLES) {
        const option = document.createElement('option');
        option.value = singleTable;
        option.innerText = singleTable;
        fragment.appendChild(option);
    }
    return fragment;
}