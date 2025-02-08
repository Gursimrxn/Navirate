from flask import Blueprint, request, jsonify
from app.services.anomaly_service import process_images
from app.services.sentiment_service import analyze_sentiment_text

analysis_bp = Blueprint('analysis', __name__)

@analysis_bp.route('/upload', methods=['POST'])
def upload_images():
    return process_images(request.files)

@analysis_bp.route('/analyze-sentiment', methods=['POST'])
def analyze_sentiment():
    return analyze_sentiment_text(request.get_json()) 