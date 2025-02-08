from flask import Blueprint, request, jsonify
from app.services.final_service import ProductService

product_bp = Blueprint('product', __name__)
product_service = ProductService()

@product_bp.route('/products', methods=['GET'])
def get_all_products():
    return product_service.get_all_products()

@product_bp.route('/products/type', methods=['POST'])
def get_products_by_type():
    try:
        data = request.get_json()
        article_type = data.get('articleType', '')
        return product_service.get_products_by_type(article_type)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@product_bp.route('/products/category', methods=['POST'])
def get_products_by_category():
    try:
        data = request.get_json()
        category = data.get('category', '')
        return product_service.get_products_by_category(category)
    except Exception as e:
        return jsonify({"error": str(e)}), 500 