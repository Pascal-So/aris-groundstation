from influxdb import InfluxDBClient
from queue import Queue
from threading import Thread
import time

ifdb_clients = []

def ifdb_connect(database_name):
    global ifdb_clients
    ifdb_clients = [
        InfluxDBClient('influx', 8086, 'root', 'root', database_name),
        InfluxDBClient('10.8.0.1', 8086, 'root', 'root', database_name, timeout=1),
    ]

    for client in ifdb_clients:
        try:
            client.create_database(database_name)
        except Exception as e:
            print("InfluxDB create_database error: ", e)

    Thread(target = ifdb_send_data).start()


ifdb_data_queue = Queue()

def ifdb_write(data):
    ifdb_data_queue.put(data)

# Running in a separate thread, because influxdb.InfluxDBClient.write_points blocks.
def ifdb_send_data():
    while True:
        send_data = []

        # Note: this is only ok because we have a single thread reading
        # from the queue. Don't try this in other multithreaded programs..
        while not ifdb_data_queue.empty():
            send_data.append(ifdb_data_queue.get())

        print('Sending {0:d} data ponits to InfluxDB'.format(len(send_data)))

        for client in ifdb_clients:
            try:
                client.write_points(send_data)
            except Exception as e:
                print("InfluxDB send_data error: ", e)

        time.sleep(4)