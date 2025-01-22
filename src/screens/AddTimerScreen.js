import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { storage } from '../utils/storage';

const AddTimerScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('');
  const [category, setCategory] = useState('Workout');

  const categories = [
    { id: 'workout', label: 'Workout', icon: 'dumbbell' },
    { id: 'study', label: 'Study', icon: 'book-open-variant' },
    { id: 'break', label: 'Break', icon: 'coffee' },
    { id: 'other', label: 'Other', icon: 'dots-horizontal' },
  ];

  const handleSave = async () => {
    if (!name || !duration) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const newTimer = {
      id: Date.now().toString(),
      name,
      duration: parseInt(duration),
      category,
      status: 'Paused',
      remainingTime: parseInt(duration),
      createdAt: new Date().toISOString(),
    };

    const success = await storage.saveTimer(newTimer);
    if (success) {
      Alert.alert('Success', 'Timer created successfully');
      navigation.goBack();
    } else {
      Alert.alert('Error', 'Failed to create timer');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Icon name="timer-plus" size={wp('8%')} color="#007AFF" />
        <Text style={styles.title}>Create New Timer</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Name</Text>
          <View style={styles.inputWrapper}>
            <Icon name="pencil" size={wp('5%')} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter timer name"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Duration (seconds)</Text>
          <View style={styles.inputWrapper}>
            <Icon name="clock-outline" size={wp('5%')} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={duration}
              onChangeText={setDuration}
              placeholder="Enter duration"
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={category}
              onValueChange={(itemValue) => setCategory(itemValue)}
              style={styles.picker}
            >
              {categories.map((cat) => (
                <Picker.Item
                  key={cat.id}
                  label={cat.label}
                  value={cat.label}
                  style={styles.pickerItem}
                />
              ))}
            </Picker>
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Icon name="content-save" size={wp('5%')} color="#fff" />
          <Text style={styles.buttonText}>Save Timer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: wp('5%'),
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('4%'),
    paddingTop: hp('2%'),
  },
  title: {
    fontSize: wp('6%'),
    fontWeight: 'bold',
    marginLeft: wp('3%'),
    color: '#2c3e50',
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: wp('4%'),
    padding: wp('5%'),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputContainer: {
    marginBottom: hp('3%'),
  },
  label: {
    fontSize: wp('4%'),
    marginBottom: hp('1%'),
    color: '#34495e',
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: wp('2%'),
    backgroundColor: '#f8f9fa',
  },
  inputIcon: {
    padding: wp('3%'),
  },
  input: {
    flex: 1,
    padding: wp('3%'),
    fontSize: wp('4%'),
    color: '#2c3e50',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: wp('2%'),
    backgroundColor: '#f8f9fa',
    overflow: 'hidden',
  },
  picker: {
    height: hp('6%'),
  },
  pickerItem: {
    fontSize: wp('4%'),
  },
  button: {
    backgroundColor: '#007AFF',
    padding: wp('4%'),
    borderRadius: wp('2%'),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: hp('2%'),
  },
  buttonText: {
    color: '#fff',
    fontSize: wp('4%'),
    fontWeight: 'bold',
    marginLeft: wp('2%'),
  },
});

export default AddTimerScreen;