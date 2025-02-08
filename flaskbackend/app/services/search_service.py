import pandas as pd
from flask import jsonify
import os

# Load the CSV file using relative path
current_dir = os.path.dirname(os.path.dirname(__file__))
csv_file_path = os.path.join(current_dir, 'data', 'final_file.csv')

try:
    df = pd.read_csv(csv_file_path)
except FileNotFoundError:
    print(f"Error: Could not find CSV file at {csv_file_path}")
    print(f"Current directory is: {current_dir}")
    df = None

def search_products(article_type):
    try:
        if df is None:
            return jsonify({"error": "Database not initialized"}), 500
            
        # Filter the DataFrame based on articleType
        filtered_data = df[df['articleType'].str.lower().str.contains(article_type.lower(), na=False)]

        if not filtered_data.empty:
            return jsonify(filtered_data.to_dict(orient='records'))
        else:
            return jsonify({"message": "No items found for the given article type."}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500 