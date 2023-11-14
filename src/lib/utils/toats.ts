import { toast } from '@zerodevx/svelte-toast';

export type Toasts = {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
};

export const toasts: Toasts = {
  success: (message: string) =>
    toast.push(message, {
      theme: {
        '--toastBackground': '#4caf50',
        '--toastColor': '#fff',
        '--toastBarBackground': '#367d39',
      },
    }),
  error: (message: string) =>
    toast.push(message, {
      theme: {
        '--toastBackground': '#f44336',
        '--toastColor': '#fff',
        '--toastBarBackground': '#b53128',
      },
    }),
  info: (message: string) =>
    toast.push(message, {
      theme: {
        '--toastBackground': '#2196f3',
        '--toastColor': '#fff',
        '--toastBarBackground': '#176eb3',
      },
    }),
  warning: (message: string) =>
    toast.push(message, {
      theme: {
        '--toastBackground': '#ff9800',
        '--toastColor': '#fff',
        '--toastBarBackground': '#bd7202',
      },
    }),
};
