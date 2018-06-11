import struct
import time
from datetime import datetime

from ifdb import ifdb_connect, ifdb_write
from xbee import xbee_listen, xbee_send, xbee_close
from control_server.control_server import run_control_server

# some notes:
# on my machine this needs to be run as admin, which means the digi-xbee
# python package needs to be installed for admin as well.

sensor_id_table = {
    0: 'event',
    1: 'accelerometer',
    2: 'gyroscope',
    3: 'barometer1',
    4: 'barometer2',
    5: 'magnetometer',
    6: 'climate',
    7: 'gps1',
    8: 'gps2',
    9: 'batteries',

    101: 'pos',
    102: 'rot',
    103: 'vel'
}

events_table = {
    
}

def parseMessage(bytestream):
    # bytestream unpacking: https://docs.python.org/3/library/struct.html#format-characters
    # '>' denotes big endian
    (timestamp_ms, sensor_id, data0, data1, data2, data3) = struct.unpack('>IBffff', bytestream);
    
    if not sensor_id in sensor_id_table:
        print("Unknown sensor_id:", sensor_id, flush=True)
        return []

    measurement = sensor_id_table[sensor_id]

    return [
        {
            "measurement": measurement,
            "time": timestamp_ms, # TODO what do we need here? string/int ms/ns??
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
    ifdb_write(data)
    print("Received:", data, flush=True)

def send_command_callback(command = None):
    if command == None or command == "":
        command = "None"
    print("send_command called. Command = '" + command + "'", flush=True)
    xbee_send(command)

def main():
    try:
        database_name = datetime.now().strftime("flight-%Y-%m-%d-%H-%M-%S")
        ifdb_connect(database_name)
        xbee_listen(data_receive_callback)
        run_control_server(send_command_callback)
        
        while True:
            time.sleep(1)

    except Exception as ex:
        print(ex)
    finally:
        xbee_close()

if __name__ == '__main__':
    main()
