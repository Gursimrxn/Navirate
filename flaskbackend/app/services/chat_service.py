import os
import google.generativeai as genai
from app.config import Config
from flask import jsonify

def initialize_chat():
    try:
        api_key = Config.GOOGLE_API_KEY
        if not api_key:
            raise ValueError("GOOGLE_API_KEY not found in environment variables")
        
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-pro")
        return model.start_chat(history=[])
    except Exception as e:
        print(f"Error initializing chat: {str(e)}")
        return None

chat = initialize_chat()

def get_chat_response(message):
    try:
        if chat is None:
            return jsonify({
                "error": "Chat service not initialized. Please check GOOGLE_API_KEY."
            }), 500
            
        response = chat.send_message(message, stream=True)
        return " ".join([chunk.text for chunk in response])
    except Exception as e:
        return f"Error: {str(e)}" 