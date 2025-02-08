from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import os
from tensorflow.keras.applications import ResNet50
from tensorflow.keras.applications.resnet50 import preprocess_input
from tensorflow.keras.preprocessing.image import load_img, img_to_array
from sklearn.metrics.pairwise import cosine_similarity

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Load pre-trained ResNet50 model (without the final classification layers)
model = ResNet50(weights="imagenet", include_top=False, pooling="avg")

# Function to process and extract normalized features from an image
def extract_features(image_path):
    try:
        # Load the image and resize it to the required input size for ResNet50
        image = load_img(image_path, target_size=(224, 224))
        image_array = img_to_array(image)
        image_array = np.expand_dims(image_array, axis=0)
        processed_image = preprocess_input(image_array)

        # Extract features using the pre-trained model
        features = model.predict(processed_image)
        normalized_features = features.flatten() / np.linalg.norm(features)  # Normalize the features
        return normalized_features
    except Exception as e:
        print(f"Error in extract_features: {str(e)}")
        return None

# Route to handle image upload and similarity calculation
@app.route('/upload', methods=['POST'])
def upload_images():
    try:
        # Check if the images are part of the request
        if 'image1' not in request.files or 'image2' not in request.files:
            return jsonify({'error': 'No images provided'}), 400

        image1 = request.files['image1']
        image2 = request.files['image2']

        # Save images temporarily
        image1_path = "image1.jpg"
        image2_path = "image2.jpg"
        image1.save(image1_path)
        image2.save(image2_path)

        # Extract normalized features for both images
        features1 = extract_features(image1_path)
        features2 = extract_features(image2_path)

        if features1 is None or features2 is None:
            return jsonify({'error': 'Error extracting features from one or both images'}), 500

        # Calculate cosine similarity between the two feature vectors
        similarity = cosine_similarity([features1], [features2])[0][0]

        # Clean up the saved images
        os.remove(image1_path)
        os.remove(image2_path)

        # Set a threshold for similarity
        threshold = 0.7  # Define your own threshold based on testing
        similarity_result = "similar" if similarity > threshold else "different"

        # Return the similarity score and classification
        return jsonify({
            'similarity_score': float(similarity),
            'similarity_result': similarity_result
        })

    except Exception as e:
        print(f"Error in upload_images: {str(e)}")
        return jsonify({'error': str(e)}), 500

def process_images(files):
    try:
        # Check if the images are part of the request
        if 'image1' not in files or 'image2' not in files:
            return jsonify({'error': 'No images provided'}), 400

        image1 = files['image1']
        image2 = files['image2']

        # Save images temporarily
        image1_path = "image1.jpg"
        image2_path = "image2.jpg"
        image1.save(image1_path)
        image2.save(image2_path)

        # Extract normalized features for both images
        features1 = extract_features(image1_path)
        features2 = extract_features(image2_path)

        if features1 is None or features2 is None:
            return jsonify({'error': 'Error extracting features from one or both images'}), 500

        # Calculate cosine similarity between the two feature vectors
        similarity = cosine_similarity([features1], [features2])[0][0]

        # Clean up the saved images
        os.remove(image1_path)
        os.remove(image2_path)

        # Set a threshold for similarity
        threshold = 0.7  # Define your own threshold based on testing
        similarity_result = "similar" if similarity > threshold else "different"

        # Return the similarity score and classification
        return jsonify({
            'similarity_score': float(similarity),
            'similarity_result': similarity_result
        })

    except Exception as e:
        print(f"Error in process_images: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
