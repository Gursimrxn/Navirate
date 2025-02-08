import os
from dotenv import load_dotenv
from app import create_app

def check_environment():
    load_dotenv()  # Load environment variables from .env file
    
    required_vars = ['GOOGLE_API_KEY', 'MONGO_URI', 'SECRET_KEY']
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    
    if missing_vars:
        print("Error: Missing required environment variables:")
        for var in missing_vars:
            print(f"- {var}")
        return False
    return True

def check_directory_structure():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(base_dir, 'app', 'data')
    csv_file = os.path.join(data_dir, 'final_file.csv')
    
    # Check if data directory exists
    if not os.path.exists(data_dir):
        print(f"Creating data directory at: {data_dir}")
        os.makedirs(data_dir)
    
    # Check if CSV file exists
    if not os.path.exists(csv_file):
        print(f"Warning: CSV file not found at: {csv_file}")
        print("Please ensure final_file.csv is placed in the app/data directory")
        return False
    
    return True

if __name__ == '__main__':
    if not check_environment():
        print("Environment setup incomplete. Please check .env file.")
    elif check_directory_structure():
        app = create_app()
        app.run(debug=True)
    else:
        print("Error: Required files are missing. Please check the setup instructions.") 