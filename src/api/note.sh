docker run --rm -d -p 8044:8080 --name swagger-editor -e SWAGGER_FILE=/tmp/openapi.yaml -v $(pwd):/tmp swaggerapi/swagger-editor
docker run --rm -d -p 6379:6379 --name redis redis --save ''

http://192.168.10.211:8044
http://192.168.10.211:8080/api-docs

