import { createOrderData, updateDragging, state } from "./data.js";
import { createOrderHtml, html, updateDraggingHtml, moveToColumn } from "./view.js";

const handleDragOver = (event) => {
    event.preventDefault();
    const path = event.path || (event.composedPath && event.composedPath());
    const column = path.find((element) => element.dataset.area);
    
    if (column) {
        updateDragging({ over: column.dataset.area });
        updateDraggingHtml({ over: column.dataset.area });
    }
};

let draggedItem = null;
let draggingElement = null;
let id = null;

const handleDragStart = (event) => {
    draggedItem = event.target.closest(".order");
    draggingElement = state.dragging.over;
    id = draggedItem.dataset.id;
};

const handleDragEnd = (event) => {
    event.preventDefault();
    const moveTo = state.dragging.over;
    moveToColumn(id, moveTo);
    updateDraggingHtml({ over: null });
};

const toggleOverlay = (overlay) => {
    if (!overlay.open) {
        overlay.showModal();
    } else {
        overlay.close();
    }
};

const handleHelpToggle = () => {
    toggleOverlay(html.help.overlay);
};

const handleAddToggle = () => {
    toggleOverlay(html.add.overlay);
    html.add.form.reset();
};

const handleAddSubmit = (event) => {
    event.preventDefault();
    const order = {
        id: null,
        title: html.add.title.value,
        table: html.add.table.value,
        column: document.querySelector('[data-column="ordered"]'),
        created: null,
    };
    document.querySelector('[data-column="ordered"]').appendChild(createOrderHtml(createOrderData(order)));
    toggleOverlay(html.add.overlay);
};

const handleEditToggle = (event) => {
    toggleOverlay(html.edit.overlay);
    const orderId = event.target.dataset.id;
    
    if (orderId) {
        const editOrderTitle = html.edit.title;
        const editOrderTable = html.edit.table;
        const editOrderId = html.edit.id;
        
        editOrderTitle.value = event.target.children[0].textContent;
        editOrderTable.selectedIndex = event.target.children[1].children[0].children[1].textContent - 1;
        editOrderId.dataset.editId = orderId;
    }
};

const handleEditSubmit = (event) => {
    event.preventDefault();
    const activeElementId = html.edit.id;
    const actualId = activeElementId.dataset.editId;
    const activeElementSelector = html.edit.column;
    const actualColumn = activeElementSelector.value;
    
    moveToColumn(actualId, actualColumn);
    
    const orderId = document.querySelector(`[data-id="${actualId}"]`);
    orderId.children[0].textContent = html.edit.title.value;
    orderId.children[1].children[0].children[1].textContent = html.edit.table.value;
    
    toggleOverlay(html.edit.overlay);
};

const handleDelete = () => {
    const activeElementId = html.edit.id;
    const actualId = activeElementId.dataset.editId;
    const orderId = document.querySelector(`[data-id="${actualId}"]`);
    orderId.remove();
    toggleOverlay(html.edit.overlay);
};

// Event listeners
html.add.cancel.addEventListener('click', handleAddToggle);
html.other.add.addEventListener('click', handleAddToggle);
html.add.form.addEventListener('submit', handleAddSubmit);

html.other.grid.addEventListener('click', handleEditToggle);
html.edit.cancel.addEventListener('click', handleEditToggle);
html.edit.form.addEventListener('submit', handleEditSubmit);
html.edit.delete.addEventListener('click', handleDelete);

html.help.cancel.addEventListener('click', handleHelpToggle);
html.other.help.addEventListener('click', handleHelpToggle);

for (const htmlColumn of Object.values(html.columns)) {
    htmlColumn.addEventListener('dragstart', handleDragStart);
    htmlColumn.addEventListener('dragend', handleDragEnd);
}

for (const htmlArea of Object.values(html.area)) {
    htmlArea.addEventListener('dragover', handleDragOver);
}