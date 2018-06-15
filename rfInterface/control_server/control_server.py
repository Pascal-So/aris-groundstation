from flask import Flask, redirect, url_for, request, render_template

# Webserver that accepts some simple commands for the rfInterface script

def run_control_server(send_command_callback):
    app = Flask(__name__)

    recording = False

    @app.route('/')
    def index():
        return render_template("index.html")

    @app.route('/send-command', methods=['POST'])
    def send_command():
        command = request.form['command']
        argument = request.form['argument']
        if command == None or argument == None:
            code = 400
            message = "command or argument missing"
            return message, code
        
        send_command_callback(int(command), int(argument))
        return redirect(url_for('index'))

    print('Starting control server', flush=True)
    app.run('0.0.0.0', port = 5000, debug = True, use_reloader=False)