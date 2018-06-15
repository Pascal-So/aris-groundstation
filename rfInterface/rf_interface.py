import struct
import time
from datetime import datetime

from ifdb import ifdb_connect, ifdb_write
from xbee import xbee_listen, xbee_send, xbee_close
fromm write_files import write_raw_data_to_file, write_decoded_data_to_file
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
        # the encoding (as well as for gps2) is ignored, and a special case used instead. see below.
        "encoding": 'ccccccccccccccccccccc',
        "fields": ['coords'],
    },
    8: {
        "measurement": 'gps2',
        "encoding": 'ccccccccccccccccccccc',
        "fields": ['coords'],
    },
    9: {
        "measurement": 'bat',
        "encoding": 'f',
        "fields": ['perc'],
    },

    80: {
        "measurement": 'state',
        "encoding": 'BBBBBB',
        "fields": ['sensor_id', 'pl_on', 'pl_alive', 'wifi_status', 'sensor_status', 'sd_status', 'control_status'],
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
        "encoding": 'ffff',
        "fields": ['x', 'y', 'z', 'z2'],
    },
    104: {
        "measurement": 'alt',
        "encoding": 'fff',
        "fields": ['alt', 'alt_smoothed', 'vel'],
    },
    105: {
        "measurement": 'brk',
        "encoding": 'fff',
        "fields": ['vel', 'alt_smoothed', 'brk'],
    },
}

def parseMessage(bytestream):
    # bytestream unpacking: https://docs.python.org/3/library/struct.html#format-characters
    # '>' denotes big endian

    (timestamp_ms, sensor_id) = struct.unpack('<IB', bytestream[:5]);
    
    if not sensor_id in sensor_id_table:
        print("Unknown sensor_id:", sensor_id, flush=True)
        return None

    sensor_info = sensor_id_table[sensor_id]
    
    decoded_data = []
    if sensor_id in [7, 8]:
        # special case for gps
        decoded_data = [bytestream[5:].decode('utf-8')]
    else:
        # ignore further data if the bytestream is longer than specified in the encoding.
        # if bytestream is too short however, just take as many values as we can fit
        words = len(sensor_info['encoding'])
        expected_bytestream_length = 4 + 1 + words * 4
        if len(bytestream) < expected_bytestream_length:
            words = (len(bytestream) - 5) // 4
            expected_bytestream_length = words * 4 + 5
        decoded_data = struct.unpack(sensor_info['encoding'][:words], bytestream[5:expected_bytestream_length])

    fields = {}
    for i in range(len(decoded_data)):
        field = sensor_info['fields'][i]
        fields[field] = decoded_data[i]

    # the python influxdb client should work with just passing an int and setting the
    # time_precision, but that didn't work so here's a horrible hack :)
    damn_us = (timestamp_ms % 1000) * 1000
    damn_secs = (timestamp_ms // 1000) % 60
    damn_mins = (timestamp_ms // 60000) % 60
    damn_hours = (timestamp_ms // 3600000) % 24
    str_timestamp = datetime(1970,1,1, hour=damn_hours, minute=damn_mins, second=damn_secs, microsecond=damn_us) \
        .strftime('%Y-%m-%d %H:%M:%S.%f')[:-3]

    return {
        "measurement": sensor_info['measurement'],
        "time": str_timestamp,
        "fields": fields,
    }

# extend this list if you want to use more xbee modules.
known_modules = [
    b'\x00\x13\xa2\x00\x41\x74\xc3\xe0',
    b'\x00\x13\xa2\x00\x41\x74\xc3\xe4',
    b'\x00\x13\xa2\x00\x41\x5c\xe2\xc7',
    b'\x00\x13\xa2\x00\x41\x5c\xe2\xcb',
    b'\x00\x13\xa2\x00\x41\x5c\xe2\xb8',
]

def data_receive_callback(xbee_message):
    sender = xbee_message.remote_device.get_64bit_addr()
    if not sender.address in known_modules:
        print("Unknown sender", sender.address, flush=True)
        return

    bytestream = xbee_message.data
    write_raw_data_to_file(bytestream)

    data = parseMessage(bytestream)
    write_decoded_data_to_file(data)
    if data == None:
        return

    print("Received data:", data, flush=True)
    ifdb_write(data)

# command and argument both as int
def send_command_callback(command, argument):
    print("send_command called. Command = " + str(command) + ", argument = " + str(argument), flush=True)
    # todo: check if we can just send argument as 8 bit as well.
    encoded = struct.pack("<BI", command, argument)
    xbee_send(encoded)

def main():
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
