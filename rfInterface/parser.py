from datetime import datetime
import struct

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

def parse_message(bytestream):
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
        try:
            decoded_data = [bytestream[5:].decode('utf-8')]
        except:
            decoded_data = ["no fix"]

        # According to conversation with Rafael, 18.06.2018, TELL 1 now won't send much data to the
        # ground station, only GPS coordinates. Since the visualization doesn't have much of a
        # purpose in that case, just print the coordinates to the console. In case anything else is
        # received, the logging to file is still running as before, so no data will be lost.
        gps_nr = sensor_id - 6
        print("GPS" + str(gps_nr) + ": ", decoded_data[0], flush=True)
    else:
        # ignore further data if the bytestream is longer than specified in the encoding.
        # If bytestream is too short however, just take as many values as we can fit.
        # This assumes, that every field in the data is represented by 4 bytes.
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