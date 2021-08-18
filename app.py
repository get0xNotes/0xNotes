from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
import os, psycopg

load_dotenv()

app = Flask(__name__)
CORS(app)

@app.route('/')
def root():
    return "<h1>0xNotes API Server</h1>"

@app.route('/api/v1/user', methods=['GET'])
def is_authenticated():
    username = request.args.get('username')
    auth = request.args.get('auth')

    if not username or not auth:
        return jsonify({'authenticated': False})

    with psycopg.connect(os.environ.get('POSTGRES_URL')) as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM users WHERE username=%s AND auth=%s", (username, auth))
            if cur.fetchone():
                return jsonify({'authenticated': True})
            else:
                return jsonify({'authenticated': False})

if __name__ == '__main__':
    app.run()