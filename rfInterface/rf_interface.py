from influxdb import InfluxDBClient
import struct
import time
from datetime import datetime

from receiver import receiver_listen, receiver_close

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
    bytestream = xbee_message.data
    data = parseMessage(bytestream)
    ifdb_client.write_points(data)
    print("Received:", data, flush=True)


def main():
    try:
        database_name = datetime.now().strftime("flight-%Y-%m-%d-%H-%M-%S")
        ifdb_client = InfluxDBClient('influx', 8086, 'root', 'root', database_name)
        ifdb_client.create_database(database_name)

        while True:
            #dummy_data = [{
            #    "measurement": "temp",
            #    "fields": {"value": 1.1}
            #}]
            # ifdb_client.write_points(dummy_data)
            time.sleep(1)

        receiver_listen(data_receive_callback)

    finally:
        receiver_close()

if __name__ == '__main__':
    main()
