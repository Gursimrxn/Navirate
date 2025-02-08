from transformers import pipeline
from flask import jsonify

# Initialize sentiment analyzer
classifier = pipeline("sentiment-analysis", framework="tf")

def analyze_sentiment_text(data):
    try:
        comment = data.get('comment')
        
        if not comment:
            return jsonify({"error": "No comment provided"}), 400

        # Analyze sentiment
        result = classifier([comment])[0]
        label = result['label']
        score = result['score']

        # Generate response based on sentiment
        if label == "POSITIVE":
            if score > 0.9:
                response = "We're thrilled that you love our product!"
            elif score > 0.75:
                response = "It's great to know you had a good experience."
            elif score > 0.5:
                response = "We're glad that you're happy with our product."
            else:
                response = "Thank you for your positive feedback."
        else:
            if score > 0.9:
                response = "We sincerely apologize for the inconvenience."
            elif score > 0.75:
                response = "We're sorry to hear about your experience."
            elif score > 0.5:
                response = "We regret that your experience didn't meet expectations."
            else:
                response = "We'll work on improving our service."

        return jsonify({
            "comment": comment,
            "sentiment": label,
            "confidence": score,
            "response": response
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500 