from flask import Flask, redirect, url_for, request, render_template

# Webserver that accepts some simple commands for the rfInterface script

def run_control_server(send_command_callback):
    app = Flask(__name__)

    recording = False

    @app.route('/')
    def index():
        return render_template("index.html")

    @app.route('/send-command')
    def send_command():
        # command = request.args.get('command')
        # if command == None or command == "":
        #     code = 400
        #     message = "command missing"
        #     return message, code
        command = ""
        send_command_callback(command)
        return redirect(url_for('index'))

    # @app.route('/start-recording')
    # def start_recording():
    #     db_name = request.args.get('db_name')

    #     if recording:
    #         code = 400
    #         message = "Already recording"
    #         return message, code

    #     if db_name == None or db_name == "":
    #         code = 400
    #         message = "DB name missing"
    #         return message, code

    #     recording = True

    #     start_recording_callback(db_name)
    #     return redirect(url_for('index'))

    app.run('0.0.0.0', port = 5000, debug = True)