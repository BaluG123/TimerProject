export const formatTime = (seconds) => {
    if (seconds < 0) return '00:00';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    
    return `${formattedMinutes}:${formattedSeconds}`;
  };
  
  export const parseTimeInput = (input) => {
    // Convert MM:SS format to seconds
    const parts = input.split(':');
    if (parts.length === 2) {
      const minutes = parseInt(parts[0], 10);
      const seconds = parseInt(parts[1], 10);
      if (!isNaN(minutes) && !isNaN(seconds)) {
        return minutes * 60 + seconds;
      }
    }
    // If not in MM:SS format, try parsing as seconds
    const totalSeconds = parseInt(input, 10);
    return isNaN(totalSeconds) ? 0 : totalSeconds;
  };
  
  export const formatDatetime = (date) => {
    if (typeof date === 'string') {
      date = new Date(date);
    }
    
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };