server {
    listen 80;
    listen [::]:80;

    root /var/www/moon-trek.com/html;
    index index.html index.htm index.nginx-debian.html;

    server_name moon-trek.com www.moon-trek.com;

    location / {
        try_files $uri $uri/ =404;
    }

    location /api {
        proxy_pass http://localhost:8888;
    }
}