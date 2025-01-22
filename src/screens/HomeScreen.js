// src/screens/HomeScreen.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  ScrollView, 
  StyleSheet,
  TouchableOpacity,
  Text 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CategoryGroup from '../components/timer/CategoryGroup';
import Modal from '../components/common/Modal';
import { useNavigation } from '@react-navigation/native';

const HomeScreen = () => {
  const navigation = useNavigation();
  const [timers, setTimers] = useState([]);
  const [completedTimer, setCompletedTimer] = useState(null);
  const [halfwayAlert, setHalfwayAlert] = useState(null);

  useEffect(() => {
    loadTimers();
  }, []);

  const loadTimers = async () => {
    try {
      const stored = await AsyncStorage.getItem('timers');
      if (stored) {
        setTimers(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading timers:', error);
    }
  };

  const handleTimerComplete = async (timer) => {
    setCompletedTimer(timer);
    
    // Save to history
    try {
      const history = await AsyncStorage.getItem('timerHistory') || '[]';
      const historyData = JSON.parse(history);
      historyData.push({
        ...timer,
        completedAt: new Date().toISOString()
      });
      await AsyncStorage.setItem('timerHistory', JSON.stringify(historyData));
    } catch (error) {
      console.error('Error saving to history:', error);
    }
  };

  const handleHalfwayAlert = (timerName) => {
    setHalfwayAlert(timerName);
  };

  // Group timers by category
  const groupedTimers = timers.reduce((groups, timer) => {
    const category = timer.category || 'Uncategorized';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(timer);
    return groups;
  }, {});

  return (
    <View style={styles.container}>
      <ScrollView>
        {Object.entries(groupedTimers).map(([category, categoryTimers]) => (
          <CategoryGroup
            key={category}
            category={category}
            timers={categoryTimers}
            onTimerComplete={handleTimerComplete}
            onHalfwayAlert={handleHalfwayAlert}
          />
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddTimer')}
        >
          <Text style={styles.addButtonText}>Add Timer</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => navigation.navigate('History')}
        >
          <Text style={styles.historyButtonText}>View History</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={!!completedTimer}
        onClose={() => setCompletedTimer(null)}
        title="Timer Completed!"
        message={`Congratulations! "${completedTimer?.name}" has been completed.`}
      />

      <Modal
        visible={!!halfwayAlert}
        onClose={() => setHalfwayAlert(null)}
        title="Halfway Point"
        message={`"${halfwayAlert}" has reached its halfway point!`}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  footer: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  historyButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  historyButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default HomeScreen;