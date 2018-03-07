set -u
set -e
set -o xtrace

if [[ $# -ne 2 ]]; then
    echo "Usage: $0 data.log database"
    exit 1
fi

if [[ ! -f "influxdbformatter.sh" ]]; then
    echo "influxdbformatter.sh mising"
    exit 1
fi

inputfile=$1
tmpfile="/tmp/flightdata_$$"

./influxdbformatter.sh < $inputfile > $tmpfile

head $tmpfile

database=$2
curl -i -XPOST "http://localhost:8086/query" --data-urlencode "q=CREATE DATABASE ${database}"

curl -i -XPOST "http://localhost:8086/write?db=${database}" --data-binary @"${tmpfile}"

rm $tmpfile