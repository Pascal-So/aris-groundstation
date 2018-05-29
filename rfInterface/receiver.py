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

# connected to /dev/ttyUSBx in docker compose file
PORT = "/USB"
# PORT = "/dev/ttyUSB2"

# TODO: Replace with the baud rate of your local module.
BAUD_RATE = 9600

rf_device = None

def receiver_listen(callback):
    global rf_device
    rf_device = XBeeDevice(PORT, BAUD_RATE)
    rf_device.open()
    rf_device.add_data_received_callback(callback)

def receiver_close():
    if rf_device is not None and rf_device.is_open():
        rf_device.close()