mkdir -p /var/logs/init
foxx install --database cenoteando /api /opt/api/ 2>&1 | tee /var/logs/init/api.log
