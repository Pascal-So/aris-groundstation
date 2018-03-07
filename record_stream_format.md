# Rocket records data format

Authors: Pascal Sommer, Raphael Schnider

Version history:
* 0.1 - initial draft - 2018-03-07
* 0.2 - add possible changes section - 2018-03-07

## Example

```js
{
    'header': {
        'type': 'flight',
	'name': 'mestral_1',
	'description': 'Mestral, 14. November 2017, Kaltbrunn'
    },
    'data': [
        {
            'ts': '1510671624000000000',
	    'event': false,
	    'values': {
	        'pos_x': '12.54',
	    	'pos_y': '7.39',
	    	'pos_z': '186.87'
	    }
	},
	{
	    'ts': '1510671624010000000',
	    'event': true,
	    'severity': 5,
	    'message': 'main engine burnout'
	},
	{
            'ts': '1510671624020000000',
	    'event': false,
	    'values': {
	        'pressure': '97335.12',
	    }
	},
	{
            'ts': '1510671624020000000',
	    'event': false,
	    'values': {
	        'pos_x': '12.76',
	    	'pos_y': '7.55',
	    	'pos_z': '187.43'
	    }
	}
    ]
}
```

## Design goals

This format doesn't need to be as efficient as possible, instead we are optimizing for generality, readability, and most importantly, streamability.

The format should be adequte for data obtained from flights, but also from tests or simulations. We realize, that these records might differ in the fields they provide; for example while flight records might hold values for 'pos_x', a windtunnel test might not provide this field. We designed the format to be adaptive to these differences.

We are planning to use this format in the following interfaces:
* Transmitting data from the groundstation in real time to the server.
* Streaming data from a simulation to the visualization.
* Storing logs of an entire flight/test/simulation in a human readable format.
* Sending data from a flight that predates the server software to the server.
* Sending data that was captured while offline.
* etc.

We are **not** planning to use it here:
* RF communication from rocket to ground station.

## Format description

### 'header'

js object, required.

#### 'header'->'type'

string, required.

Because not every record will deliver the same fields, we need to distinguish between the different record categories.

This field could for example be used to choose the visualization front-end, such that no map view is displayed for a windtunnel test.

Fields listed in the type but missing in the actual data may generate errors or warnings (depending on the exact field missing) in the receiving software. These errors or warnings should be transmitted back to the sender or displayed in the receiving software, depending on the use case.

Fields that are not part of the type specification but are still present in the data should be ignored by the receiving software, and may either be dropped or stored anyway.

* 'flight': Data sent down from a rocket during a flight. Includes: tbd.

* 'freeform': This type makes no statement about the fields included in the reccord. The receiving software should accept all fields contained in the data. When choosing this type, please consider that the visualization software might not be able to handle some of the fields, or won't know what components (map/3d view/graphs) to display.

* 'windtunnel': tbd.

* 'static firing test': tbd.

* 'simulation': tbd.


#### 'header'->'name'

string, required.

This field should only contain lowercase alphanumeric characters and underscores.

The value should be a unique description of this event, it will serve as the identifier to find the event in the visualization software.

#### 'header'->'description'

string, optional.

A short description of the flight/test/simulation.

### 'data'

array, required.

Contains between 0 and infinite js objects.

A packet in this array can either be a collection of values (a data packet) or an event (event packet).

#### 'data'[i]->'ts'

string, required.

Absolute nanosecond timestamp.

#### 'data'[i]->'event'

bool, required.

If set to true, this packet represents an event, otherwise, this is a data packet and contains values.

#### 'data'[i]->'severity'

int, only for events, optional.

The event severity, according to the syslog scale.
* 0 Emergency
* 1 Alert
* 2 Critical
* 3 Error
* 4 Warning
* 5 Notice
* 6 Informational
* 7 Debug

This field should not be present in data packets.

#### 'data'[i]->'message'

string, only for events, required.

The event message. This string should not contain any newlines.

This field should not be present in data packets.

#### 'data'[i]->'values'

js object, only for data packets, required.

This object contains key value pairs of the recorded fields and their values. See example. The values for the recorded fields should be of the types int/double/string/bool, and not be arrays or objects.

## Transmission considerations

We decided to interweave events and data packets to facilitate live streaming of records. There are however some more details that need to be considered when streaming a record. If, for example, flight data is to be streamed, such that the flight can be observed remotely in real time, we probably want to set up a database and some other environment factors for this specific flight on the server that is going to receive the stream, in other words, we want the server to be prepared. This could be achieved by sending only the header object in advance, without the data array, after which the server has time to set up the database, and people can open the live view in their browser. As soon as the flight begins, the easiest option would probably be to just stream the entire file, i.e. resending the header, that way we don't have to retain a connection to the server and the server can still identify the intended destination for this record, even if multiple tests or simulations run at the same time.

## Possible changes

This isn't a finished specification, we might have to change some things in the future. Here is a place for thoughts.

Thoughts:

* Grouping values

  It might make sense to not throw all the fields in one big bucket, but rather divide them in to tables, so every value would then belong to a field within a table, whereas currently, values only belong to a field.

  Possible new format for a data packet
  ```js
  {
      'ts': '1510671624000000000',
      'event': false,
      'values': {
          'pos': {
              'x': '12.54',
              'y': '7.39',
              'z': '186.87'
          },
          'rot': {
              'x': '0.7231',
              'y': '0.00272',
              'z': '-0.00073',
              'w': '0.71138'
          }
      }
  }
  ```
  We would thus have two tables, a table position with 3 columns and a table rotation with 4 columns.
