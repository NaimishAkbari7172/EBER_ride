 <!-- create image commands for cmd, flag t for name image file -->
 docker build -t image_name 
 docker images (check imge is add or not)
 docker run image_name
 docker rmi image_name (for remove existing image)
 docker ps -a (image was removed but there was a container which uses this image, so need to check container and remove it)
 docker rm container_name 
 docker rmi image_name (then will be remove image)

 <!-- then after need to push that image in dockerhub then -->
 docker login
 docker push image_name

 <!-- if want to pust that image in AWS ECR -->
 need to install aws CLI for login first to aws 
 create repo of that image
 each image hase separate repo
 in that image repo have multiple version of images
 for there will be command to push images in that repo
 docker push repo/image_name


 <!-- Docker volumes -->
 when docker container restart or removed then the data is also will be removed , so for storing that data need to docke volume
 on host machine there will be local file for stored data it will be shared to virtual machine of container

 3 type of volume :
    1. host volume = where on the host file system tthe dir ref will be stored
        docker run -v host_dir:virtual_dir
    2.anonymus volume = for this , docker will generate virtual_dir by own
        docker run -v host_dir
    3.named volumes = (upgraded of anonymus) reference to th name, mostly used in production
        docker run -v name:host_dir