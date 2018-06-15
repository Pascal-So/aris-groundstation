from binascii import hexlify

raw_out_file_path = 'raw_received.log'
raw_out_file = None

decoded_out_file_path = 'raw_received.log'
decoded_out_file = None

def write_raw_data_to_file(data):
    global raw_out_file
    if raw_out_file == None or raw_out_file.closed:
        raw_out_file = open(raw_out_file_path, 'ab+')
    raw_out_file.write(hexlify(data) + b'\n')
    raw_out_file.flush()


def write_decoded_data_to_file(data):
    global decoded_out_file
    if decoded_out_file == None or decoded_out_file.closed:
        decoded_out_file = open(decoded_out_file_path, 'a+')

    decoded_out_file.write(data)
