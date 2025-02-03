// import React, { useState } from 'react';
// import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
// import { Picker } from '@react-native-picker/picker';
// import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import { storage } from '../utils/storage';

// const AddTimerScreen = ({ navigation }) => {
//   const [name, setName] = useState('');
//   const [duration, setDuration] = useState('');
//   const [category, setCategory] = useState('Workout');

//   const categories = [
//     { id: 'workout', label: 'Workout', icon: 'dumbbell' },
//     { id: 'study', label: 'Study', icon: 'book-open-variant' },
//     { id: 'break', label: 'Break', icon: 'coffee' },
//     { id: 'other', label: 'Other', icon: 'dots-horizontal' },
//   ];

//   const handleSave = async () => {
//     if (!name || !duration) {
//       Alert.alert('Error', 'Please fill in all fields');
//       return;
//     }

//     const newTimer = {
//       id: Date.now().toString(),
//       name,
//       duration: parseInt(duration),
//       category,
//       status: 'Paused',
//       remainingTime: parseInt(duration),
//       createdAt: new Date().toISOString(),
//     };

//     const success = await storage.saveTimer(newTimer);
//     if (success) {
//       Alert.alert('Success', 'Timer created successfully');
//       navigation.goBack();
//     } else {
//       Alert.alert('Error', 'Failed to create timer');
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <Icon name="timer-plus" size={wp('8%')} color="#007AFF" />
//         <Text style={styles.title}>Create New Timer</Text>
//       </View>

//       <View style={styles.form}>
//         <View style={styles.inputContainer}>
//           <Text style={styles.label}>Name</Text>
//           <View style={styles.inputWrapper}>
//             <Icon name="pencil" size={wp('5%')} color="#666" style={styles.inputIcon} />
//             <TextInput
//               style={styles.input}
//               value={name}
//               onChangeText={setName}
//               placeholder="Enter timer name"
//               placeholderTextColor="#999"
//             />
//           </View>
//         </View>

//         <View style={styles.inputContainer}>
//           <Text style={styles.label}>Duration (seconds)</Text>
//           <View style={styles.inputWrapper}>
//             <Icon name="clock-outline" size={wp('5%')} color="#666" style={styles.inputIcon} />
//             <TextInput
//               style={styles.input}
//               value={duration}
//               onChangeText={setDuration}
//               placeholder="Enter duration"
//               keyboardType="numeric"
//               placeholderTextColor="#999"
//             />
//           </View>
//         </View>

//         <View style={styles.inputContainer}>
//           <Text style={styles.label}>Category</Text>
//           <View style={styles.pickerWrapper}>
//             <Picker
//               selectedValue={category}
//               onValueChange={(itemValue) => setCategory(itemValue)}
//               style={styles.picker}
//             >
//               {categories.map((cat) => (
//                 <Picker.Item
//                   key={cat.id}
//                   label={cat.label}
//                   value={cat.label}
//                   style={styles.pickerItem}
//                 />
//               ))}
//             </Picker>
//           </View>
//         </View>

//         <TouchableOpacity style={styles.button} onPress={handleSave}>
//           <Icon name="content-save" size={wp('5%')} color="#fff" />
//           <Text style={styles.buttonText}>Save Timer</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: wp('5%'),
//     backgroundColor: '#f8f9fa',
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: hp('4%'),
//     paddingTop: hp('2%'),
//   },
//   title: {
//     fontSize: wp('6%'),
//     fontWeight: 'bold',
//     marginLeft: wp('3%'),
//     color: '#2c3e50',
//   },
//   form: {
//     backgroundColor: '#fff',
//     borderRadius: wp('4%'),
//     padding: wp('5%'),
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   inputContainer: {
//     marginBottom: hp('3%'),
//   },
//   label: {
//     fontSize: wp('4%'),
//     marginBottom: hp('1%'),
//     color: '#34495e',
//     fontWeight: '600',
//   },
//   inputWrapper: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: '#e0e0e0',
//     borderRadius: wp('2%'),
//     backgroundColor: '#f8f9fa',
//   },
//   inputIcon: {
//     padding: wp('3%'),
//   },
//   input: {
//     flex: 1,
//     padding: wp('3%'),
//     fontSize: wp('4%'),
//     color: '#2c3e50',
//   },
//   pickerWrapper: {
//     borderWidth: 1,
//     borderColor: '#e0e0e0',
//     borderRadius: wp('2%'),
//     backgroundColor: '#f8f9fa',
//     overflow: 'hidden',
//   },
//   picker: {
//     height: hp('6%'),
//   },
//   pickerItem: {
//     fontSize: wp('4%'),
//   },
//   button: {
//     backgroundColor: '#007AFF',
//     padding: wp('4%'),
//     borderRadius: wp('2%'),
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginTop: hp('2%'),
//   },
//   buttonText: {
//     color: '#fff',
//     fontSize: wp('4%'),
//     fontWeight: 'bold',
//     marginLeft: wp('2%'),
//   },
// });

// export default AddTimerScreen;

import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { storage } from '../utils/storage';

const AddTimerScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('');
  const [category, setCategory] = useState('Workout');

  const categories = [
    { id: 'workout', label: 'Workout', icon: 'dumbbell', colors: ['#4CAF50', '#45B649'] },
    { id: 'study', label: 'Study', icon: 'book-open-variant', colors: ['#2196F3', '#1976D2'] },
    { id: 'meditation', label: 'Meditation', icon: 'meditation', colors: ['#9C27B0', '#7B1FA2'] },
    { id: 'cooking', label: 'Cooking', icon: 'pot-steam', colors: ['#FF5722', '#F4511E'] },
    { id: 'reading', label: 'Reading', icon: 'book-open-page-variant', colors: ['#795548', '#5D4037'] },
    { id: 'break', label: 'Break', icon: 'coffee', colors: ['#FF9800', '#F57C00'] },
    { id: 'exercise', label: 'Exercise', icon: 'run', colors: ['#00BCD4', '#0097A7'] },
    { id: 'work', label: 'Work', icon: 'briefcase', colors: ['#607D8B', '#455A64'] },
    { id: 'gaming', label: 'Gaming', icon: 'gamepad-variant', colors: ['#E91E63', '#C2185B'] },
    { id: 'housework', label: 'Housework', icon: 'home', colors: ['#8BC34A', '#689F38'] },
    // { id: 'custom', label: 'Custom', icon: 'dots-horizontal', colors: ['#9E9E9E', '#757575'] }
  ];

  const handleSave = async () => {
    if (!name || !duration) {
      ReactNativeHapticFeedback.trigger('notificationError');
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    ReactNativeHapticFeedback.trigger('impactMedium');
    
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
      ReactNativeHapticFeedback.trigger('notificationSuccess');
      Alert.alert('Success', 'Timer created successfully');
      navigation.goBack();
    } else {
      ReactNativeHapticFeedback.trigger('notificationError');
      Alert.alert('Error', 'Failed to create timer');
    }
  };

  const selectedCategory = categories.find(cat => cat.label === category);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.8)']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <LinearGradient
            colors={selectedCategory?.colors || ['#4CAF50', '#45B649']}
            style={styles.headerIconContainer}
          >
            <Icon name="timer-plus" size={wp('6%')} color="#fff" />
          </LinearGradient>
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
                placeholderTextColor="#666"
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
                placeholderTextColor="#666"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.pickerWrapper}>
              <View style={styles.selectedCategoryIcon}>
                <LinearGradient
                  colors={selectedCategory?.colors || ['#4CAF50', '#45B649']}
                  style={styles.categoryIconContainer}
                >
                  <Icon name={selectedCategory?.icon || 'dumbbell'} size={wp('5%')} color="#fff" />
                </LinearGradient>
              </View>
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

          <TouchableOpacity 
            style={styles.buttonContainer} 
            onPress={handleSave}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={selectedCategory?.colors || ['#4CAF50', '#45B649']}
              style={styles.button}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
            >
              <Icon name="content-save" size={wp('5%')} color="#fff" />
              <Text style={styles.buttonText}>Save Timer</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  gradient: {
    flex: 1,
    padding: wp('5%'),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('4%'),
    paddingTop: hp('2%'),
  },
  headerIconContainer: {
    width: wp('12%'),
    height: wp('12%'),
    borderRadius: wp('6%'),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp('3%'),
  },
  title: {
    fontSize: wp('6%'),
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  form: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: wp('4%'),
    padding: wp('5%'),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
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
    borderColor: 'rgba(224,224,224,0.5)',
    borderRadius: wp('2%'),
    backgroundColor: 'rgba(248,249,250,0.8)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
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
    borderColor: 'rgba(224,224,224,0.5)',
    borderRadius: wp('2%'),
    backgroundColor: 'rgba(248,249,250,0.8)',
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  selectedCategoryIcon: {
    padding: wp('2%'),
  },
  categoryIconContainer: {
    width: wp('10%'),
    height: wp('10%'),
    borderRadius: wp('5%'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  picker: {
    flex: 1,
    height: hp('6%'),
  },
  pickerItem: {
    fontSize: wp('4%'),
    color:'#666'
  },
  buttonContainer: {
    overflow: 'hidden',
    borderRadius: wp('2%'),
    marginTop: hp('2%'),
  },
  button: {
    padding: wp('4%'),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: wp('4%'),
    fontWeight: 'bold',
    marginLeft: wp('2%'),
  },
});

export default AddTimerScreen;