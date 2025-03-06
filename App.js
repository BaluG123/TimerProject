import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, View, Dimensions, Platform } from 'react-native';
import { Camera, useCameraDevice, useCameraFormat } from 'react-native-vision-camera';
import { Canvas, Circle } from '@shopify/react-native-skia';
import Animated, { useSharedValue, useAnimatedStyle } from 'react-native-reanimated';
// Import ML Kit face detection as default import
import FaceDetection from '@react-native-ml-kit/face-detection';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const App = () => {
  const [hasPermission, setHasPermission] = useState(false);
  const [feedback, setFeedback] = useState('Align your face within the circle');
  const [faceDetected, setFaceDetected] = useState(false);
  const faceRect = useSharedValue({ x: 0, y: 0, width: 0, height: 0 });
  const device = useCameraDevice('front');
  const camera = useRef(null);
  
  // For optimal performance, select a format that works well for face detection
  const format = useCameraFormat(device, [
    { videoResolution: { width: 720, height: 1280 } },
    { fps: 30 }
  ]);
  
  // Set up a timer for periodic face detection
  const [isProcessing, setIsProcessing] = useState(false);
  
  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'granted');
    })();
    
    // Set up interval for periodic frame capture and processing
    const detectionInterval = setInterval(captureAndDetectFace, 300);
    
    return () => {
      clearInterval(detectionInterval);
    };
  }, []);
  
  const captureAndDetectFace = async () => {
    // Only process if camera is ready and not already processing
    if (camera.current && !isProcessing && hasPermission) {
      try {
        setIsProcessing(true);
        
        // Take a photo
        const photo = await camera.current.takePhoto({
          flash: 'off',
          qualityPrioritization: 'speed',
          skipMetadata: true,
        });
        
        // Process the photo with ML Kit
        const faces = await FaceDetection.detectFromFile(`file://${photo.path}`, {
          landmarkMode: 'all',
          contourMode: 'all',
          classificationMode: 'all'
        });
        
        // If faces detected, update UI
        if (faces && faces.length > 0) {
          const face = faces[0];
          setFaceDetected(true);
          
          // Convert face coordinates to screen coordinates
          const bounds = face.boundingBox || face.bounds;
          const convertedRect = {
            x: bounds.left * screenWidth / photo.width,
            y: bounds.top * screenHeight / photo.height,
            width: bounds.width * screenWidth / photo.width,
            height: bounds.height * screenHeight / photo.height,
          };
          
          // Update face rectangle
          faceRect.value = convertedRect;
          
          // Analyze face position and provide feedback
          const analysis = {
            isCentered: isFaceCentered(convertedRect),
            isProperDistance: isProperDistance(convertedRect.width),
            isStraight: isFaceStraight(face),
          };
          
          updateFeedback(analysis);
        } else {
          setFaceDetected(false);
          setFeedback('No face detected');
        }
      } catch (error) {
        console.error('Face detection error:', error);
        setFeedback('Error detecting face');
      } finally {
        setIsProcessing(false);
      }
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
      setFeedback('Perfect! Stay still...');
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
  
  const isFaceStraight = (face) => {
    // The face properties might vary based on the ML Kit version
    // Check the properties available in your ML Kit version
    const headEulerAngleY = face.headEulerAngleY || 0; // yaw
    const headEulerAngleX = face.headEulerAngleX || 0; // pitch
    const headEulerAngleZ = face.headEulerAngleZ || 0; // roll
    
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
  
  if (!device) return <Text style={styles.errorText}>No camera device found</Text>;
  if (!hasPermission) return <Text style={styles.errorText}>Camera permission denied</Text>;
  
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
      <Canvas style={styles.overlay}>
        <Circle
          cx={screenWidth / 2}
          cy={screenHeight / 2 - 50}
          r={screenWidth * 0.35}
          color="#FFFFFF30"
          style="stroke"
          strokeWidth={4}
        />
      </Canvas>
      <Animated.View style={animatedStyle} />
      <View style={styles.instructions}>
        <Text style={styles.feedbackText}>{feedback}</Text>
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
    bottom: 100,
    alignSelf: 'center',
    backgroundColor: '#00000080',
    padding: 16,
    borderRadius: 8,
  },
  feedbackText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'white',
    backgroundColor: 'red',
    padding: 20,
    fontSize: 18,
    textAlign: 'center',
  }
});

export default App;