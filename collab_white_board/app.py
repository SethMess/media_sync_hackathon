from flask import Flask, render_template
from flask_socketio import SocketIO, emit
# import eventlet
# import fcntl

app = Flask(__name__)
# socketio = SocketIO(app)
socketio = SocketIO(app, cors_allowed_origins='*')

@app.route('/')
def index():
    return render_template('index.html')

@socketio.on('draw')
def handle_draw(data):
    emit('draw', data, broadcast=True)

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=False)
    # eventlet.wsgi.server(eventlet.listen(('0.0.0.0', 5000)), socketio)
    # app.run(host='0.0.0.0', debug=True, port=5000)
