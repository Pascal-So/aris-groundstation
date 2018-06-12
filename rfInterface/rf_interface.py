import struct
import time
from datetime import datetime

from ifdb import ifdb_connect, ifdb_write
from xbee import xbee_listen, xbee_send, xbee_close
from control_server.control_server import run_control_server

# some notes:
# on my machine this needs to be run as admin, which means the digi-xbee
# python package needs to be installed for admin as well.

# see file ../sensor_ids.txt for more information
sensor_id_table = {
    0: {
        "measurement": 'event',
        "encoding": 'III',
        "fields": ['id', 'param1', 'param2'],
    },
    1: {
        "measurement": 'acc',
        "encoding": 'fff',
        "fields": ['x', 'y', 'z'],
    },
    2: {
        "measurement": 'gyro',
        "encoding": 'fff',
        "fields": ['x', 'y', 'z'],
    },
    3: {
        "measurement": 'bar1',
        "encoding": 'fff',
        "fields": ['pa', 'alt', 'temp'],
    },
    4: {
        "measurement": 'bar2',
        "encoding": 'fff',
        "fields": ['pa', 'alt', 'temp'],
    },
    5: {
        "measurement": 'mag',
        "encoding": 'fff',
        "fields": ['x', 'y', 'z'],
    },
    6: {
        "measurement": 'cli',
        "encoding": 'fff',
        "fields": ['pa', 'temp', 'humid'],
    },
    7: {
        "measurement": 'gps1',
        "encoding": 'ff',
        "fields": ['lat', 'long'],
    },
    8: {
        "measurement": 'gps2',
        "encoding": 'ff',
        "fields": ['lat', 'long'],
    },
    9: {
        "measurement": 'bat',
        "encoding": 'f',
        "fields": ['perc'],
    },

    101: {
        "measurement": 'pos',
        "encoding": 'ffff',
        "fields": ['x', 'y', 'z', 'z2'],
    },
    102: {
        "measurement": 'rot',
        "encoding": 'ffff',
        "fields": ['x', 'y', 'z', 'w'],
    },
    103: {
        "measurement": 'vel',
        "encoding": 'fff',
        "fields": ['x', 'y', 'z'],
    },
}

def parseMessage(bytestream):
    # bytestream unpacking: https://docs.python.org/3/library/struct.html#format-characters
    # '>' denotes big endian

    (timestamp_ms, sensor_id) = struct.unpack('>IB', bytestream[:5]);
    
    if not sensor_id in sensor_id_table:
        print("Unknown sensor_id:", sensor_id, flush=True)
        return []

    sensor_info = sensor_id_table[sensor_id]
    bytestream_length = 4 + 1 + len(sensor_info['encoding']) * 4
    # ignore further data in the bytestream
    decoded_data = struct.unpack('<' + sensor_info['encoding'], bytestream[5:bytestream_length])

    fields = {}
    for i in range(len(sensor_info['fields'])):
        field = sensor_info['fields'][i]
        fields[field] = decoded_data[i]

    # timestamp_ns = str(timestamp_ms) + '000000'
    # print('using timestamp: ', timestamp_ns, flush=True)
    str_timestamp = datetime(1970,1,1, second=timestamp_ms // 1000, microsecond=(timestamp_ms % 1000) * 1000).strftime('%Y-%m-%d %H:%M:%S.%f')[:-3]

    return {
        "measurement": sensor_info['measurement'],
        "time": str_timestamp,
        "fields": fields,
    }

known_modules = [
    b'\x00\x13\xa2\x00\x41\x74\xc3\xe0',
    b'\x00\x13\xa2\x00\x41\x74\xc3\xe4',
    b'\x00\x13\xa2\x00\x41\x5c\xe2\xc7',
    b'\x00\x13\xa2\x00\x41\x5c\xe2\xcb',
    b'\x00\x13\xA2\x00\x41\x5C\xE2\xB8',
]

def data_receive_callback(xbee_message):
    sender = xbee_message.remote_device.get_64bit_addr()
    if not sender.address in known_modules:
        print("Unknown sender", sender.address, flush=True)
        return
    bytestream = xbee_message.data
    data = parseMessage(bytestream)
    print("Received data:", data, flush=True)
    ifdb_write(data)

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
        print("Error:", ex)
    finally:
        print("closing connection to xbee", flush=True)
        xbee_close()

if __name__ == '__main__':
    main()
