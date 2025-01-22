// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   TouchableOpacity,
//   Alert
// } from 'react-native';
// import { storage } from '../utils/storage';

// const TimerItem = ({ timer, onUpdate }) => {
//   const [remainingTime, setRemainingTime] = useState(timer.remainingTime);
//   const [intervalId, setIntervalId] = useState(null);

//   const updateTimer = async (newStatus, newRemainingTime) => {
//     const updatedTimer = {
//       ...timer,
//       status: newStatus,
//       remainingTime: newRemainingTime
//     };
//     await storage.updateTimer(updatedTimer);
//     onUpdate();
//   };

//   const handleStart = () => {
//     if (timer.status === 'Paused') {
//       const id = setInterval(() => {
//         setRemainingTime((prev) => {
//           if (prev <= 1) {
//             clearInterval(id);
//             updateTimer('Completed', 0);
//             Alert.alert('Timer Complete!', `${timer.name} has finished!`);
//             return 0;
//           }
//           return prev - 1;
//         });
//       }, 1000);
//       setIntervalId(id);
//       updateTimer('Running', remainingTime);
//     }
//   };

//   const handlePause = () => {
//     if (intervalId) {
//       clearInterval(intervalId);
//       setIntervalId(null);
//     }
//     updateTimer('Paused', remainingTime);
//   };

//   const handleReset = () => {
//     if (intervalId) {
//       clearInterval(intervalId);
//       setIntervalId(null);
//     }
//     setRemainingTime(timer.duration);
//     updateTimer('Paused', timer.duration);
//   };

//   useEffect(() => {
//     return () => {
//       if (intervalId) {
//         clearInterval(intervalId);
//       }
//     };
//   }, [intervalId]);

//   const progress = (remainingTime / timer.duration) * 100;

//   return (
//     <View style={styles.timerItem}>
//       <Text style={styles.timerName}>{timer.name}</Text>
//       <Text>Category: {timer.category}</Text>
//       <Text>Time Remaining: {remainingTime}s</Text>
//       <Text>Status: {timer.status}</Text>
      
//       <View style={styles.progressBar}>
//         <View 
//           style={[styles.progressFill, { width: `${progress}%` }]} 
//         />
//       </View>

//       <View style={styles.buttonRow}>
//         <TouchableOpacity 
//           style={styles.actionButton}
//           onPress={handleStart}
//           disabled={timer.status === 'Running' || timer.status === 'Completed'}
//         >
//           <Text style={styles.buttonText}>Start</Text>
//         </TouchableOpacity>
        
//         <TouchableOpacity 
//           style={styles.actionButton}
//           onPress={handlePause}
//           disabled={timer.status !== 'Running'}
//         >
//           <Text style={styles.buttonText}>Pause</Text>
//         </TouchableOpacity>
        
//         <TouchableOpacity 
//           style={styles.actionButton}
//           onPress={handleReset}
//         >
//           <Text style={styles.buttonText}>Reset</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// };

// const HomeScreen = ({ navigation }) => {
//   const [timers, setTimers] = useState([]);
//   const [categories, setCategories] = useState([]);

//   const loadTimers = async () => {
//     const loadedTimers = await storage.getTimers();
//     setTimers(loadedTimers);
//     const uniqueCategories = [...new Set(loadedTimers.map(timer => timer.category))];
//     setCategories(uniqueCategories);
//   };

//   useEffect(() => {
//     const unsubscribe = navigation.addListener('focus', loadTimers);
//     return unsubscribe;
//   }, [navigation]);

//   const handleBulkAction = async (category, action) => {
//     const categoryTimers = timers.filter(timer => timer.category === category);
//     for (const timer of categoryTimers) {
//       let updatedTimer = { ...timer };
//       switch (action) {
//         case 'start':
//           updatedTimer.status = 'Running';
//           break;
//         case 'pause':
//           updatedTimer.status = 'Paused';
//           break;
//         case 'reset':
//           updatedTimer.status = 'Paused';
//           updatedTimer.remainingTime = timer.duration;
//           break;
//       }
//       await storage.updateTimer(updatedTimer);
//     }
//     loadTimers();
//   };

//   const renderCategory = ({ item: category }) => {
//     const categoryTimers = timers.filter(timer => timer.category === category);
    
//     return (
//       <View style={styles.categoryContainer}>
//         <Text style={styles.categoryTitle}>{category}</Text>
        
//         <View style={styles.bulkActions}>
//           <TouchableOpacity 
//             style={styles.bulkButton}
//             onPress={() => handleBulkAction(category, 'start')}
//           >
//             <Text style={styles.buttonText}>Start All</Text>
//           </TouchableOpacity>
//           <TouchableOpacity 
//             style={styles.bulkButton}
//             onPress={() => handleBulkAction(category, 'pause')}
//           >
//             <Text style={styles.buttonText}>Pause All</Text>
//           </TouchableOpacity>
//           <TouchableOpacity 
//             style={styles.bulkButton}
//             onPress={() => handleBulkAction(category, 'reset')}
//           >
//             <Text style={styles.buttonText}>Reset All</Text>
//           </TouchableOpacity>
//         </View>

//         <FlatList
//           data={categoryTimers}
//           keyExtractor={(timer) => timer.id}
//           renderItem={({ item }) => (
//             <TimerItem timer={item} onUpdate={loadTimers} />
//           )}
//         />
//       </View>
//     );
//   };

//   return (
//     <View style={styles.container}>
//       <TouchableOpacity 
//         style={styles.addButton}
//         onPress={() => navigation.navigate('AddTimer')}
//       >
//         <Text style={styles.addButtonText}>Add New Timer</Text>
//       </TouchableOpacity>

//       <FlatList
//         data={categories}
//         keyExtractor={(category) => category}
//         renderItem={renderCategory}
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     backgroundColor: '#fff',
//   },
//   addButton: {
//     backgroundColor: '#007AFF',
//     padding: 15,
//     borderRadius: 5,
//     marginBottom: 20,
//     alignItems: 'center',
//   },
//   addButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   categoryContainer: {
//     marginBottom: 20,
//   },
//   categoryTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginBottom: 10,
//   },
//   bulkActions: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 10,
//   },
//   bulkButton: {
//     backgroundColor: '#007AFF',
//     padding: 8,
//     borderRadius: 5,
//     flex: 1,
//     marginHorizontal: 5,
//   },
//   buttonText: {
//     color: '#fff',
//     textAlign: 'center',
//   },
//   timerItem: {
//     backgroundColor: '#f5f5f5',
//     padding: 15,
//     borderRadius: 5,
//     marginBottom: 10,
//   },
//   timerName: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 5,
//   },
//   progressBar: {
//     height: 10,
//     backgroundColor: '#ddd',
//     borderRadius: 5,
//     marginVertical: 10,
//   },
//   progressFill: {
//     height: '100%',
//     backgroundColor: '#007AFF',
//     borderRadius: 5,
//   },
//   buttonRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 10,
//   },
//   actionButton: {
//     backgroundColor: '#007AFF',
//     padding: 8,
//     borderRadius: 5,
//     flex: 1,
//     marginHorizontal: 5,
//   },
// });

// export default HomeScreen;

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Share
} from 'react-native';
import { storage } from '../utils/storage';

const TimerItem = ({ timer, onUpdate, intervalRefs }) => {
  const [remainingTime, setRemainingTime] = useState(timer.remainingTime);

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

  return (
    <View style={styles.timerItem}>
      <Text style={styles.timerName}>{timer.name}</Text>
      <Text>Category: {timer.category}</Text>
      <Text>Time Remaining: {remainingTime}s</Text>
      <Text>Status: {timer.status}</Text>
      
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handleStart}
          disabled={timer.status === 'Running' || timer.status === 'Completed'}
        >
          <Text style={styles.buttonText}>Start</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handlePause}
          disabled={timer.status !== 'Running'}
        >
          <Text style={styles.buttonText}>Pause</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handleReset}
        >
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
        <Text style={styles.categoryTitle}>{category}</Text>
        
        <View style={styles.bulkActions}>
          <TouchableOpacity 
            style={styles.bulkButton}
            onPress={() => handleBulkAction(category, 'start')}
          >
            <Text style={styles.buttonText}>Start All</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.bulkButton}
            onPress={() => handleBulkAction(category, 'pause')}
          >
            <Text style={styles.buttonText}>Pause All</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.bulkButton}
            onPress={() => handleBulkAction(category, 'reset')}
          >
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
          <Text style={styles.addButtonText}>Add New Timer</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.exportButton}
          onPress={exportTimers}
        >
          <Text style={styles.buttonText}>Export</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={categories}
        keyExtractor={(category) => category}
        renderItem={renderCategory}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  addButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  exportButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  categoryContainer: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  bulkActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  bulkButton: {
    backgroundColor: '#007AFF',
    padding: 8,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
  },
  timerItem: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
  },
  timerName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  progressBar: {
    height: 10,
    backgroundColor: '#ddd',
    borderRadius: 5,
    marginVertical: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 5,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionButton: {
    backgroundColor: '#007AFF',
    padding: 8,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
  },
});

export default HomeScreen;