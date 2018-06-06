from influxdb import InfluxDBClient
import struct
import time
from datetime import datetime

from xbee import xbee_listen, xbee_send, xbee_close
from control_server.control_server import run_control_server

# some notes:
# on my machine this needs to be run as admin, which means the digi-xbee
# python package needs to be installed for admin as well.


def parseMessage(bytestream):
    # bytestream unpacking: https://docs.python.org/3/library/struct.html#format-characters
    # '>' denotes big endian
    (timestamp, sensor_id, data) = struct.unpack('>HHI', bytestream);
    
    return [
        {
            "measurement": "pos",
            "time": timestamp,
            "fields": {
                "value": 0.64
            }
        }
    ]

def data_receive_callback(xbee_message):
    sender = xbee_message.remote_device.get_64bit_addr()
    if not sender in ['asdf', '315']:
        print("Unknown sender", sender, flush=True)
        return
    bytestream = xbee_message.data
    data = parseMessage(bytestream)
    ifdb_client.write_points(data)
    print("Received:", data, flush=True)

def send_command_callback(command = None):
    if command == None or command == "":
        command = "None"
    print("########## send_command called. Command = '" + command + "'", flush=True)
    #xbee_send(command)

def main():
    try:
        database_name = datetime.now().strftime("flight-%Y-%m-%d-%H-%M-%S")
        ifdb_client = InfluxDBClient('influx', 8086, 'root', 'root', database_name)
        #ifdb_client.create_database(database_name)
        run_control_server(send_command_callback)
        while True:
            time.sleep(1)

        #xbee_listen(data_receive_callback)

    finally:
        pass
        #xbee_close()

if __name__ == '__main__':
    main()
