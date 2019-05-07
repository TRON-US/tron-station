FROM ubuntu:16.04
MAINTAINER Jackie Shen

# Add application repository URL to the default sources
# RUN echo "deb http://archive.ubuntu.com/ubuntu/ raring main universe" >> /etc/apt

# Update repository

RUN apt-get update && \ 
  apt-get install -y nano wget dialog net-tools && \ 
  apt-get install -y --no-install-recommends apt-utils


# Update time zone

ENV TIME_ZONE=America/Los_Angeles
RUN echo $TIME_ZONE > /etc/timezone && \ 
  ln -sf /usr/share/zoneinfo/$TIME_ZONE /etc/localtime && \
  apt-get update && \
  apt-get install tzdata && \
  dpkg-reconfigure --frontend noninteractive tzdata


# Install tron station

RUN mkdir -p /tron/tron-station/ && \
  cd /tron/tron-station && \
  mkdir log && \ 
  mkdir webapp && \
  mkdir data-process
# ADD build /tron/tron-station/webapp/
# RUN chmod 755 /tron/tron-station/webapp/


# Install node

RUN apt-get install -y wget && \
  wget https://deb.nodesource.com/setup_8.x && \
  bash setup_8.x && \
  apt-get install -y nodejs


# Install tron station data process module

ADD data-process /tron/tron-station/data-process
WORKDIR /tron/tron-station/data-process
RUN npm install
EXPOSE 4000


# Install mysql

WORKDIR /tron/
ENV MYSQL_PWD noPass123
# ADD mysql-apt-config_0.8.12-1_all.deb /tron
ADD source.sql tron-station/
RUN apt-get install -y lsb-core && \ 
  # dpkg -i mysql-apt-config_0.8.12-1_all.deb && \
  echo "mysql-server mysql-server/root_password password $MYSQL_PWD" | debconf-set-selections && \ 
  echo "mysql-server mysql-server/root_password_again password $MYSQL_PWD" | debconf-set-selections && \
  apt-get install -y mysql-server
EXPOSE 3306


# Install nginx

# RUN apt-get install -y nginx  && \ 
#   rm -v /etc/nginx/nginx.conf
# ADD nginx.conf /etc/nginx/
# RUN echo "daemon off;" >> /etc/nginx/nginx.conf
# EXPOSE 80


ADD start.sh /tron
RUN chmod +x /tron/start.sh

CMD ["sh", "/tron/start.sh"]