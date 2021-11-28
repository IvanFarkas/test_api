#az account set -s "Azure subscription 1"

# RBAC - see service_principle.sh
export SUBSCRIPTION_ID=$(az account show --query id --output tsv)
# aka Client Id
export APP_ID=$(az ad sp list --display-name $SERVICE_PRINCIPAL_NAME --query "[].appId" --output tsv)
export CLIENT_ID=$APP_ID
# aka Directory Id
export TENANT_ID=$(az account show --query tenantId --output tsv)
export OBJECT_ID=$(az ad sp list --query "[?displayName == 'hdsoft_dev'].objectId" --output tsv)
az ad sp show --id $CLIENT_ID
az ad sp list --query "[?displayName == '$SERVICE_PRINCIPAL_NAME']"

az login --service-principal -u $APP_ID -p $CLIENT_SECRET --tenant $TENANT_ID
#az login
#az login --use-device-code

#az account list
az account set -s "Windows Azure MSDN - Visual Studio Ultimate"
az account show
az configure -d location=$LOCATION

az group create -n $RG -l $LOCATION --tags $TAGS
az acr create -g $RG -n $ACR_NAME --sku Basic --admin-enabled true --allow-exports true --tags $TAGS
az acr list --query "[?name == '$ACR_NAME']"
#az acr delete -g $RG -n $ACR_NAME

# Docker
docker system prune

# Docker image
docker stop testapi && docker rm testapi
docker build --build-arg MAX_RECORD_COUNT=3 --build-arg COSMOS_ENDPOINT=$COSMOS_ENDPOINT --build-arg COSMOS_KEY=$COSMOS_KEY --build-arg DATABASE_ID=$DATABASE_ID --build-arg PARTITION_KEY=$PARTITION_KEY --build-arg USERS_ID=$USERS_ID --build-arg POSTS_ID=$POSTS_ID -t $ACR_NAME.azurecr.io/testapi:latest .
# To debug with VS Code, must forward port 9229 - https://www.section.io/engineering-education/how-to-debug-a-nodejs-application-running-in-a-docker-container/
docker run -d -p 8080:8080 -p 9229:9229 --name testapi --hostname testapi $ACR_NAME.azurecr.io/testapi:latest
http://192.168.10.211:8080/api-docs
docker stop testapi
docker start testapi

az acr credential show -g $RG -n $ACR_NAME
export ACR_PASSWORD=$(az acr credential show -g $RG -n $ACR_NAME --query "passwords[0].value" --output tsv)

# User
docker login $ACR_NAME.azurecr.io -u $ACR_NAME -p $ACR_PASSWORD

# Service Principle
#docker login $ACR_NAME.azurecr.io -u $APP_ID -p $CLIENT_SECRET

#docker logout $ACR_NAME.azurecr.io
az acr login -n $ACR_NAME
# Portainer: http://192.168.10.211:9000

docker push $ACR_NAME.azurecr.io/testapi:latest
docker pull $ACR_NAME.azurecr.io/testapi:latest
az acr repository list -n $ACR_NAME
az acr repository show-tags -n $ACR_NAME --repository testapi

az acr list -g $RG --query "[].{acrLoginServer:loginServer}" --output table
# $ACR_NAME.azurecr.io

# Application Insights
# MissingSubscriptionRegistration
# The subscription is not registered to use namespace 'Microsoft.AlertsManagement
# Resolve errors for resource provider registration - https://portal.azure.com/?websitesextension_ext=asd.featurePath%3Danalysis%2FLinuxAppDown#@TestApiHDSoftoutlook.onmicrosoft.com/resource/subscriptions/7a9360bd-ee85-45c6-9970-17af9f4bd704/resourceGroups/test-api/providers/microsoft.insights/components/test-api-02/overview
# API key: ewfbfjoewyjaf1dggea1qwlmkzs7phk5jmcsczch
az provider list
az provider register --namespace Microsoft.AlertsManagement
az provider show -n Microsoft.Web --query "resourceTypes[?resourceType=='sites'].locations"

# log-analytics workspace
az monitor log-analytics workspace create -g $RG -n test-api --tags $TAGS

# app-insights
#TODO: Migrate to alerts (preview) - https://docs.microsoft.com/en-us/azure/azure-monitor/alerts/alerts-smart-detections-migration
az monitor app-insights component create -g $RG -a test-api --workspace test-api --query-access Enabled --tags $TAGS

# Azure API Management
az apim create -n test-api -g $RG --publisher-name 3DHDSoft --publisher-email TestApiHDSoft@Outlook.com --sku-name Developer --no-wait --dns-name testapi.domain.com --tags $TAGS

# k8s
az aks get-versions -l $LOCATION --output table
# 1.22.2(preview)

# Run Kubernetes in Azure the Cheap Way - https://trstringer.com/cheap-kubernetes-in-azure
# Service principals with Azure Kubernetes Service (AKS) - https://docs.microsoft.com/en-us/azure/aks/kubernetes-service-principal?tabs=azure-cli
az aks create -g $RG -n $AKS_NAME -k 1.22.2 -c 1 -s Standard_B2s --service-principal $APP_ID --client-secret $CLIENT_SECRET --enable-aad --enable-azure-rbac --node-osdisk-size 30 --generate-ssh-keys --attach-acr $ACR_NAME --tags $TAGS
#az aks create -g $RG -n $AKS_NAME -k 1.22.2 -c 1 -s Standard_B2s --node-osdisk-size 30 --generate-ssh-keys --tags $TAGS
az aks list

# Stop
# az aks stop -g $RG -n $AKS_NAME

# Start
# az aks start -g $RG -n $AKS_NAME

# Delete
# az aks delete -g $RG -n $AKS_NAME

# Connect to cluster -  --admin
az aks get-credentials -g $RG -n $AKS_NAME

kubectl config get-contexts
#kubectl config delete-context hdsoft-admin
kubectl config use-context $AKS_NAME
kubectl get nodes

# Create a static IP address
export NODE_RG=$(az aks show -n $AKS_NAME --query nodeResourceGroup --output tsv)
az network public-ip create -g $NODE_RG -n $RG --sku Standard --allocation-method static --tags $TAGS
#az network public-ip delete -g $NODE_RG -n $RG
az network public-ip show -g $NODE_RG -n $RG --query ipAddress --output tsv
# 20.114.222.121

# Create a service using the static IP address
#az role assignment create --assignee $CLIENT_ID --role "Network Contributor" --scope /subscriptions/$SUBSCRIPTION_ID/resourceGroups/test-api

# Use a static public IP address and DNS label with the Azure Kubernetes Service (AKS) load balancer - https://docs.microsoft.com/en-us/azure/aks/static-ip#apply-a-dns-label-to-the-service

# Helm
helm repo add stable https://charts.helm.sh/stable
helm repo update

helm install testapi ./test-api -n default --dry-run
helm install testapi ./test-api -n default
helm upgrade --install testapi ./test-api -n default
# Error: query: failed to query with labels: secrets is forbidden: User "4bc48b9c-a5f4-4c74-bf54-d611925584f8" cannot list resource "secrets" in API group "" in the namespace "default": User does not have access to the resource in Azure. Update role assignment to allow access.
# Error: query: failed to query with labels: secrets is forbidden: User  cannot list resource "secrets" in API group "" in the namespace "default": User does not have access to the resource in Azure. Update role assignment to allow access.

helm uninstall testapi -n default

# Get the application URL by running these commands:
export POD_NAME=$(kubectl get pods -n default -l "app.kubernetes.io/name=test-api,app.kubernetes.io/instance=testapi" -o jsonpath="{.items[0].metadata.name}")
echo $POD_NAME
export CONTAINER_PORT=$(kubectl get pod -n default $POD_NAME -o jsonpath="{.spec.containers[0].ports[0].containerPort}")
echo $CONTAINER_PORT
export CONTAINER_NAME=$(kubectl get pod -n default $POD_NAME -o jsonpath="{.spec.containers[0].name}")
echo $CONTAINER_NAME
export SERVICE_NAME=$(kubectl get pod -n default $POD_NAME -o jsonpath="{.spec.serviceAccount}")
echo $SERVICE_NAME

kubectl -n default port-forward $POD_NAME 8080:$CONTAINER_PORT
# In a different terminal
curl -X 'GET' 'http://localhost:8080' -H 'accept: application/json'
curl -X 'GET' 'http://localhost:8080/livez' -H 'accept: application/json'

export SERVICE_IP=$(kubectl get svc -n default $SERVICE_NAME --template "{{ range (index .status.loadBalancer.ingress 0) }}{{.}}{{ end }}")
echo http://$SERVICE_IP:8080
echo http://$SERVICE_IP:8080/api-docs
echo http://$SERVICE_IP:8080/openapi.yaml

http://20.114.222.121:8080/api-docs
http://20.114.222.121:8080/openapi.yaml

export LB_IB=$(kubectl get service -n default $SERVICE_NAME -o json -o jsonpath="{.status.loadBalancer.ingress[0].ip}")
echo $LB_IB
echo http://$LB_IB:8080

# Troubleshoot
kubectl get pods
kubectl describe pod $POD_NAME
kubectl get services
kubectl get service $SERVICE_NAME
kubectl describe service $SERVICE_NAME
kubectl logs $POD_NAME $CONTAINER_NAME
kubectl logs --previous $POD_NAME $CONTAINER_NAME
kubectl exec -it $POD_NAME -c $CONTAINER_NAME -- sh
kubectl get endpoints

# Run applications in Azure Kubernetes Service (AKS) - https://docs.microsoft.com/en-us/azure/aks/tutorial-kubernetes-deploy-application?tabs=azure-cli

# Apply a DNS label to the service - https://docs.microsoft.com/en-us/azure/aks/static-ip#apply-a-dns-label-to-the-service
# http://testapi-02.eastus2.cloudapp.azure.com:8080
# http://testapi-02.eastus2.cloudapp.azure.com:8080/api-docs
# http://testapi-02.eastus2.cloudapp.azure.com:8080/openapi.yaml

# Verify
kubectl describe service $SERVICE_NAME

nslookup testapi-02.eastus2.cloudapp.azure.com
# Server:         127.0.0.53
# Address:        127.0.0.53#53
# Non-authoritative answer:
# Name:   testapi-02.eastus2.cloudapp.azure.com
# Address: 20.114.222.121

# 5 ways to make HTTP requests in Node - https://blog.logrocket.com/5-ways-to-make-http-requests-in-node-js
# Got (HTTP/2 support) - https://github.com/sindresorhus/got

# Postman - Mock Server - > 2s delay, JSON result set - https://16098d97-5371-4527-9547-398e88365341.mock.pstmn.io/mock-server

# Redis in Node - node_redis - https://docs.redis.com/latest/rs/references/client_references/client_nodejs
# Redis in Node - ioredis - https://docs.redis.com/latest/rs/references/client_references/client_ioredis
# Migrating from Node Redis to Ioredis - https://ably.com/blog/migrating-from-node-redis-to-ioredis
