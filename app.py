from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
import os, psycopg, jwt, time, string, base64
from Crypto.Cipher import AES
from Crypto.Protocol.KDF import PBKDF2
from Crypto.Hash import SHA512
from Crypto.Random import get_random_bytes

load_dotenv()

app = Flask(__name__)
CORS(app)

SERVER_ENCRYPTION_KEY = PBKDF2(os.getenv('SERVER_SECRET'), os.getenv('SERVER_SALT'), 32, 100000, hmac_hash_module=SHA512)

def encode_jwt(username, long_session=False):
    expires_in = 86400 # 24 hours
    if long_session:
        expires_in = 604800 # 1 week
    return jwt.encode({'aud': username, 'exp': time.time() + expires_in}, os.environ.get("SERVER_SECRET"), algorithm='HS256')

def decode_jwt(token, username):
    try:
        jwt.decode(token, os.environ.get("SERVER_SECRET"), audience=username, algorithms=['HS256'])
        return True
    except Exception as e:
        return False

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

@app.route('/api/v1/notes/create', methods=['POST'])
def create_notes():
    try:
        data = request.json
        auth = request.headers.get('Authorization')
        session = auth.split("Bearer ")[1]
        username = data["username"]
        notes_type = data["type"]
        title = base64.b64decode(data["title"])
        title_nonce = data["title_nonce"]
        notes = base64.b64decode(data["notes"])
        notes_nonce = data["notes_nonce"]
    except Exception as e:
        return jsonify({'success': False, 'error': 'Invalid request'})

    if not session or not username or not title or not title_nonce or not notes or not notes_nonce:
        return jsonify({'success': False, 'error': 'Missing required fields'})

    if not decode_jwt(session, username):
        return jsonify({'success': False, 'error': 'Invalid session'})

    server_nonce = get_random_bytes(8)
    c1 = AES.new(SERVER_ENCRYPTION_KEY, AES.MODE_CTR, initial_value=0, nonce=server_nonce)
    c2 = AES.new(SERVER_ENCRYPTION_KEY, AES.MODE_CTR, initial_value=0, nonce=server_nonce)
    title_encrypted = base64.a85encode(c1.encrypt(title)).decode('utf-8')
    notes_encrypted = base64.a85encode(c2.encrypt(notes)).decode('utf-8')

    try:
        with psycopg.connect(os.environ.get('POSTGRES_URL')) as conn:
            with conn.cursor() as cur:
                cur.execute("INSERT INTO notes (author, type, server_nonce, title_nonce, notes_nonce, title, note) VALUES (%s, %s, %s, %s, %s, %s, %s)", (username, notes_type, server_nonce.hex(), title_nonce, notes_nonce, title_encrypted, notes_encrypted))
                return jsonify({'success': True})
    except:
        return jsonify({'success': False, 'error': 'Database error'})

@app.route('/api/v1/notes/update/<int:note_id>', methods=['POST'])
def update_notes(note_id):
    try:
        data = request.json
        auth = request.headers.get('Authorization')
        session = auth.split("Bearer ")[1]
        username = data["username"]
        title = base64.b64decode(data["title"])
        title_nonce = data["title_nonce"]
        notes = base64.b64decode(data["notes"])
        notes_nonce = data["notes_nonce"]
    except Exception as e:
        return jsonify({'success': False, 'error': 'Invalid request'})

    if not session or not username or not title or not title_nonce or not notes or not notes_nonce:
        return jsonify({'success': False, 'error': 'Missing required fields'})

    if not decode_jwt(session, username):
        return jsonify({'success': False, 'error': 'Invalid session'})

    server_nonce = get_random_bytes(8)
    c1 = AES.new(SERVER_ENCRYPTION_KEY, AES.MODE_CTR, initial_value=0, nonce=server_nonce)
    c2 = AES.new(SERVER_ENCRYPTION_KEY, AES.MODE_CTR, initial_value=0, nonce=server_nonce)
    title_encrypted = base64.a85encode(c1.encrypt(title)).decode('utf-8')
    notes_encrypted = base64.a85encode(c2.encrypt(notes)).decode('utf-8')

    try:
        with psycopg.connect(os.environ.get('POSTGRES_URL')) as conn:
            with conn.cursor() as cur:
                cur.execute("UPDATE notes SET server_nonce=%s, title=%s, title_nonce=%s, note=%s, notes_nonce=%s WHERE id=%s AND author=%s", (server_nonce.hex(), title_encrypted, title_nonce, notes_encrypted, notes_nonce, note_id, username))
                return jsonify({'success': True})
    except Exception as e:
        print(e)
        return jsonify({'success': False, 'error': 'Database error'})

@app.route('/api/v1/notes/list', methods=['GET'])
def list_notes():
    auth = request.headers.get('Authorization')
    username = request.args.get('username')
    if not auth or not username:
        return(jsonify({'success': False, 'error': 'Missing session token or username'}))
    else:
        session = auth.split("Bearer ")[1]
        authorized = decode_jwt(session, username)
        if authorized:
            try:
                with psycopg.connect(os.environ.get("POSTGRES_URL")) as conn:
                    with conn.cursor() as cur:
                        cur.execute("SELECT id, type, server_nonce, title_nonce, title, modified FROM notes WHERE author=%s", (username,))
                        notes = cur.fetchall()
                        notes_decrypted = []
                        for note in notes:
                            c1 = AES.new(SERVER_ENCRYPTION_KEY, AES.MODE_CTR, initial_value=0, nonce=bytes.fromhex(note[2]))
                            notes_decrypted.append({"id": note[0], "modified": note[5].timestamp(), "type": note[1], "title": base64.b64encode(c1.decrypt(base64.a85decode(note[4]))).decode(), "title_nonce": note[3]})
                        return(jsonify({'success': True, 'notes': notes_decrypted}))
            except:
                return(jsonify({'success': False, 'error': 'Database error'}))
        else:
            return(jsonify({'success': False, 'error': 'Invalid session token'}))

@app.route('/api/v1/notes/<int:note_id>', methods=['GET'])
def get_note(note_id):
    auth = request.headers.get('Authorization')
    username = request.args.get('username')
    if not auth or not username:
        return(jsonify({'success': False, 'error': 'Missing session token or username'}))

    session = auth.split("Bearer ")[1]
    authorized = decode_jwt(session, username)

    if authorized:
        try:
            with psycopg.connect(os.environ.get("POSTGRES_URL")) as conn:
                with conn.cursor() as cur:
                    cur.execute("SELECT id, type, server_nonce, notes_nonce, note FROM notes WHERE id=%s AND author=%s", (note_id, username))
                    note = cur.fetchone()
                    if note:
                        c1 = AES.new(SERVER_ENCRYPTION_KEY, AES.MODE_CTR, initial_value=0, nonce=bytes.fromhex(note[2]))
                        noteText = base64.b64encode(c1.decrypt(base64.a85decode(note[4]))).decode()
                        return(jsonify({'success': True, 'note': noteText, 'nonce': note[3]}))
                    else:
                        return(jsonify({'success': False, 'error': 'Note not found'}))
        except Exception as e:
            print(e)
            return(jsonify({'success': False, 'error': 'Database error'}))
    else:
        return(jsonify({'success': False, 'error': 'Invalid session token'}))


    

if __name__ == '__main__':
    app.run()