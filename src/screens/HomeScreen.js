import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Share,
  Platform,
  Animated,
  Vibration
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from 'react-native-responsive-screen';
import{
  useAnimatedStyle,
  withSpring,
  withTiming,
  useSharedValue,
  withSequence,
  withRepeat,
  cancelAnimation,
  useAnimatedProps,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Path, Svg, Circle } from 'react-native-svg';
import { storage } from '../utils/storage';
import LinearGradient from 'react-native-linear-gradient';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const TimerItem = ({ timer, onUpdate, intervalRefs }) => {
  const [remainingTime, setRemainingTime] = React.useState(timer.remainingTime);
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const progressValue = useSharedValue(timer.remainingTime / timer.duration);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return hours > 0 
      ? `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      : `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const CIRCLE_LENGTH = 280; // Circumference of our progress circle
  const R = CIRCLE_LENGTH / (2 * Math.PI); // Radius

  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset = CIRCLE_LENGTH * (1 - progressValue.value);
    return {
      strokeDashoffset,
    };
  });

  const containerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { rotate: `${rotation.value}deg` },
      ],
    };
  });

  const pulseAnimation = () => {
    scale.value = withSequence(
      withSpring(1.1, { damping: 2 }),
      withSpring(1, { damping: 2 })
    );
    ReactNativeHapticFeedback.trigger('impactMedium');
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
      pulseAnimation();
      rotation.value = withRepeat(
        withTiming(360, { duration: 60000 }), 
        -1, // Infinite rotation
        false
      );
      
      const id = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1) {
            clearInterval(id);
            updateTimer('Completed', 0);
            cancelAnimation(rotation);
            Vibration.vibrate([0, 500, 200, 500]);
            ReactNativeHapticFeedback.trigger('notificationSuccess');
            Alert.alert(
              'Timer Complete! 🎉',
              `${timer.name} has finished!`,
              [{ text: 'OK', onPress: () => pulseAnimation() }]
            );
            return 0;
          }
          progressValue.value = withTiming((prev - 1) / timer.duration);
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
      cancelAnimation(rotation);
      pulseAnimation();
    }
    updateTimer('Paused', remainingTime);
  };

  const handleReset = () => {
    if (intervalRefs.current[timer.id]) {
      clearInterval(intervalRefs.current[timer.id]);
      delete intervalRefs.current[timer.id];
      cancelAnimation(rotation);
    }
    progressValue.value = withTiming(1);
    setRemainingTime(timer.duration);
    updateTimer('Paused', timer.duration);
    pulseAnimation();
  };

  useEffect(() => {
    return () => {
      if (intervalRefs.current[timer.id]) {
        clearInterval(intervalRefs.current[timer.id]);
        delete intervalRefs.current[timer.id];
        cancelAnimation(rotation);
      }
    };
  }, [timer.id]);

  const getStatusColor = () => {
    switch (timer.status) {
      case 'Running': return ['#4CAF50', '#45B649'];
      case 'Paused': return ['#FFA000', '#FF8F00'];
      case 'Completed': return ['#F44336', '#E53935'];
      default: return ['#757575', '#616161'];
    }
  };

  return (
    <Animated.View style={[styles.timerItem, containerStyle]}>
      <LinearGradient
        colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
        style={styles.glassBackground}
      >
        <View style={styles.timerHeader}>
          <View style={styles.timerInfo}>
            <Text style={styles.timerName}>{timer.name}</Text>
            <View style={styles.categoryWrapper}>
              <Icon name="folder" size={wp('4%')} color="#666" />
              <Text style={styles.categoryText}>{timer.category}</Text>
            </View>
          </View>
          <LinearGradient
            colors={getStatusColor()}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={styles.statusBadge}
          >
            <Icon 
              name={timer.status === 'Running' ? 'timer' : timer.status === 'Completed' ? 'check-circle' : 'pause-circle-filled'} 
              size={wp('4%')} 
              color="#fff" 
            />
            <Text style={styles.statusText}>{timer.status}</Text>
          </LinearGradient>
        </View>

        <View style={styles.circularProgressContainer}>
          <Svg style={styles.svg} viewBox={`0 0 ${R * 2 + 10} ${R * 2 + 10}`}>
            <Circle
              cx={R + 5}
              cy={R + 5}
              r={R}
              stroke="#E0E0E0"
              strokeWidth="10"
              fill="transparent"
            />
            <AnimatedCircle
              cx={R + 5}
              cy={R + 5}
              r={R}
              stroke={getStatusColor()[0]}
              strokeWidth="10"
              fill="transparent"
              strokeDasharray={CIRCLE_LENGTH}
              animatedProps={animatedProps}
              strokeLinecap="round"
            />
          </Svg>
          <View style={styles.timeDisplay}>
            <Text style={styles.timeText}>{formatTime(remainingTime)}</Text>
            <Text style={styles.progressText}>
              {Math.round((remainingTime / timer.duration) * 100)}%
            </Text>
          </View>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[
              styles.actionButton,
              timer.status === 'Running' && styles.actionButtonDisabled
            ]}
            onPress={handleStart}
            disabled={timer.status === 'Running' || timer.status === 'Completed'}
          >
            <LinearGradient
              colors={['#4CAF50', '#45B649']}
              style={styles.gradientButton}
            >
              <Icon name="play-arrow" size={wp('5%')} color="#fff" />
              <Text style={styles.buttonText}>Start</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.actionButton,
              timer.status !== 'Running' && styles.actionButtonDisabled
            ]}
            onPress={handlePause}
            disabled={timer.status !== 'Running'}
          >
            <LinearGradient
              colors={['#FFA000', '#FF8F00']}
              style={styles.gradientButton}
            >
              <Icon name="pause" size={wp('5%')} color="#fff" />
              <Text style={styles.buttonText}>Pause</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleReset}
          >
            <LinearGradient
              colors={['#757575', '#616161']}
              style={styles.gradientButton}
            >
              <Icon name="refresh" size={wp('5%')} color="#fff" />
              <Text style={styles.buttonText}>Reset</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const HomeScreen = ({ navigation }) => {
  const [timers, setTimers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const intervalRefs = React.useRef({});

  const loadTimers = async () => {
    const loadedTimers = await storage.getTimers();
    setTimers(loadedTimers);
    const uniqueCategories = [...new Set(loadedTimers.map(timer => timer.category))];
    setCategories(uniqueCategories);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTimers();
    setRefreshing(false);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadTimers);
    return () => {
      Object.values(intervalRefs.current).forEach(id => clearInterval(id));
      intervalRefs.current = {};
      unsubscribe();
    };
  }, [navigation]);

  const handleBulkAction = async (category, action) => {
    const categoryTimers = timers.filter(timer => timer.category === category);
    Vibration.vibrate(100);
    
    for (const timer of categoryTimers) {
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
      Alert.alert('Success', 'Timer data exported successfully!');
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
          <Icon name="folder" size={wp('7%')} color="#1976D2" />
          <Text style={styles.categoryTitle}>{category}</Text>
          <Text style={styles.timerCount}>
            {categoryTimers.length} timer{categoryTimers.length !== 1 ? 's' : ''}
          </Text>
        </View>
        
        <View style={styles.bulkActions}>
          <TouchableOpacity 
            style={[styles.bulkButton, { backgroundColor: '#4CAF50' }]}
            onPress={() => handleBulkAction(category, 'start')}
          >
            <Icon name="play-circle-filled" size={wp('5%')} color="#fff" />
            <Text style={styles.buttonText}>Start All</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.bulkButton, { backgroundColor: '#FFA000' }]}
            onPress={() => handleBulkAction(category, 'pause')}
          >
            <Icon name="pause-circle-filled" size={wp('5%')} color="#fff" />
            <Text style={styles.buttonText}>Pause All</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.bulkButton, { backgroundColor: '#757575' }]}
            onPress={() => handleBulkAction(category, 'reset')}
          >
            <Icon name="refresh" size={wp('5%')} color="#fff" />
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
          showsVerticalScrollIndicator={false}
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
          <Icon name="add-circle" size={wp('6%')} color="#fff" />
          <Text style={styles.addButtonText}>Add New Timer</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.exportButton}
          onPress={exportTimers}
        >
          <Icon name="ios-share" size={wp('5%')} color="#fff" />
          <Text style={styles.buttonText}>Export</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={categories}
        keyExtractor={(category) => category}
        renderItem={renderCategory}
        contentContainerStyle={styles.categoriesList}
        refreshing={refreshing}
        onRefresh={onRefresh}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  timerItem: {
    margin: wp('3%'),
    borderRadius: wp('4%'),
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  glassBackground: {
    padding: wp('4%'),
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  timerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('2%'),
  },
  timerInfo: {
    flex: 1,
  },
  timerName: {
    fontSize: wp('4.5%'),
    fontWeight: 'bold',
    color: '#333',
  },
  categoryWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp('0.5%'),
  },
  categoryText: {
    marginLeft: wp('1%'),
    color: '#666',
    fontSize: wp('3.5%'),
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('0.5%'),
    borderRadius: wp('4%'),
  },
  statusText: {
    color: '#fff',
    marginLeft: wp('1%'),
    fontSize: wp('3.5%'),
    fontWeight: '500',
  },
  circularProgressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: hp('2%'),
    height: wp('60%'),
  },
  svg: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  timeDisplay: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    fontSize: wp('8%'),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: hp('1%'),
  },
  progressText: {
    fontSize: wp('4%'),
    color: '#666',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: hp('2%'),
  },
  actionButton: {
    flex: 1,
    marginHorizontal: wp('1%'),
    borderRadius: wp('2%'),
    overflow: 'hidden',
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp('1.5%'),
  },
  buttonText: {
    color: '#fff',
    marginLeft: wp('1%'),
    fontSize: wp('3.5%'),
    fontWeight: '500',
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },

  // Rest of the styles (unchanged)
  container: {
    flex: 1,
    padding: wp('4%'),
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    marginBottom: hp('2%'),
    gap: wp('2%'),
  },
  addButton: {
    flex: 1,
    backgroundColor: '#1976D2',
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
    backgroundColor: '#4CAF50',
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
    paddingBottom: hp('2%'),
  },
  categoryContainer: {
    marginBottom: hp('2%'),
    backgroundColor: '#fff',
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
    color: '#1976D2',
    flex: 1,
  },
  timerCount: {
    fontSize: wp('3.5%'),
    color: '#757575',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: wp('2%'),
    paddingVertical: hp('0.5%'),
    borderRadius: wp('4%'),
  },
  bulkActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp('2%'),
    gap: wp('2%'),
  },
  bulkButton: {
    padding: hp('1.5%'),
    borderRadius: wp('2%'),
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp('1%'),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  }
});

export default HomeScreen;