import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    MONGO_URI = os.getenv('MONGO_URI', "mongodb+srv://navneetg050:805020@firstmongo.izcl1mo.mongodb.net/testdb?retryWrites=true&w=majority")
    GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
    SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key')

    @staticmethod
    def init_app(app):
        pass 