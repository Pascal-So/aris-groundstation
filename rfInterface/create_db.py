from influxdb import InfluxDBClient
import sys

if len(sys.argv) != 2:
    sys.exit("usage: {0} db_name".format(sys.argv[0]))

database = sys.argv[1]

client = InfluxDBClient('influx', 8086, 'root', 'root', database)
client.create_database(database)
