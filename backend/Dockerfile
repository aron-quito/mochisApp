FROM php:8.2-apache

# Install required PHP extensions for MariaDB (PDO)
RUN docker-php-ext-install pdo pdo_mysql

# Enable Apache mod_rewrite
RUN a2enmod rewrite
RUN sed -i 's/AllowOverride None/AllowOverride All/g' /etc/apache2/apache2.conf

# Copy API files later via volume or directly
# Set appropriate permissions if needed
RUN chown -R www-data:www-data /var/www/html
