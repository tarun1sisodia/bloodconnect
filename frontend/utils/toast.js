// Toast notification functions
// These functions depend on having Toastify or a similar library loaded

// Show success toast
export const showSuccess = (message) => {
  if (typeof Toastify === 'undefined') {
    alert(`Success: ${message}`);
    return;
  }
  
  Toastify({
    text: message,
    duration: 3000,
    close: true,
    gravity: "top",
    position: "right",
    backgroundColor: "#10b981", // Green
    stopOnFocus: true
  }).showToast();
};

// Show error toast
export const showError = (message) => {
  if (typeof Toastify === 'undefined') {
    alert(`Error: ${message}`);
    return;
  }
  
  Toastify({
    text: message,
    duration: 4000,
    close: true,
    gravity: "top",
    position: "right",
    backgroundColor: "#ef4444", // Red
    stopOnFocus: true
  }).showToast();
};

// Show info toast
export const showInfo = (message) => {
  if (typeof Toastify === 'undefined') {
    alert(`Info: ${message}`);
    return;
  }
  
  Toastify({
    text: message,
    duration: 3000,
    close: true,
    gravity: "top",
    position: "right",
    backgroundColor: "#3b82f6", // Blue
    stopOnFocus: true
  }).showToast();
};

// Show warning toast
export const showWarning = (message) => {
  if (typeof Toastify === 'undefined') {
    alert(`Warning: ${message}`);
    return;
  }
  
  Toastify({
    text: message,
    duration: 3500,
    close: true,
    gravity: "top",
    position: "right",
    backgroundColor: "#f59e0b", // Amber
    stopOnFocus: true
  }).showToast();
};
