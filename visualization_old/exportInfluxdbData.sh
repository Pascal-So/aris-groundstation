set -u
set -e
#set -o xtrace

if [[ $# -ne 1 ]]; then
    echo "usage: $0 dbname"
    exit 1
fi

ip=159.89.2.225


database=$1

time_start=$(curl -G "http://${ip}:8086/query?pretty=true" --data-urlencode "db=${database}" --data-urlencode "q=SELECT first(x) FROM pos" 2>/dev/null | grep -e "Z\"," | cut -d\" -f2 | xargs -i date --date {} "+%s%N" | sed 's/$//')

time_end=$(curl -G "http://${ip}:8086/query?pretty=true" --data-urlencode "db=${database}" --data-urlencode "q=SELECT last(x) FROM pos" 2>/dev/null | grep -e "Z\"," | cut -d\" -f2 | xargs -i date --date {} "+%s%N" | sed 's/$//')

#echo $time_start $time_end


curl -G "http://${ip}:8086/query?pretty=true" --data-urlencode "db=${database}" --data-urlencode "q=SELECT first(x), first(y), first(z), first(w), first(z2) FROM rot,pos where time >= ${time_start} and time <= ${time_end} GROUP BY time(20ms) fill(linear)"
# 
