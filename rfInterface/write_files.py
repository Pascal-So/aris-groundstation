from binascii import hexlify
import json
from os import mkdir

files_path = '/var/log/receiver/'

def better_mkdir(dir):
    """Does nothing if the directory exists already."""
    try:
        mkdir(dir)
    except FileExistsError:
        pass

def make_log_dir(dbname):
    better_mkdir(files_path)
    better_mkdir(files_path + dbname)

def write_data_to_file(binary_data, decoded_data, dbname):
    make_log_dir(dbname)
    complete_path = files_path + dbname + '/'

    with open(complete_path + 'raw.log', 'ab+') as file:
        file.write(hexlify(binary_data) + b'\n')
    with open(complete_path + 'decoded.log', 'a+') as file:
        file.write(json.dumps(decoded_data) + '\n')
