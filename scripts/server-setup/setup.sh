# Update system packages
sudo apt update && sudo apt upgrade

# Install NodeJs, Node Package Manager, and Nginx
sudo apt install nodejs npm nginx

# Install client dependency packages and build client files
pushd ../../client && npm install && npm run build

# Create directory for client files
sudo mkdir -p /var/www/moon-trek.com/html/

# Assign ownership of the directory to our user account
sudo chown -R $USER:$USER /var/www/moon-trek.com/html/

# Allow the owner to read, write, and execute the
# files while granting only read and execute
# permissions to groups and others
sudo chmod -R 755 /var/www/moon-trek.com/

# Copy built client files to the new directory so
# they can be served by Nginx
sudo cp -r dist/* /var/www/moon-trek.com/html/

# Install express server dependencies
cd ../server && npm install

# Prepare config file from sample
cp sample.config.json config.json

# Move back to the original directory to copy necessary files
popd

# Copy moon-trek's nginx server block config file
sudo cp moon-trek.com /etc/nginx/sites-available/

# Enable the server block by creating a symlink to it in the sites-enabled directory
sudo ln -s /etc/nginx/sites-available/moon-trek.com /etc/nginx/sites-enabled/

# Copy and enable systemd service which starts
# the express server on system boot
sudo cp start-server.service /etc/systemd/system/
sudo systemctl enable start-server.service

# Enable Nginx and firewall systemd services
sudo systemctl enable nginx
sudo systemctl start nginx
sudo systemctl enable ufw
sudo systemctl start ufw
sudo ufw allow 'Nginx Full'

# Enable HTTPS with certbot
# sudo apt install certbot python3-certbot-nginx
# sudo certbot --nginx -d moon-trek.com -d www.moon-trek.com