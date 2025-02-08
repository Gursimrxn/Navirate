from flask import Blueprint, request, jsonify
from app.services.search_service import search_products

search_bp = Blueprint('search', __name__)

@search_bp.route('/search', methods=['POST'])
def search():
    try:
        data = request.get_json()
        article_type = data.get('articleType', '')
        return search_products(article_type)
    except Exception as e:
        return jsonify({"error": str(e)}), 500 