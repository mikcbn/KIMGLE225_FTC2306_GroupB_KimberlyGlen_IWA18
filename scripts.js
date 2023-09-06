// Import necessary functions and data from external modules
import { createOrderData, updateDragging, state } from "./data.js";
import { createOrderHtml, html, updateDraggingHtml, moveToColumn } from "./view.js";

// Event handler for drag-over event
const handleDragOver = (event) => {
    event.preventDefault();
    const path = event.path || (event.composedPath && event.composedPath());
    const column = path.find((element) => element.dataset.area);
    
    if (column) {
        // Update the dragging state when a draggable item is over a column
        updateDragging({ over: column.dataset.area });
        updateDraggingHtml({ over: column.dataset.area });
    }
};

// Initialize variables to track dragged item and target column
let draggedItem = null;
let draggingElement = null;
let id = null;

// Event handler for drag-start event
const handleDragStart = (event) => {
    // Find the closest parent element with the class "order" to the dragged item
    draggedItem = event.target.closest(".order");
    draggingElement = state.dragging.over;
    id = draggedItem.dataset.id;
};

// Event handler for drag-end event
const handleDragEnd = (event) => {
    event.preventDefault();
    // Get the target column to move the dragged item to
    const moveTo = state.dragging.over;
    // Move the item to the target column and update the HTML view
    moveToColumn(id, moveTo);
    updateDraggingHtml({ over: null });
};

// Function to toggle modal overlay
const toggleOverlay = (overlay) => {
    if (!overlay.open) {
        overlay.showModal();
    } else {
        overlay.close();
    }
};

// Event handler for toggling the help overlay
const handleHelpToggle = () => {
    toggleOverlay(html.help.overlay);
};

// Event handler for toggling the "Add" overlay
const handleAddToggle = () => {
    toggleOverlay(html.add.overlay);
    // Reset the "Add" form fields when toggling
    html.add.form.reset();
};

// Event handler for submitting the "Add" form
const handleAddSubmit = (event) => {
    event.preventDefault();
    // Create an order object with form input values
    const order = {
        id: null,
        title: html.add.title.value,
        table: html.add.table.value,
        column: document.querySelector('[data-column="ordered"]'),
        created: null,
    };
    // Append the new order HTML to the "ordered" column
    document.querySelector('[data-column="ordered"]').appendChild(createOrderHtml(createOrderData(order)));
    // Close the "Add" overlay
    toggleOverlay(html.add.overlay);
};

// Event handler for toggling the "Edit" overlay
const handleEditToggle = (event) => {
    toggleOverlay(html.edit.overlay);
    // Get the ID of the order being edited from the clicked element's dataset
    const orderId = event.target.dataset.id;
    
    if (orderId) {
        // Populate the "Edit" form fields with order details
        const editOrderTitle = html.edit.title;
        const editOrderTable = html.edit.table;
        const editOrderId = html.edit.id;
        
        editOrderTitle.value = event.target.children[0].textContent;
        editOrderTable.selectedIndex = event.target.children[1].children[0].children[1].textContent - 1;
        editOrderId.dataset.editId = orderId;
    }
};

// Event handler for submitting the "Edit" form
const handleEditSubmit = (event) => {
    event.preventDefault();
    // Get the ID and target column from the "Edit" form
    const activeElementId = html.edit.id;
    const actualId = activeElementId.dataset.editId;
    const activeElementSelector = html.edit.column;
    const actualColumn = activeElementSelector.value;
    
    // Move the order to the new column and update order details in the HTML view
    moveToColumn(actualId, actualColumn);
    
    const orderId = document.querySelector(`[data-id="${actualId}"]`);
    orderId.children[0].textContent = html.edit.title.value;
    orderId.children[1].children[0].children[1].textContent = html.edit.table.value;
    
    // Close the "Edit" overlay
    toggleOverlay(html.edit.overlay);
};

// Event handler for deleting an order
const handleDelete = () => {
    const activeElementId = html.edit.id;
    const actualId = activeElementId.dataset.editId;
    const orderId = document.querySelector(`[data-id="${actualId}"]`);
    orderId.remove();
    // Close the "Edit" overlay after deleting the order
    toggleOverlay(html.edit.overlay);
};

// Event listeners

// Event listener for cancel button in the "Add" overlay
html.add.cancel.addEventListener('click', handleAddToggle);

// Event listener for triggering the "Add" overlay
html.other.add.addEventListener('click', handleAddToggle);

// Event listener for submitting the "Add" form
html.add.form.addEventListener('submit', handleAddSubmit);

// Event listener for clicking on the grid to edit an order
html.other.grid.addEventListener('click', handleEditToggle);

// Event listener for cancel button in the "Edit" overlay
html.edit.cancel.addEventListener('click', handleEditToggle);

// Event listener for submitting the "Edit" form
html.edit.form.addEventListener('submit', handleEditSubmit);

// Event listener for deleting an order
html.edit.delete.addEventListener('click', handleDelete);

// Event listener for cancel button in the help overlay
html.help.cancel.addEventListener('click', handleHelpToggle);

// Event listener for triggering the help overlay
html.other.help.addEventListener('click', handleHelpToggle);

// Event listeners for drag and drop functionality
for (const htmlColumn of Object.values(html.columns)) {
    htmlColumn.addEventListener('dragstart', handleDragStart);
    htmlColumn.addEventListener('dragend', handleDragEnd);
}

// Event listeners for handling drag-over events on columns
for (const htmlArea of Object.values(html.area)) {
    htmlArea.addEventListener('dragover', handleDragOver);
}