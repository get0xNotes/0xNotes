from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
import os, psycopg, jwt, time, string

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

def check_username_availability(username):
    if len(username) < 5:
        return False

    with psycopg.connect(os.environ.get("POSTGRES_URL")) as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM users WHERE username = %s", (username,))
            if cur.fetchone():
                return False
            else:
                return True

@app.route('/')
def root():
    return "<h1>0xNotes API Server</h1>"


@app.route('/api/v1/user/signup', methods=['GET'])
def sign_up():
    username = request.args.get('username')
    auth = request.args.get('auth')

    if not username or not auth:
        return(jsonify({'success': False, 'error': 'Missing username or auth'}))

    if not check_username_availability(username):
        return(jsonify({'success': False, 'error': 'Username already taken'}))

    if all(c in set(string.hexdigits) for c in auth) == False or len(auth) != 64:
        return(jsonify({'success': False, 'error': 'Invalid authentication key. Key must be a hexadecimal string with a length of 256 bytes.'}))

    with psycopg.connect(os.environ.get("POSTGRES_URL")) as conn:
        with conn.cursor() as cur:
            cur.execute("INSERT INTO users (username, auth) VALUES (%s, %s)", (username, auth))

    return(jsonify({'success': not check_username_availability(username)}))
    


@app.route('/api/v1/user/available', methods=['GET'])
def check_username_availability_flask():
    username = request.args.get('username')

    if username:
        return jsonify({"success": True, "available": check_username_availability(username)})
    else:
        # If username is empty return not available
        return jsonify({"success": False, "available": False})

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