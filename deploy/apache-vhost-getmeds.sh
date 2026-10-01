#!/bin/bash
# Run once as root (WHM -> Terminal): bash /home/n36efd5/apache-vhost-getmeds.sh
#
# Sends getmeds.ph to the Next.js app (PM2, 127.0.0.1:3000) in Apache's virtual host for the
# domain, before Apache looks at any folder or .htaccess. Needed because getmeds.ph's document
# root (/home/getmeds/public_html) also holds real folders such as blog/ (cms.getmeds.ph's
# WordPress), and Apache answers a bare folder URL like /blog itself, with a 403.
#
# Only the getmeds.ph virtual host (and its www alias) is affected; admin.getmeds.ph,
# cms.getmeds.ph and the other subdomains have their own virtual hosts.
#
# Undo:
#   rm -rf /etc/apache2/conf.d/userdata/{ssl,std}/2_4/getmeds/getmeds.ph
#   /scripts/rebuildhttpdconf && /scripts/restartsrv_httpd
set -euo pipefail

base=/etc/apache2/conf.d/userdata
mkdir -p "$base/std/2_4/getmeds/getmeds.ph" "$base/ssl/2_4/getmeds/getmeds.ph"

# http: everything to https://getmeds.ph, except AutoSSL's domain checks.
cat > "$base/std/2_4/getmeds/getmeds.ph/nextjs.conf" <<'EOF'
RewriteEngine On
RewriteCond %{REQUEST_URI} !^/\.well-known/
RewriteRule ^ https://getmeds.ph%{REQUEST_URI} [R=301,L]
EOF

# https: www -> bare domain, then everything to the app.
cat > "$base/ssl/2_4/getmeds/getmeds.ph/nextjs.conf" <<'EOF'
RewriteEngine On
RewriteRule ^/\.well-known/ - [L]
RewriteCond %{HTTP_HOST} !^getmeds\.ph$ [NC]
RewriteRule ^ https://getmeds.ph%{REQUEST_URI} [R=301,L]
ProxyPreserveHost On
RequestHeader set X-Forwarded-Proto "https"
RewriteRule ^/(.*)$ http://127.0.0.1:3000/$1 [P,L]
EOF

/scripts/rebuildhttpdconf
if apachectl configtest; then
  /scripts/restartsrv_httpd
  echo "DONE: getmeds.ph now goes straight to the app."
else
  echo "Config test failed; removing the new files so nothing changes."
  rm -rf "$base/std/2_4/getmeds/getmeds.ph" "$base/ssl/2_4/getmeds/getmeds.ph"
  /scripts/rebuildhttpdconf
  exit 1
fi
