import { format, formatDistanceToNow } from 'date-fns';

export const formatMessageTime = (date: Date): string => {
  const now = new Date();
  if (date.getDate() === now.getDate()) {
    return format(date, 'HH:mm');
  }
  return format(date, 'MMM d, HH:mm');
};

export const formatLastMessageTime = (date: Date): string => {
  return formatDistanceToNow(date, { addSuffix: true });
};