from influxdb import InfluxDBClient

ifdb_client_local = None
ifdb_client_server = None

ifdb_server_address = '...'
ifdb_server_user = 'root'
ifdb_server_pwd = 'root'

def ifdb_connect(database_name):
    global ifdb_client_local
    global ifdb_client_server
    ifdb_clients_local = InfluxDBClient('influx', 8086, 'root', 'root', database_name)
    ifdb_client_server = InfluxDBClient(ifdb_server_address, 8086, ifdb_server_user, ifdb_server_pwd, database_name, timeout=0.5)

    for client in [ifdb_client_local, ifdb_client_server]:
        try:
            client.create_database(database_name)
        except Exception as e:
            print("InfluxDB create_database error: ", e)

server_data_queue = []
len_threshold = 100

def ifdb_write(data):
    ifdb_client_local.write_points(data)

    global server_data_queue
    server_data_queue.extend(data)

    if len(server_data_queue) > len_threshold:
        try:
            client.write_points(data)
        except Exception as e:
            print("InfluxDB write_points error: ", e)