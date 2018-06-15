from binascii import hexlify
import json

files_path = 'dump/'

def write_raw_data_to_file(binary_data, file):
    with open(file_path + file, 'ab+') as file:
        file.write(hexlify(binary_data) + b'\n')

def write_decoded_data_to_file(data, file):
    with open(file_path + file, 'a+') as file:
        file.write(json.dumps(data) + '\n')
