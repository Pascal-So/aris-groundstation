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

import struct
import time
from digi.xbee.devices import XBeeDevice

# The device "/USB" is connected to /dev/ttyUSBx in docker compose file.
PORT = "/USB"
#PORT = "/dev/ttyUSB0"

BAUD_RATE = 115200

rf_device = None

def xbee_connect():
    global rf_device
    print("setting up connection to xbee device", flush=True)
    rf_device = XBeeDevice(PORT, BAUD_RATE)
    rf_device.open()


def xbee_listen(callback):
    print("xbee_listen called", flush=True)
    if rf_device is None or not rf_device.is_open():
        xbee_connect()

    last_package_time = time.time()

    while True:
        try:
            xbee_message = rf_device.read_data()
            if xbee_message is not None:
                last_package_time = time.time()
                sender = xbee_message.remote_device.get_64bit_addr()
                bytestream = xbee_message.data
                callback(bytestream, sender.address)

                rssi_raw = rf_device.get_parameter("DB")
                rssi = struct.unpack('<B', rssi_raw)[0]
                print("rssi: -" + str(rssi), flush=True)

            if time.time() - last_package_time > 5:
                xbee_close()
                xbee_connect()
                last_package_time = time.time()

        except:
            if rf_device is None or not rf_device.is_open():
                xbee_connect()

# https://github.com/digidotcom/python-xbee/tree/master/examples/communication
def xbee_send(data):
    send_amount = 5
    print("xbee_send called. sending message " + str(send_amount) + " times..", flush=True)
    if rf_device is None or not rf_device.is_open():
        xbee_connect()
    for _ in range(send_amount):
        rf_device.send_data_broadcast(data)


def xbee_close():
    if rf_device is not None and rf_device.is_open():
        rf_device.close()
