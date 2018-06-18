import struct
import time
from datetime import datetime

from ifdb import ifdb_connect, ifdb_write
from xbee import xbee_listen, xbee_send, xbee_close
from parser import parse_message
from write_files import write_data_to_file
from control_server.control_server import run_control_server

# some notes:
# on my machine this needs to be run as admin, which means the digi-xbee
# python package needs to be installed for admin as well.


# extend this list if you want to use more xbee modules.
known_modules = [
    b'\x00\x13\xa2\x00\x41\x74\xc3\xe0',
    b'\x00\x13\xa2\x00\x41\x74\xc3\xe4',
    b'\x00\x13\xa2\x00\x41\x5c\xe2\xc7',
    b'\x00\x13\xa2\x00\x41\x5c\xe2\xcb',
    b'\x00\x13\xa2\x00\x41\x5c\xe2\xb8',
]

database_name = ""

def data_receive_callback(message, sender_addr):
    if not sender_addr in known_modules:
        print("Unknown sender", sender_addr, flush=True)
         return

    parsed_data = parse_message(message)
    write_data_to_file(message, parsed_data, database_name)

    if parsed_data == None:
        return

    print("Received data:", parsed_data, flush=True)
    ifdb_write(parsed_data)

# command and argument both as int
def send_command_callback(command, argument):
    print("send_command called. Command = " + str(command) + ", argument = " + str(argument), flush=True)
    if command > 255 or argument > 255 or command < 0 or argument < 0:
        print("Command or argument outside of range 0-255! Aborting send.", flush=True)
    encoded = struct.pack("BB", command, argument)
    xbee_send(encoded)

def main():
    global database_name
    try:
        time.sleep(3) # give InfluxDB some time to get its shit together

        xbee_listen(data_receive_callback)

        database_name = datetime.utcnow().strftime("flight-%Y-%m-%d-%H-%M-%S")
        print('Creating InfluxDB database', database_name)
        ifdb_connect(database_name)

        run_control_server(send_command_callback)
        
        while True:
            time.sleep(1)

    except Exception as ex:
        print("Error:", ex)
    finally:
        print("closing connection to xbee", flush=True)
        xbee_close()

if __name__ == '__main__':
    main()
