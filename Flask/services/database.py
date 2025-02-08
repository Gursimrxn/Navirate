from flask_pymongo import PyMongo

# Create a PyMongo instance without binding to the app immediately
mongo = PyMongo()

def init_db(app):
    mongo.init_app(app) 