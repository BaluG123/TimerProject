import { useState, useEffect, useCallback } from 'react';

const useTimer = (initialDuration) => {
  const [duration, setDuration] = useState(initialDuration);
  const [timeLeft, setTimeLeft] = useState(initialDuration);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [halfwayAlertShown, setHalfwayAlertShown] = useState(false);

  const start = useCallback(() => {
    if (timeLeft > 0) {
      setIsRunning(true);
    }
  }, [timeLeft]);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    setTimeLeft(duration);
    setIsRunning(false);
    setIsCompleted(false);
    setHalfwayAlertShown(false);
  }, [duration]);

  useEffect(() => {
    let interval;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => {
          const newTime = prevTime - 1;
          
          // Check for halfway point
          if (!halfwayAlertShown && newTime <= duration / 2) {
            setHalfwayAlertShown(true);
          }
          
          // Check for completion
          if (newTime <= 0) {
            setIsCompleted(true);
            setIsRunning(false);
          }
          
          return newTime;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isRunning, duration, halfwayAlertShown]);

  return {
    timeLeft,
    isRunning,
    isCompleted,
    halfwayAlertShown,
    start,
    pause,
    reset,
    progress: ((duration - timeLeft) / duration) * 100
  };
};

export default useTimer;