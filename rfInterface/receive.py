# Copyright 2017, Digi International Inc.
#
# Permission to use, copy, modify, and/or distribute this software for any
# purpose with or without fee is hereby granted, provided that the above
# copyright notice and this permission notice appear in all copies.
#
# THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
# WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
# MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
# ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
# WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
# ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
# OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

from digi.xbee.devices import XBeeDevice
from influxdb import InfluxDBClient
import struct

import time

# connected to /dev/ttyUSBx in docker compose file
PORT = "/USB"
# PORT = "/dev/ttyUSB2"
# TODO: Replace with the baud rate of your local module.
BAUD_RATE = 9600

DATABASE = "test"

# some notes:
# on my machine this needs to be run as admin, which means the digi-xbee
# python package needs to be installed for admin as well.

# prints content of all received packets to stdout, with newline between them.
# terminate with ctrl-c

client = InfluxDBClient('influx', 8086, 'root', 'root', DATABASE)

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

def main():
    device = XBeeDevice(PORT, BAUD_RATE)

    client.create_database(DATABASE)

    try:
        device.open()

        def data_receive_callback(xbee_message):
            bytestream = xbee_message.data
            data = parseMessage(bytestream)
            client.write_points(data)
            print("Received:", message, flush=True)

        device.add_data_received_callback(data_receive_callback)

        while True:
            time.sleep(1)

    finally:
        if device is not None and device.is_open():
            device.close()


if __name__ == '__main__':
    main()
