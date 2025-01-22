import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Share,
  Platform
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { storage } from '../utils/storage';

const TimerItem = ({ timer, onUpdate, intervalRefs }) => {
  const [remainingTime, setRemainingTime] = useState(timer.remainingTime);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const updateTimer = async (newStatus, newRemainingTime) => {
    const updatedTimer = {
      ...timer,
      status: newStatus,
      remainingTime: newRemainingTime
    };
    await storage.updateTimer(updatedTimer);
    onUpdate();
  };

  const handleStart = () => {
    if (timer.status === 'Paused') {
      const id = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1) {
            clearInterval(id);
            updateTimer('Completed', 0);
            Alert.alert('Timer Complete!', `${timer.name} has finished!`);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      intervalRefs.current[timer.id] = id;
      updateTimer('Running', remainingTime);
    }
  };

  const handlePause = () => {
    if (intervalRefs.current[timer.id]) {
      clearInterval(intervalRefs.current[timer.id]);
      delete intervalRefs.current[timer.id];
    }
    updateTimer('Paused', remainingTime);
  };

  const handleReset = () => {
    if (intervalRefs.current[timer.id]) {
      clearInterval(intervalRefs.current[timer.id]);
      delete intervalRefs.current[timer.id];
    }
    setRemainingTime(timer.duration);
    updateTimer('Paused', timer.duration);
  };

  useEffect(() => {
    return () => {
      if (intervalRefs.current[timer.id]) {
        clearInterval(intervalRefs.current[timer.id]);
        delete intervalRefs.current[timer.id];
      }
    };
  }, [timer.id]);

  const progress = (remainingTime / timer.duration) * 100;
  const getStatusColor = () => {
    switch (timer.status) {
      case 'Running': return '#28a745';
      case 'Paused': return '#ffc107';
      case 'Completed': return '#dc3545';
      default: return '#6c757d';
    }
  };

  return (
    <View style={styles.timerItem}>
      <View style={styles.timerHeader}>
        <View>
          <Text style={styles.timerName}>{timer.name}</Text>
          <Text style={styles.categoryText}>
            <Icon name="folder-outline" size={wp('3.5%')} color="#666" />
            {' '}{timer.category}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.statusText}>{timer.status}</Text>
        </View>
      </View>

      <Text style={styles.timeText}>
        <Icon name="clock-outline" size={wp('4%')} color="#666" />
        {' '}{formatTime(remainingTime)}
      </Text>
      
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>{Math.round(progress)}%</Text>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity 
          style={[styles.actionButton, timer.status === 'Running' && styles.actionButtonDisabled]}
          onPress={handleStart}
          disabled={timer.status === 'Running' || timer.status === 'Completed'}
        >
          <Icon name="play" size={wp('5%')} color="#fff" />
          <Text style={styles.buttonText}>Start</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, timer.status !== 'Running' && styles.actionButtonDisabled]}
          onPress={handlePause}
          disabled={timer.status !== 'Running'}
        >
          <Icon name="pause" size={wp('5%')} color="#fff" />
          <Text style={styles.buttonText}>Pause</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handleReset}
        >
          <Icon name="restart" size={wp('5%')} color="#fff" />
          <Text style={styles.buttonText}>Reset</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const HomeScreen = ({ navigation }) => {
  const [timers, setTimers] = useState([]);
  const [categories, setCategories] = useState([]);
  const intervalRefs = React.useRef({});

  const loadTimers = async () => {
    const loadedTimers = await storage.getTimers();
    setTimers(loadedTimers);
    const uniqueCategories = [...new Set(loadedTimers.map(timer => timer.category))];
    setCategories(uniqueCategories);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadTimers);
    return () => {
      // Clear all intervals when unmounting
      Object.values(intervalRefs.current).forEach(id => clearInterval(id));
      intervalRefs.current = {};
      unsubscribe();
    };
  }, [navigation]);

  const handleBulkAction = async (category, action) => {
    const categoryTimers = timers.filter(timer => timer.category === category);
    
    for (const timer of categoryTimers) {
      // Clear existing interval if any
      if (intervalRefs.current[timer.id]) {
        clearInterval(intervalRefs.current[timer.id]);
        delete intervalRefs.current[timer.id];
      }

      let updatedTimer = { ...timer };
      
      switch (action) {
        case 'start':
          if (timer.status === 'Paused' && timer.remainingTime > 0) {
            const id = setInterval(async () => {
              const currentTimer = await storage.getTimers().then(
                timers => timers.find(t => t.id === timer.id)
              );
              
              if (currentTimer.remainingTime <= 1) {
                clearInterval(id);
                await storage.updateTimer({
                  ...currentTimer,
                  status: 'Completed',
                  remainingTime: 0
                });
                loadTimers();
              } else {
                await storage.updateTimer({
                  ...currentTimer,
                  remainingTime: currentTimer.remainingTime - 1
                });
                loadTimers();
              }
            }, 1000);
            
            intervalRefs.current[timer.id] = id;
            updatedTimer.status = 'Running';
          }
          break;
          
        case 'pause':
          updatedTimer.status = 'Paused';
          break;
          
        case 'reset':
          updatedTimer.status = 'Paused';
          updatedTimer.remainingTime = timer.duration;
          break;
      }
      
      await storage.updateTimer(updatedTimer);
    }
    loadTimers();
  };

  const exportTimers = async () => {
    try {
      const formattedTimers = timers.map(timer => ({
        name: timer.name,
        category: timer.category,
        duration: timer.duration,
        status: timer.status,
        remainingTime: timer.remainingTime,
        createdAt: new Date(timer.createdAt).toLocaleString()
      }));

      const exportData = JSON.stringify(formattedTimers, null, 2);
      await Share.share({
        message: exportData,
        title: 'Timer Data Export'
      });
    } catch (error) {
      Alert.alert('Export Error', 'Failed to export timer data');
      console.error('Export error:', error);
    }
  };
  const renderCategory = ({ item: category }) => {
    const categoryTimers = timers.filter(timer => timer.category === category);
    
    return (
      <View style={styles.categoryContainer}>
        <View style={styles.categoryHeader}>
          <Icon name="folder" size={wp('6%')} color="#007AFF" />
          <Text style={styles.categoryTitle}>{category}</Text>
        </View>
        
        <View style={styles.bulkActions}>
          <TouchableOpacity 
            style={[styles.bulkButton, styles.startButton]}
            onPress={() => handleBulkAction(category, 'start')}
          >
            <Icon name="play-circle" size={wp('5%')} color="#fff" />
            <Text style={styles.buttonText}>Start All</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.bulkButton, styles.pauseButton]}
            onPress={() => handleBulkAction(category, 'pause')}
          >
            <Icon name="pause-circle" size={wp('5%')} color="#fff" />
            <Text style={styles.buttonText}>Pause All</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.bulkButton, styles.resetButton]}
            onPress={() => handleBulkAction(category, 'reset')}
          >
            <Icon name="restart" size={wp('5%')} color="#fff" />
            <Text style={styles.buttonText}>Reset All</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={categoryTimers}
          keyExtractor={(timer) => timer.id}
          renderItem={({ item }) => (
            <TimerItem 
              timer={item} 
              onUpdate={loadTimers}
              intervalRefs={intervalRefs}
            />
          )}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('AddTimer')}
        >
          <Icon name="plus" size={wp('5%')} color="#fff" />
          <Text style={styles.addButtonText}>Add New Timer</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.exportButton}
          onPress={exportTimers}
        >
          <Icon name="export" size={wp('5%')} color="#fff" />
          <Text style={styles.buttonText}>Export</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={categories}
        keyExtractor={(category) => category}
        renderItem={renderCategory}
        contentContainerStyle={styles.categoriesList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: wp('4%'),
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    marginBottom: hp('2%'),
    gap: wp('2%'),
  },
  addButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: hp('2%'),
    borderRadius: wp('2%'),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp('2%'),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  exportButton: {
    backgroundColor: '#28a745',
    padding: hp('2%'),
    borderRadius: wp('2%'),
    alignItems: 'center',
    justifyContent: 'center',
    width: wp('20%'),
    flexDirection: 'row',
    gap: wp('1%'),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  addButtonText: {
    color: '#fff',
    fontSize: wp('4%'),
    fontWeight: 'bold',
  },
  categoriesList: {
    gap: hp('2%'),
  },
  categoryContainer: {
    marginBottom: hp('2%'),
    backgroundColor: '#f8f9fa',
    borderRadius: wp('3%'),
    padding: wp('4%'),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('2%'),
    marginBottom: hp('1%'),
  },
  categoryTitle: {
    fontSize: wp('5%'),
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  bulkActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp('2%'),
    gap: wp('2%'),
  },
  bulkButton: {
    padding: hp('1%'),
    borderRadius: wp('2%'),
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp('1%'),
  },
  startButton: {
    backgroundColor: '#28a745',
  },
  pauseButton: {
    backgroundColor: '#ffc107',
  },
  resetButton: {
    backgroundColor: '#6c757d',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: wp('3.5%'),
    fontWeight: '600',
  },
  timerItem: {
    backgroundColor: '#fff',
    padding: wp('4%'),
    borderRadius: wp('3%'),
    marginBottom: hp('1%'),
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  timerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('1%'),
  },
  timerName: {
    fontSize: wp('4.5%'),
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: hp('0.5%'),
  },
  categoryText: {
    fontSize: wp('3.5%'),
    color: '#666',
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: wp('4%'),
    color: '#2c3e50',
    marginVertical: hp('1%'),
  },
  statusBadge: {
    paddingHorizontal: wp('2%'),
    paddingVertical: hp('0.5%'),
    borderRadius: wp('4%'),
  },
  statusText: {
    color: '#fff',
    fontSize: wp('3%'),
    fontWeight: '600',
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('2%'),
  },
  progressBar: {
    flex: 1,
    height: hp('1.5%'),
    backgroundColor: '#e9ecef',
    borderRadius: wp('1%'),
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: wp('1%'),
  },
  progressText: {
    fontSize: wp('3%'),
    color: '#666',
    width: wp('10%'),
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: hp('2%'),
    gap: wp('2%'),
  },
  actionButton: {
    backgroundColor: '#007AFF',
    padding: hp('1%'),
    borderRadius: wp('2%'),
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp('1%'),
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
});

export default HomeScreen;