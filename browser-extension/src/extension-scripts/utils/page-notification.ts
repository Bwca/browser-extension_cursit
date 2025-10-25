/**
 * Shows a notification directly on the page (for content scripts)
 * Creates an injected UI element that appears as a toast
 */
export function showPageNotification(
  message: string,
  type: 'error' | 'warning' | 'success' | 'info' = 'info'
) {
  // Remove any existing notifications
  const existingNotification = document.getElementById('cursit-notification');
  if (existingNotification) {
    existingNotification.remove();
  }

  // Create notification element
  const notification = document.createElement('div');
  notification.id = 'cursit-notification';
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    max-width: 400px;
    padding: 16px 20px;
    background: ${getBackgroundColor(type)};
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 999999;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    line-height: 1.5;
    animation: slideIn 0.3s ease-out;
  `;

  notification.innerHTML = `
    <div style="display: flex; align-items: start; gap: 12px;">
      <div style="flex-shrink: 0; font-size: 20px;">
        ${getIcon(type)}
      </div>
      <div style="flex: 1;">
        <strong style="display: block; margin-bottom: 4px;">${getTitle(type)}</strong>
        <div>${message}</div>
      </div>
      <button id="cursit-notification-close" style="
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        font-size: 20px;
        padding: 0;
        margin: 0;
        opacity: 0.7;
        flex-shrink: 0;
      ">×</button>
    </div>
  `;

  // Add animation styles
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);

  // Add to page
  document.body.appendChild(notification);

  // Close button handler
  const closeBtn = document.getElementById('cursit-notification-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      notification.style.animation = 'slideIn 0.3s ease-out reverse';
      setTimeout(() => notification.remove(), 300);
    });
  }

  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (notification.parentElement) {
      notification.style.animation = 'slideIn 0.3s ease-out reverse';
      setTimeout(() => notification.remove(), 300);
    }
  }, 5000);
}

function getBackgroundColor(type: string): string {
  switch (type) {
    case 'error':
      return '#ef4444';
    case 'warning':
      return '#f59e0b';
    case 'success':
      return '#10b981';
    case 'info':
    default:
      return '#3b82f6';
  }
}

function getIcon(type: string): string {
  switch (type) {
    case 'error':
      return '⚠️';
    case 'warning':
      return '⚡';
    case 'success':
      return '✓';
    case 'info':
    default:
      return 'ℹ️';
  }
}

function getTitle(type: string): string {
  switch (type) {
    case 'error':
      return 'Error';
    case 'warning':
      return 'Warning';
    case 'success':
      return 'Success';
    case 'info':
    default:
      return 'CursIt Extension';
  }
}
