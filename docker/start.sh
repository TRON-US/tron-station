#!/bin/sh

echo "Run MySQL......"
chown -R mysql:mysql /var/lib/mysql
service mysql start

sleep 5

echo "Set up db schema......"
mysql < /tron/tron-station/source.sql

sleep 5

ps -wef | grep mysql | grep -v grep | awk '{print $2}' | xargs kill -9
chown -R mysql:mysql /var/run/mysqld
service mysql start

echo "Run Data process project......"
cd /tron/tron-station/data-process/ 
npm start >> /tron/tron-station/log/data-process.log

# echo "Run Nginx......"
# service nginx start 