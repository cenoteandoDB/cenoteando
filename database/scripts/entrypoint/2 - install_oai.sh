mkdir -p /var/logs/init
foxx install --database cenoteando /oai /opt/oai/ 2>&1 | tee /var/logs/init/oai.log
foxx deps --database cenoteando /oai backend=/api 2>&1 | tee /var/logs/init/oai.log
