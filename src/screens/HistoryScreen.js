import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Share
} from 'react-native';
import { storage } from '../utils/storage';

const HistoryScreen = () => {
  const [history, setHistory] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const loadHistory = async () => {
    const historyData = await storage.getHistory();
    setHistory(historyData.sort((a, b) => 
      new Date(b.completedAt) - new Date(a.completedAt)
    ));
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const getCategories = () => {
    const categories = [...new Set(history.map(item => item.category))];
    return ['All', ...categories];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const exportHistory = async () => {
    try {
      const exportData = JSON.stringify(history, null, 2);
      await Share.share({
        message: exportData,
        title: 'Timer History Export'
      });
    } catch (error) {
      console.error('Error exporting history:', error);
    }
  };

  const renderHistoryItem = ({ item }) => (
    <View style={styles.historyItem}>
      <Text style={styles.itemTitle}>{item.name}</Text>
      <Text style={styles.itemDetail}>Category: {item.category}</Text>
      <Text style={styles.itemDetail}>Duration: {item.duration} seconds</Text>
      <Text style={styles.itemDetail}>Completed: {formatDate(item.completedAt)}</Text>
    </View>
  );

  const filteredHistory = selectedCategory === 'All' 
    ? history 
    : history.filter(item => item.category === selectedCategory);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Timer History</Text>
      
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          data={getCategories()}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedCategory === item && styles.filterButtonActive
              ]}
              onPress={() => setSelectedCategory(item)}
            >
              <Text style={[
                styles.filterButtonText,
                selectedCategory === item && styles.filterButtonTextActive
              ]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      <TouchableOpacity style={styles.exportButton} onPress={exportHistory}>
        <Text style={styles.exportButtonText}>Export History</Text>
      </TouchableOpacity>

      <FlatList
        data={filteredHistory}
        keyExtractor={(item) => item.completedAt}
        renderItem={renderHistoryItem}
        style={styles.list}
        contentContainerStyle={styles.listContent}
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  filterContainer: {
    marginBottom: 15,
  },
  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterButtonText: {
    color: '#333',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  exportButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 5,
    marginBottom: 15,
    alignItems: 'center',
  },
  exportButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  historyItem: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  itemDetail: {
    color: '#666',
    marginBottom: 3,
  },
});

export default HistoryScreen;