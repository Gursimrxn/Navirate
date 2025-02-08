import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# Configure the Google Generative AI API key
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

model = genai.GenerativeModel("gemini-pro")
chat = model.start_chat(history=[])

def get_gemini_response(message):
    response = chat.send_message(message, stream=True)
    # Convert the streaming response into a single string
    return " ".join([chunk.text for chunk in response]) 