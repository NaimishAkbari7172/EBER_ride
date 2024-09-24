<!-- Using mongo and mongo-express image  -->
docker pull mongo-express
docker pull mongo

<!-- create docker network, Running both on same network, so create one  -->
docker network create mongo-network
docker network ls

<!-- start mongodb with port 27017 with username and password of database  -->
docker run -d \
-p 27017:27017 \
-e MONGO_INITDB_ROOT_USERNAME=akbarinaimish7172 \
-e MONGO_INITDB_ROOT_PASSWORD=naimakbari@7172 \
--net mongo-network \
--name mongodb \
mongo

<!-- start mongo-express server with port 8081 port with same network of mongodb container -->
docker run -d \
-p 8081:8081 \
-e ME_CONFIG_MONGODB_ADMINUSERNAME=akbarinaimish7172 \
-e ME_CONFIG_MONGODB_ADMINPASSWORD=naimakbari@7172 \
-e ME_CONFIG_MONGODB_SERVER=mongodb
--net mongo-network \
--name mongo-express \
mongo-express