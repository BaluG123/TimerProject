import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, View, Dimensions, Image, ScrollView, TouchableOpacity, ActivityIndicator, FlatList, Alert } from 'react-native';
import { Camera, useCameraDevice, useCameraFormat } from 'react-native-vision-camera';
// import { Canvas, Circle } from '@shopify/react-native-skia';
import { Canvas, Circle } from '@shopify/react-native-skia';
import Animated, { useSharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { detectFaces, FaceDetectionOptions } from 'react-native-vision-camera-face-detector';
import RNFS from 'react-native-fs';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Define the directory for storing images
const IMAGES_DIRECTORY = `${RNFS.DocumentDirectoryPath}/captured_images`;

const App = () => {
  const [hasPermission, setHasPermission] = useState(false);
  const [feedback, setFeedback] = useState('Align your face within the circle');
  const [faceDetected, setFaceDetected] = useState(false);
  const [base64Preview, setBase64Preview] = useState(null);
  const [showDebugView, setShowDebugView] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [base64Length, setBase64Length] = useState(0);
  const [isCapturing, setIsCapturing] = useState(false);
  const [savedImages, setSavedImages] = useState([]);
  const [currentImagePath, setCurrentImagePath] = useState(null);
  const faceRect = useSharedValue({ x: 0, y: 0, width: 0, height: 0 });
  const device = useCameraDevice('front');
  const camera = useRef(null);
  const format = useCameraFormat(device, [
    { videoResolution: { width: 720, height: 1280 } },
    { fps: 30 },
  ]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    (async () => {
      // Request camera permission
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'granted');
      console.log('[PERMISSION] Camera permission:', status);
      
      // Create directory for storing images if it doesn't exist
      try {
        const directoryExists = await RNFS.exists(IMAGES_DIRECTORY);
        if (!directoryExists) {
          await RNFS.mkdir(IMAGES_DIRECTORY);
          console.log('[STORAGE] Created images directory:', IMAGES_DIRECTORY);
        }
        
        // Load existing saved images
        loadSavedImages();
      } catch (error) {
        console.error('[STORAGE] Error setting up storage:', error);
      }
    })();

    // We'll use face detection for guidance but not automatic capture
    const detectionInterval = setInterval(detectFace, 1000);
    return () => clearInterval(detectionInterval);
  }, []);

  const loadSavedImages = async () => {
    try {
      const files = await RNFS.readDir(IMAGES_DIRECTORY);
      const imageFiles = files
        .filter(file => file.name.endsWith('.jpg') || file.name.endsWith('.jpeg'))
        .sort((a, b) => b.mtime.getTime() - a.mtime.getTime()); // Sort by modification time (newest first)
      
      console.log(`[STORAGE] Found ${imageFiles.length} saved images`);
      setSavedImages(imageFiles);
    } catch (error) {
      console.error('[STORAGE] Error loading saved images:', error);
    }
  };

  const detectFace = async () => {
    if (camera.current && !isProcessing && hasPermission && !showDebugView && !isCapturing && !showGallery) {
      try {
        setIsProcessing(true);
        
        // Take a photo for face detection (low quality for speed)
        const photo = await camera.current.takePhoto({
          flash: 'off',
          qualityPrioritization: 'speed',
          skipMetadata: true,
          quality: 50, // Lower quality for faster processing
        });

        // Read the photo path for face detection
        const filePath = photo.path.startsWith('file://') ? photo.path : `file://${photo.path}`;
        
        // Set face detection options
        const faceDetectionOptions = {
          detectionMode: 'fast',
          landmarkMode: 'all',
          contourMode: 'all',
          classificationMode: 'all'
        };
        
        // Detect faces using react-native-vision-camera-face-detector
        const result = await detectFaces(filePath, faceDetectionOptions);
        const faces = result.faces;

        // Clean up the temporary photo
        try {
          await RNFS.unlink(filePath);
        } catch (err) {
          console.log("Error removing temp file:", err);
        }

        if (faces && faces.length > 0) {
          const face = faces[0];
          setFaceDetected(true);
          
          // Extract face bounds from the new library format
          const bounds = face.boundingBox || {
            x: face.frame.x,
            y: face.frame.y,
            width: face.frame.width,
            height: face.frame.height
          };
          
          const convertedRect = {
            x: bounds.x * screenWidth / photo.width,
            y: bounds.y * screenHeight / photo.height,
            width: bounds.width * screenWidth / photo.width,
            height: bounds.height * screenHeight / photo.height,
          };
          
          faceRect.value = convertedRect;
          
          // Extract face angles for proper positioning feedback
          const headEulerAngleY = face.yawAngle || 0; // Left/right rotation (yaw)
          const headEulerAngleX = face.pitchAngle || 0; // Up/down rotation (pitch)
          const headEulerAngleZ = face.rollAngle || 0; // Tilt rotation (roll)
          
          updateFeedback({
            isCentered: isFaceCentered(convertedRect),
            isProperDistance: isProperDistance(convertedRect.width),
            isStraight: isFaceStraight({
              headEulerAngleY,
              headEulerAngleX,
              headEulerAngleZ
            }),
          });
        } else {
          setFaceDetected(false);
          setFeedback('No face detected');
        }
      } catch (error) {
        console.error('[ERROR] Face detection failed:', error.message, error.stack);
        setFeedback('Error detecting face');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const capturePhoto = async () => {
    if (camera.current && !isCapturing) {
      try {
        setIsCapturing(true);
        setFeedback('Capturing photo...');
        
        // Take a high-quality photo
        const photo = await camera.current.takePhoto({
          flash: 'off',
          qualityPrioritization: 'quality',
          quality: 90,
        });
        
        // Get file path
        const filePath = photo.path.startsWith('file://') ? photo.path : `file://${photo.path}`;
        
        // Save to our app's directory with timestamp
        const timestamp = new Date().getTime();
        const fileName = `face_capture_${timestamp}.jpg`;
        const destinationPath = `${IMAGES_DIRECTORY}/${fileName}`;
        
        await RNFS.copyFile(filePath.replace('file://', ''), destinationPath);
        console.log('[STORAGE] Saved image to:', destinationPath);
        
        // Read the saved photo as base64
        const base64Image = await RNFS.readFile(destinationPath, 'base64');
        console.log('[DEBUG] Captured image base64 length:', base64Image.length);
        
        // Save base64 string for preview
        setBase64Preview(`data:image/jpeg;base64,${base64Image}`);
        setBase64Length(base64Image.length);
        setCurrentImagePath(destinationPath);
        
        // Reload saved images
        await loadSavedImages();
        
        // Show the debug view with the captured image
        setShowDebugView(true);
        
        // Clean up the original photo
        try {
          await RNFS.unlink(filePath.replace('file://', ''));
        } catch (err) {
          console.log("Error removing original file:", err);
        }
        
      } catch (error) {
        console.error('[ERROR] Photo capture failed:', error.message, error.stack);
        setFeedback('Error capturing photo');
        Alert.alert('Error', 'Failed to capture and save photo');
      } finally {
        setIsCapturing(false);
      }
    }
  };

  const deleteCurrentImage = async () => {
    if (currentImagePath) {
      try {
        await RNFS.unlink(currentImagePath);
        console.log('[STORAGE] Deleted image:', currentImagePath);
        
        // Reload saved images
        await loadSavedImages();
        setShowDebugView(false);
        setCurrentImagePath(null);
        setBase64Preview(null);
        
        Alert.alert('Success', 'Image deleted successfully');
      } catch (error) {
        console.error('[STORAGE] Error deleting image:', error);
        Alert.alert('Error', 'Failed to delete image');
      }
    }
  };

  const viewImage = async (imagePath) => {
    try {
      const base64Image = await RNFS.readFile(imagePath, 'base64');
      setBase64Preview(`data:image/jpeg;base64,${base64Image}`);
      setBase64Length(base64Image.length);
      setCurrentImagePath(imagePath);
      setShowGallery(false);
      setShowDebugView(true);
    } catch (error) {
      console.error('[STORAGE] Error loading image:', error);
      Alert.alert('Error', 'Failed to load image');
    }
  };

  const updateFeedback = (analysis) => {
    if (!analysis.isProperDistance) {
      setFeedback(faceRect.value.width < screenWidth * 0.6 ? 'Move closer' : 'Move farther');
    } else if (!analysis.isCentered) {
      setFeedback('Center your face in the circle');
    } else if (!analysis.isStraight) {
      setFeedback('Face the camera directly');
    } else {
      setFeedback('Perfect! Ready to capture');
    }
  };

  const isFaceCentered = (rect) => {
    const centerX = rect.x + rect.width / 2;
    const centerY = rect.y + rect.height / 2;
    return (
      Math.abs(centerX - screenWidth / 2) < 30 &&
      Math.abs(centerY - (screenHeight / 2 - 50)) < 30
    );
  };

  const isProperDistance = (faceWidth) => {
    return faceWidth > screenWidth * 0.4 && faceWidth < screenWidth * 0.6;
  };

  const isFaceStraight = (angles) => {
    const headEulerAngleY = angles.headEulerAngleY || 0; // yaw
    const headEulerAngleX = angles.headEulerAngleX || 0; // pitch
    const headEulerAngleZ = angles.headEulerAngleZ || 0; // roll

    return (
      Math.abs(headEulerAngleY) < 10 &&
      Math.abs(headEulerAngleX) < 8 &&
      Math.abs(headEulerAngleZ) < 10
    );
  };

  const animatedStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: faceRect.value.x,
    top: faceRect.value.y,
    width: faceRect.value.width,
    height: faceRect.value.height,
    borderColor: '#00FF00',
    borderWidth: 2,
    borderRadius: 8,
    display: faceDetected ? 'flex' : 'none',
  }));

  const toggleDebugView = () => {
    setShowDebugView(!showDebugView);
  };

  const toggleGallery = () => {
    if (showGallery) {
      setShowGallery(false);
    } else {
      loadSavedImages();
      setShowGallery(true);
      setShowDebugView(false);
    }
  };

  if (!device) return <Text style={styles.errorText}>No camera device found</Text>;
  if (!hasPermission) return <Text style={styles.errorText}>Camera permission denied</Text>;

  // Gallery view
  if (showGallery) {
    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Saved Images ({savedImages.length})</Text>
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={toggleGallery}
          >
            <Text style={styles.closeButtonText}>Back to Camera</Text>
          </TouchableOpacity>
        </View>
        
        {savedImages.length === 0 ? (
          <View style={styles.emptyGallery}>
            <Text style={styles.emptyGalleryText}>No saved images found</Text>
          </View>
        ) : (
          <FlatList
            data={savedImages}
            keyExtractor={(item) => item.path}
            numColumns={2}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.galleryItem}
                onPress={() => viewImage(item.path)}
              >
                <Image 
                  source={{ uri: `file://${item.path}` }}
                  style={styles.galleryImage}
                />
                <Text style={styles.galleryItemDate}>
                  {new Date(item.mtime).toLocaleString()}
                </Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.galleryList}
          />
        )}
      </View>
    );
  }

  // Debug view
  if (showDebugView) {
    return (
      <ScrollView style={styles.debugScrollView}>
        <View style={styles.headerContainer}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={toggleDebugView}
          >
            <Text style={styles.backButtonText}>Back to Camera</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.deleteButton} 
            onPress={deleteCurrentImage}
          >
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.debugTitle}>Captured Photo</Text>
        {base64Preview && (
          <>
            <Image 
              source={{ uri: base64Preview }} 
              style={styles.imagePreview}
              resizeMode="contain"
            />
            <View style={styles.infoContainer}>
              <Text style={styles.debugInfo}>Base64 Length: {base64Length} characters</Text>
              <Text style={styles.debugInfo}>Saved at: {currentImagePath}</Text>
            </View>
            
            <Text style={styles.debugTitle}>Base64 String Preview:</Text>
            <View style={styles.base64Container}>
              <Text style={styles.base64Text}>
                {base64Preview.substring(0, 50)}...
              </Text>
            </View>
            
            <Text style={styles.debugTitle}>Full Base64 String:</Text>
            <View style={styles.base64Container}>
              <Text style={styles.base64Text} selectable={true}>
                {base64Preview}
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    );
  }

  // Camera view
  return (
    <View style={styles.container}>
      <Camera
        ref={camera}
        style={StyleSheet.absoluteFill}
        device={device}
        format={format}
        isActive={true}
        photo={true}
        enableZoomGesture
      />
      <View style={[
  styles.overlay,
  {
    position: 'absolute',
    width: screenWidth * 0.7,
    height: screenWidth * 0.7,
    borderRadius: screenWidth * 0.35,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 4,
    top: screenHeight / 2 - screenWidth * 0.35 - 50,
    left: screenWidth / 2 - screenWidth * 0.35,
  }
]} />
      <Animated.View style={animatedStyle} />
      
      <View style={styles.instructions}>
        <Text style={styles.feedbackText}>{feedback}</Text>
      </View>
      
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={styles.galleryButton}
          onPress={toggleGallery}
        >
          <View style={styles.galleryIcon} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.captureButton, isCapturing && styles.disabledButton]}
          onPress={capturePhoto}
          disabled={isCapturing}
        >
          {isCapturing ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <View style={styles.captureInnerCircle} />
          )}
        </TouchableOpacity>
        
        <View style={styles.placeholder} /> {/* Placeholder for alignment */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  instructions: {
    position: 'absolute',
    bottom: 140,
    alignSelf: 'center',
    backgroundColor: '#00000080',
    padding: 16,
    borderRadius: 8,
  },
  feedbackText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  errorText: {
    color: 'white',
    backgroundColor: 'red',
    padding: 20,
    fontSize: 18,
    textAlign: 'center',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureInnerCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  galleryButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryIcon: {
    width: 28,
    height: 28,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: 'white',
  },
  placeholder: {
    width: 44,
    height: 44,
  },
  disabledButton: {
    opacity: 0.5,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#1a1a1a',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 8,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#FF5252',
    padding: 10,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  debugScrollView: {
    flex: 1,
    backgroundColor: '#121212',
  },
  debugTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    marginHorizontal: 15,
  },
  imagePreview: {
    width: screenWidth - 30,
    height: 400,
    borderRadius: 8,
    marginHorizontal: 15,
    backgroundColor: '#333',
  },
  infoContainer: {
    margin: 15,
  },
  debugInfo: {
    color: '#ddd',
    fontSize: 14,
    marginBottom: 8,
  },
  base64Container: {
    backgroundColor: '#1a1a1a',
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 15,
    marginBottom: 15,
  },
  base64Text: {
    color: '#4CAF50',
    fontFamily: 'monospace',
    fontSize: 12,
  },
  galleryList: {
    padding: 5,
  },
  galleryItem: {
    flex: 1,
    margin: 5,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
  },
  galleryImage: {
    width: '100%',
    height: 150,
  },
  galleryItemDate: {
    color: 'white',
    fontSize: 10,
    padding: 5,
    textAlign: 'center',
  },
  emptyGallery: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyGalleryText: {
    color: 'white',
    fontSize: 18,
  },
});

export default App;