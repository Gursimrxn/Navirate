from flask import Flask
from flask_cors import CORS
from flask_pymongo import PyMongo

# Create Flask App
app = Flask(__name__)

# MongoDB Configuration
app.config['MONGO_URI'] = "mongodb+srv://navneetg050:805020@firstmongo.izcl1mo.mongodb.net/testdb?retryWrites=true&w=majority"

# Initialize extensions
mongo = PyMongo(app)

# Initialize CORS (applied to /chat endpoint as per original code)
CORS(app, resources={r"/chat": {"origins": "http://localhost:3000"}})

# Initialize the database service
from services.database import init_db
init_db(app)

# Register blueprints from our routes folder
from routes.chatbot_routes import chatbot_bp
from routes.auth_routes import auth_bp
from routes.sentiment_routes import sentiment_bp

app.register_blueprint(chatbot_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(sentiment_bp)

if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=5000) 