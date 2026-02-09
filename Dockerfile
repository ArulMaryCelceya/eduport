FROM nginx:alpine

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy website files
COPY . /usr/share/nginx/html

# Expose internal port
EXPOSE 5501

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
