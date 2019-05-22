import unittest
import parser
import struct
import ifdb

class TestParser(unittest.TestCase):

    def test_dd_to_dms(self):
        dms = '45°46\'52.00"N, 108°30\'14.00"W'
        res = parser.decimal_degrees_to_degrees_minutes_seconds(45.7811111, -108.5038888)
        self.assertEqual(dms, res)

        dms = '45°46\'52.00"S, 108°30\'14.00"E'
        res = parser.decimal_degrees_to_degrees_minutes_seconds(-45.7811111, 108.5038888)
        self.assertEqual(dms, res)

    def test_parse_message_gps(self):
        time_ms = 12345
        sensor_id = 7
        lat, lng = 457811111, -1085038888
        bstrm = struct.pack('<IBii', time_ms, sensor_id, lat, lng)

        self.assertEqual(parser.parse_message(bstrm), {
            'measurement': 'gps1',
            'time': 12345,
            'fields': {
                'coords': '45°46\'52.00"N, 108°30\'14.00"W'
            }
        })

class TestIfdbStuff(unittest.TestCase):

    def test_timestamp_converter(self):
        self.assertEqual(ifdb.timestamp_ms_to_string_time(12345), '1970-01-01 00:00:12.345')

if __name__ == '__main__':
    unittest.main()
