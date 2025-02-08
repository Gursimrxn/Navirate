import pandas as pd
from flask import jsonify
import os

class ProductService:
    def __init__(self):
        try:
            # Get the absolute path to the data directory
            current_dir = os.path.dirname(os.path.dirname(__file__))
            self.csv_file_path = os.path.join(current_dir, 'data', 'final_file.csv')
            print(f"Loading CSV from: {self.csv_file_path}")
            self.df = pd.read_csv(self.csv_file_path)
        except FileNotFoundError:
            print(f"Error: Could not find CSV file at {self.csv_file_path}")
            self.df = None

    def get_products_by_type(self, article_type):
        try:
            if self.df is None:
                return jsonify({"error": "Database not initialized"}), 500

            # Filter the DataFrame based on articleType
            filtered_data = self.df[
                self.df['articleType'].str.lower().str.contains(
                    article_type.lower(), 
                    na=False
                )
            ]

            if not filtered_data.empty:
                return jsonify(filtered_data.to_dict(orient='records'))
            else:
                return jsonify({
                    "message": "No items found for the given article type."
                }), 404

        except Exception as e:
            return jsonify({"error": str(e)}), 500

    def get_all_products(self):
        try:
            return jsonify(self.df.to_dict(orient='records'))
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    def get_products_by_category(self, category):
        try:
            filtered_data = self.df[
                self.df['masterCategory'].str.lower() == category.lower()
            ]
            
            if not filtered_data.empty:
                return jsonify(filtered_data.to_dict(orient='records'))
            else:
                return jsonify({
                    "message": "No items found in this category."
                }), 404

        except Exception as e:
            return jsonify({"error": str(e)}), 500 