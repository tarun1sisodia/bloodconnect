// Toast notification utility

// Create toast container if it doesn't exist
function createToastContainer() {
  let container = document.getElementById('toast-container');
  
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'fixed top-4 right-4 z-50 flex flex-col gap-2';
    document.body.appendChild(container);
  }
  
  return container;
}

// Create a toast element
function createToast(message, type) {
  const toast = document.createElement('div');
  
  // Set base classes
  toast.className = 'px-4 py-3 rounded-md shadow-md flex items-center justify-between max-w-xs animate-fade-in';
  
  // Set type-specific classes
  switch (type) {
    case 'success':
      toast.classList.add('bg-green-500', 'text-white');
      break;
    case 'error':
      toast.classList.add('bg-red-500', 'text-white');
      break;
    case 'warning':
      toast.classList.add('bg-yellow-500', 'text-white');
      break;
    case 'info':
    default:
      toast.classList.add('bg-blue-500', 'text-white');
      break;
  }
  
  // Add message
  toast.innerHTML = `
    <span>${message}</span>
    <button class="ml-4 text-white hover:text-gray-200 focus:outline-none">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  `;
  
  // Add close button event listener
  const closeButton = toast.querySelector('button');
  closeButton.addEventListener('click', () => {
    removeToast(toast);
  });
  
  return toast;
}

// Add toast to container
function showToast(message, type, duration = 3000) {
  const container = createToastContainer();
  const toast = createToast(message, type);
  
  container.appendChild(toast);
  
  // Auto-remove after duration
  setTimeout(() => {
    removeToast(toast);
  }, duration);
  
  return toast;
}

// Remove toast with animation
function removeToast(toast) {
  toast.classList.add('animate-fade-out');
  
  toast.addEventListener('animationend', () => {
    toast.remove();
  });
}

// Add CSS for animations
function addAnimationStyles() {
  if (document.getElementById('toast-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'toast-styles';
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes fadeOut {
      from { opacity: 1; transform: translateY(0); }
      to { opacity: 0; transform: translateY(-20px); }
    }
    
    .animate-fade-in {
      animation: fadeIn 0.3s ease-out forwards;
    }
    
    .animate-fade-out {
      animation: fadeOut 0.3s ease-out forwards;
    }
  `;
  
  document.head.appendChild(style);
}

// Initialize styles when script loads
addAnimationStyles();

// Export toast functions
export const showSuccess = (message, duration) => showToast(message, 'success', duration);
export const showError = (message, duration) => showToast(message, 'error', duration);
export const showWarning = (message, duration) => showToast(message, 'warning', duration);
export const showInfo = (message, duration) => showToast(message, 'info', duration);
