# Docker Containers

These are the docker containers that we are probably gonna set up for this project.

## Overview

There will be two configurations, one for the server, and one running on the groundstation laptop.

The server will run some more software that is not directly connected to the groundstation software, just linking to it.

If possible, set up everything in two docker-compose.yml files, one for server and one for laptop

### software on groundstation laptop

* InfluxDB
* Visualization
* Data receiver
* RF receiver interface

### groundstation software running on server

* InfluxDB
* Visualization
* Data receiver
* MySQL

### Other on server

* HAProxy
* WordPress
* MediaWiki
* OwnCloud?


## Containers

### InfluxDB

The time series database in which we store flight data. One db per flight.

### Visualization

Gets the data from InfluxDB and sends it to a web client (via websocket?). Allows viewing a flight in real time, or browsing an archive of flights.

### Data receiver

Receives json data about a flight/test/simulation and writes it to InfluxDB

### RF receiver interface

Communicates with the RF receiver and sends the data as json to the data receiver, both on the laptop and on the server.

### MySQL

We might have some data about the flights that we can't store in InfluxDB, such as the flight description, name, type, etc.

This MySQL instance will also be used by the WordPress, MediaWiki, and OwnCloud containers.

### HAProxy

Redirects the HTTP requests to the server to the appropriate container, thus allowing us to run the wordpress homepage (php) and the node.js visualization both on port 80.

### WordPress

Hosting the home page.

### MediaWiki

Wiki to facilitate linkable documentation for all ARIS knowledge.

### OwnCloud

We might migrate google drive stuff to here.