from flask import Flask, redirect, url_for, request

# If we need the ability to start and stop recording while the container
# is running, this is a starting point for a server that accepts some
# control commands.

# add flask to requirements.txt if you want to use this.

def run_control_server(start_recording_callback, stop_recording_callback):
    app = Flask('Control Server')

    recording = False

    @app.route('/')
    def index():
       return 'Hello World'

    @app.route('/start-recording')
    def start_recording(database):
        db_name = request.args.get('db_name')

        if recording:
            code = 400
            message = "Already recording"
            return message, code

        if db_name == None or db_name == "":
            code = 400
            message = "DB name missing"
            return message, code

        recording = True

        start_recording_callback(db_name)
        return redirect(url_for('index'))

    app.run('0.0.0.0', port = 5000, debug = True)