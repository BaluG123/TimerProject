import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import useTimer from '../../hooks/useTimer';
import TimerControls from './TimerControls';
import TimerProgress from './TimerProgress';
import { formatTime } from '../../utils/timeUtils';

const TimerCard = ({ 
  name, 
  duration, 
  onComplete, 
  isGroupRunning,
  onHalfway 
}) => {
  const timer = useTimer(duration);

  useEffect(() => {
    if (timer.isCompleted) {
      onComplete({ name, completedAt: new Date() });
    }
  }, [timer.isCompleted]);

  useEffect(() => {
    if (timer.halfwayAlertShown) {
      onHalfway(name);
    }
  }, [timer.halfwayAlertShown]);

  useEffect(() => {
    if (isGroupRunning) {
      timer.start();
    }
  }, [isGroupRunning]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.time}>
          {formatTime(timer.timeLeft)}
        </Text>
      </View>
      
      <TimerProgress progress={timer.progress} />
      
      <TimerControls
        isRunning={timer.isRunning}
        isCompleted={timer.isCompleted}
        onStart={timer.start}
        onPause={timer.pause}
        onReset={timer.reset}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
  },
  time: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
});

export default TimerCard;