// src/screens/AddTimerScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';

const CATEGORIES = ['Workout', 'Study', 'Break', 'Work', 'Personal'];

const AddTimerScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [hasHalfwayAlert, setHasHalfwayAlert] = useState(false);

  const validateInputs = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a timer name');
      return false;
    }
    
    const durationNum = parseInt(duration);
    if (isNaN(durationNum) || durationNum <= 0) {
      Alert.alert('Error', 'Please enter a valid duration in seconds');
      return false;
    }
    
    return true;
  };

  const handleSave = async () => {
    if (!validateInputs()) return;

    try {
      // Get existing timers
      const existingTimers = await AsyncStorage.getItem('timers');
      const timers = existingTimers ? JSON.parse(existingTimers) : [];
      
      // Create new timer
      const newTimer = {
        id: Date.now().toString(),
        name: name.trim(),
        duration: parseInt(duration),
        category,
        hasHalfwayAlert,
        createdAt: new Date().toISOString()
      };
      
      // Add to existing timers
      timers.push(newTimer);
      
      // Save back to storage
      await AsyncStorage.setItem('timers', JSON.stringify(timers));
      
      // Navigate back to home
      navigation.goBack();
    } catch (error) {
      console.error('Error saving timer:', error);
      Alert.alert('Error', 'Failed to save timer. Please try again.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Timer Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter timer name"
            maxLength={30}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Duration (seconds)</Text>
          <TextInput
            style={styles.input}
            value={duration}
            onChangeText={setDuration}
            placeholder="Enter duration in seconds"
            keyboardType="number-pad"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={category}
              onValueChange={setCategory}
              style={styles.picker}
            >
              {CATEGORIES.map((cat) => (
                <Picker.Item key={cat} label={cat} value={cat} />
              ))}
            </Picker>
          </View>
        </View>

        <TouchableOpacity
          style={styles.alertToggle}
          onPress={() => setHasHalfwayAlert(!hasHalfwayAlert)}
        >
          <View style={[
            styles.checkbox,
            hasHalfwayAlert && styles.checkboxChecked
          ]} />
          <Text style={styles.alertText}>
            Enable halfway alert
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>Save Timer</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  form: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  alertToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#007AFF',
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
  },
  alertText: {
    fontSize: 16,
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddTimerScreen;