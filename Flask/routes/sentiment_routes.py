from flask import Blueprint
from services.sentiment_service import analyze_comment_sentiment

sentiment_bp = Blueprint("sentiment", __name__)

@sentiment_bp.route("/analyze-sentiment", methods=['POST'])
def analyze_sentiment():
    return analyze_comment_sentiment() 