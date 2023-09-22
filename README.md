<<<<<<< HEAD
hola rube
=======
docker login
docker build -t capillas .
docker tag capillas capillas/test2:latest

docker tag imagen_local capillas/test2:latest
docker push capillas/test2:latest


>>>>>>> 2084e2ac99cd52b187a491f74f59730cfdc7f2d1
 ssh -i test1.pem ec2-user@ec2-52-55-223-178.compute-1.amazonaws.com
 docker login
docker images
sudo yum update -y
sudo yum install -y docker

docker --version
sudo service docker start

docker login

sudo usermod -a -G docker ec2-user


sudo docker pull capillas/bot16agust:tagname
sudo docker images
sudo docker run capillas/bot16agust:tagname

sudo docker run -d --restart always --name mi_bot capillas/bot16agust:tagname

sudo docker stop mi_bot
sudo docker run -d --restart always -p 8080:8080 capillas/bot16agust:tagname
sudo docker run -d --restart always capillas/bot16agust:tagname
docker logs -f a5d0e2812fd7
docker inspect a5d0e2812fd7
docker ps# Bot1
