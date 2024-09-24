
# Use an official Node.js image as a base
FROM node:20.10.0-alpine
 
# Set the working directory to /app
WORKDIR /app
 
# Copy the package*.json files to the working directory
COPY package*.json ./
 
# Install the dependencies
RUN npm install --force

# Install nodemon globally
# RUN npm install -g nodemon
 
# Copy the application code to the working directory
COPY . .
 
# Expose the port that the application will use
EXPOSE 4000
 
# Run the command to start the development server
CMD ["npm", "run", "dev"]