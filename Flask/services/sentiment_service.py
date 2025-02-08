from flask import request, jsonify
from transformers import pipeline

# Initialize the sentiment analysis pipeline with the TensorFlow backend
classifier = pipeline("sentiment-analysis", framework="tf")

def analyze_comment_sentiment():
    data = request.get_json()
    comment = data.get('comment') if data else None
    
    if not comment:
        return jsonify({"error": "No comment provided"}), 400

    # Convert the generator output to a list so we can subscript it
    result = list(classifier([comment]))[0]
    label = result['label']
    score = result['score']

    # Generate a human‑like response based on sentiment and confidence score
    if label == "POSITIVE":
        if score > 0.9:
            response_text = "We're thrilled that you love our product. Thank you for your kind words, and we look forward to serving you again."
        elif score > 0.75:
            response_text = "It's great to know that you had a good experience. Thank you for your support, and we hope to see you again soon."
        elif score > 0.5:
            response_text = "We're glad that you're happy with our product. Thank you for choosing us."
        else:
            response_text = "Your feedback is positive, and we appreciate it. If there's anything more we can do, please let us know."
    elif label == "NEGATIVE":
        if score > 0.9:
            response_text = "We sincerely apologize for the inconvenience caused. Your experience matters to us, and we promise to ensure this doesn't happen again."
        elif score > 0.75:
            response_text = "We're sorry to hear about your experience. Please know that we're working on improving and will address this issue."
        elif score > 0.5:
            response_text = "We regret that your experience didn't meet your expectations. Thank you for your feedback, and we'll strive to do better."
        else:
            response_text = "We apologize if our product didn't fully meet your expectations. Your feedback is valuable to us, and we'll work on improving."
    else:
        response_text = "Thank you for your feedback. It seems neutral, but if there's anything specific you'd like to share, we're here to listen."

    return jsonify({
        "comment": comment,
        "sentiment": label,
        "confidence": score,
        "response": response_text
    }) 