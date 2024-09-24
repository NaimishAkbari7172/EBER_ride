<!-- crate a mongo.yaml file for all container -->

version: '3'
services :
    mongodb (container-name):
        image: mongo
        ports:
            -27017:27017
        volumes:
            -db-data:/var/lib/db/data
        environment:
            -MONGO_INITDB_ROOT_USERNAME=username
            -MONGO_INITDB_ROOT_PASSWORD=password 
volumed:
    db-data

version: '3'
services :
    mongodb (momgo-express config with this server):
        image: mongo
        ports:
            -27017:27017
    mongo-express (container-name):
        image:mongo-express
        ports:
            -8080:8080
    environment:
        -ME_CONFIG_MONGODB_ADMINUSERNAME=userame
        -ME_CONFIG_MONGODB_ADMINPASSWORD=password
        .....


<!-- this compose used for run the new network and work both together -->
version: '3'
services:
    mongodb (momgo-express config with this server):
        image: mongo
        ....
    mongo-express (container-name):
        image:mongo-express
        ....



<!-- In cmd run command ,arguement file -f, up for start and down for stop, down will remove the created same network and check with "npm networks ls" there are no networks -->
docker compose -f mongo.yaml up
docker compose -f mongo.yaml down