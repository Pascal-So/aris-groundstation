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
        "measurement": 'acc1',
        "encoding": 'fff',
        "fields": ['x', 'y', 'z'],
    },
    11: {
        "measurement": 'acc2',
        "encoding": 'fff',
        "fields": ['x', 'y', 'z'],
    },
    2: {
        "measurement": 'gyro1',
        "encoding": 'fff',
        "fields": ['x', 'y', 'z'],
    },
    12: {
        "measurement": 'gyro2',
        "encoding": 'fff',
        "fields": ['x', 'y', 'z'],
    },
    3: {
        "measurement": 'bar1',
        "encoding": 'ff',
        "fields": ['hpa', 'temp'],
    },
    4: {
        "measurement": 'bar2',
        "encoding": 'ff',
        "fields": ['hpa', 'temp'],
    },
    7: {
        "measurement": 'gps1',
        # the gps format is handled as a special case, see below
        "encoding": 'ii',
        "fields": ['coords'],
    },
    8: {
        "measurement": 'gps2',
        "encoding": 'ii',
        "fields": ['coords'],
    },
    105: {
        "measurement": 'brk',
        "encoding": 'fff',
        "fields": ['u', 'w0', 'w1'],
    },
    106: {
        "measurement": 'fusion',
        "encoding": 'ff',
        "fields": ['alt', 'vel'],
    },



    # Unused sensors, left over from 2018. Will still be recognized and stored.
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
}

def decimal_degrees_to_degrees_minutes_seconds(deg_lat_dec_sgn, deg_lng_dec_sgn):
    # https://tnp.uservoice.com/knowledgebase/articles/172110-latitude-longitude-formats-and-conversion
    # todo, maybe special case for nofix

    deg_lat_dec = abs(deg_lat_dec_sgn)
    deg_lat = int(deg_lat_dec)
    min_lat_dec = (deg_lat_dec - deg_lat) * 60
    min_lat = int(min_lat_dec)
    sec_lat_dec = (min_lat_dec - min_lat) * 60
    dir_lat = 'N' if deg_lat_dec_sgn >= 0 else 'S'

    deg_lng_dec = abs(deg_lng_dec_sgn)
    deg_lng = int(deg_lng_dec)
    min_lng_dec = (deg_lng_dec - deg_lng) * 60
    min_lng = int(min_lng_dec)
    sec_lng_dec = (min_lng_dec - min_lng) * 60
    dir_lng = 'E' if deg_lng_dec_sgn >= 0 else 'W'

    return '{:d}°{:d}\'{:.2f}"{}, {:d}°{:d}\'{:.2f}"{}'.format(
        deg_lat, min_lat, sec_lat_dec, dir_lat,
        deg_lng, min_lng, sec_lng_dec, dir_lng)

def raphael_gps_format_to_degrees_minutes_seconds(str):
    # This is to parse the format used in 2018 and convert it to degrees_minutes_seconds.
    # ddmm.mmmmNdddmm.mmmmW

    deg_lat = int(str[0:2])
    min_lat_dec = float(str[2:9])
    min_lat = int(min_lat_dec)
    sec_lat_dec = (min_lat_dec - min_lat) * 60
    dir_lat = str[9]

    deg_lng = int(str[10:13])
    min_lng_dec = float(str[13:20])
    min_lng = int(min_lng_dec)
    sec_lng_dec = (min_lng_dec - min_lng) * 60
    dir_lng = str[20]

    return '{:d}°{:d}\'{:.2f}"{}, {:d}°{:d}\'{:.2f}"{}'.format(
        deg_lat, min_lat, sec_lat_dec, dir_lat,
        deg_lng, min_lng, sec_lng_dec, dir_lng)

def parse_message(bytestream):
    # bytestream unpacking: https://docs.python.org/3/library/struct.html#format-characters
    # '>' denotes big endian

    (timestamp_ms, sensor_id) = struct.unpack('<IB', bytestream[:5]);

    if not sensor_id in sensor_id_table:
        print("Unknown sensor_id:", sensor_id, flush=True)
        return None

    sensor_info = sensor_id_table[sensor_id]

    # ignore further data if the bytestream is longer than specified in the encoding.
    # If bytestream is too short however, just take as many values as we can fit.
    # This assumes, that every field in the data is represented by 4 bytes.
    words = len(sensor_info['encoding'])
    expected_bytestream_length = 4 + 1 + words * 4
    if len(bytestream) < expected_bytestream_length:
        words = (len(bytestream) - 5) // 4
        expected_bytestream_length = words * 4 + 5
    decoded_data = struct.unpack(sensor_info['encoding'][:words], bytestream[5:expected_bytestream_length])

    # Special case for GPS
    if sensor_id in [7, 8]:
        [lat_int, lng_int] = decoded_data
        dd_factor = 10000000
        dms = decimal_degrees_to_degrees_minutes_seconds(lat_int / dd_factor, lng_int / dd_factor)

        # GPS is the most important thing of the ground station during the flight, so we print it
        # to console as soon as we know it just to make sure it's visible even if everything else
        # fails.
        print("GPS {}: {}".format(sensor_id - 6, dms))
        decoded_data = [dms]

    fields = {}
    for i in range(len(decoded_data)):
        field = sensor_info['fields'][i]
        fields[field] = decoded_data[i]

    return {
        "measurement": sensor_info['measurement'],
        "time": timestamp_ms,
        "fields": fields,
    }