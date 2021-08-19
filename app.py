from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
import os, psycopg, jwt, time

load_dotenv()

app = Flask(__name__)
CORS(app)

def encode_jwt(username, long_session=False):
    expires_in = 86400 # 24 hours
    if long_session:
        expires_in = 604800 # 1 week
    return jwt.encode({'aud': username, 'exp': time.time() + expires_in}, os.environ.get("SERVER_SECRET"), algorithm='HS256')

def decode_jwt(token):
    try:
        payload = jwt.decode(token, os.environ.get("SERVER_SECRET"))
        return True, payload['aud']
    except jwt.ExpiredSignatureError:
        return False, ''
    except jwt.InvalidTokenError:
        return False, ''

@app.route('/')
def root():
    return "<h1>0xNotes API Server</h1>"

@app.route('/api/v1/user/session', methods=['GET'])
def get_session():
    username = request.args.get('username')
    auth = request.args.get('auth')

    if request.args.get('long_session', "0") == "1":
        long_session = True
    else:
        long_session = False

    if not username or not auth:
        return jsonify({'session': False})

    with psycopg.connect(os.environ.get('POSTGRES_URL')) as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM users WHERE username=%s AND auth=%s", (username, auth))
            if cur.fetchone():
                return jsonify({'session': True, 'jwt': encode_jwt(username, long_session)})
            else:
                return jsonify({'session': False})

if __name__ == '__main__':
    app.run()