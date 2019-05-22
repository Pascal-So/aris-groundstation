from datetime import datetime
from influxdb import InfluxDBClient
from queue import Queue
from threading import Thread
import time

ifdb_clients = []

def ifdb_connect(database_name):
    global ifdb_clients
    ifdb_clients = [
        InfluxDBClient('influx', 8086, 'root', 'root', database_name, retries=100),
        InfluxDBClient('10.8.0.1', 8086, 'root', 'root', database_name, timeout=1),
    ]

    for client in ifdb_clients:
        try:
            client.create_database(database_name)
        except Exception as e:
            print("InfluxDB create_database error: ", e)

    Thread(target = ifdb_send_data).start()


ifdb_data_queue = Queue()

def timestamp_ms_to_string_time(timestamp_ms):
    # the python influxdb client should work with just passing an int and setting the
    # time_precision, but that didn't work so here's a horrible hack :)
    damn_us = (timestamp_ms % 1000) * 1000
    damn_secs = (timestamp_ms // 1000) % 60
    damn_mins = (timestamp_ms // 60000) % 60
    damn_hours = (timestamp_ms // 3600000) % 24
    damn_days = timestamp_ms // (3600000 * 24) + 1
    return datetime(1970,1,day=damn_days, hour=damn_hours, minute=damn_mins, second=damn_secs, microsecond=damn_us) \
        .strftime('%Y-%m-%d %H:%M:%S.%f')[:-3]

def ifdb_write(data):
    data.time = timestamp_ms_to_string_time(data.time)
    ifdb_data_queue.put(data)

# Running in a separate thread, because influxdb.InfluxDBClient.write_points blocks.
def ifdb_send_data():
    while True:
        send_data = []

        # Note: this is only ok because we have a single thread reading
        # from the queue. Don't try this in other multithreaded programs..
        while not ifdb_data_queue.empty():
            send_data.append(ifdb_data_queue.get())

        if len(send_data) > 0:
            print('Sending {0:d} data ponits to InfluxDB'.format(len(send_data)), flush=True)
            for client in ifdb_clients:
                try:
                    client.write_points(send_data, time_precision='ms')
                except Exception as e:
                    print("InfluxDB send_data error: ", e)

        time.sleep(3)