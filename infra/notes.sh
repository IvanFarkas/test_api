# Create a Kubernetes cluster with Azure Kubernetes Service using Terraform - https://docs.microsoft.com/en-us/azure/developer/terraform/create-k8s-cluster-with-tf-and-aks

az login --use-device-code
az account show
az account list --query "[?user.name=='$USER_NAME'].{Name:name, ID:id, Default:isDefault}" --output Table
az account set --subscription "$SUBSCRIPTION_NAME"

# Create a service principal - https://docs.microsoft.com/en-us/azure/developer/terraform/authenticate-to-azure?tabs=bash#create-a-service-principal
#   Resourse: Azure Role-Based Access Control (RBAC) - https://docs.microsoft.com/en-us/azure/role-based-access-control/built-in-roles
az ad sp create-for-rbac -n Test_API
printenv | grep ^ARM*

# Set up Azure storage to store Terraform state - https://docs.microsoft.com/en-us/azure/developer/terraform/create-k8s-cluster-with-tf-and-aks#8-set-up-azure-storage-to-store-terraform-state
az group create -n $RG_TF_STATE -l $LOCATION
az storage account create -g $RG_TF_STATE -n $TF_STATE_SA_NAME --kind StorageV2 --sku Standard_LRS
export TF_STATE_SA_KEY=$(az storage account keys list -g $RG_TF_STATE --account-name $TF_STATE_SA_NAME --query "[0].value" -o tsv)
az storage container create -n $TF_STATE_CONTAINER --account-name $TF_STATE_SA_NAME --account-key $TF_STATE_SA_KEY
terraform init -backend-config="storage_account_name=$TF_STATE_SA_NAME" -backend-config="container_name=$TF_STATE_CONTAINER" -backend-config="access_key=$TF_STATE_SA_KEY" -backend-config="key=$TF_STATE_KEY"
terraform plan
terraform apply -auto-approve

# Test the Kubernetes cluster - https://docs.microsoft.com/en-us/azure/developer/terraform/create-k8s-cluster-with-tf-and-aks#11-test-the-kubernetes-cluster
echo "$(terraform output kube_config)" >./azurek8s
export KUBECONFIG=./azurek8s
kubectl get nodes

# Docker
docker system prune

# Docker image
export ACR_PASSWORD=$(az acr credential show -g $RG -n $ACR_NAME --query "passwords[0].value" --output tsv)
docker login $ACR_NAME.azurecr.io -u $ACR_NAME -p $ACR_PASSWORD

docker stop testapi && docker rm testapi
docker build --build-arg MAX_RECORD_COUNT=3 --build-arg COSMOS_ENDPOINT=$COSMOS_ENDPOINT --build-arg COSMOS_KEY=$COSMOS_KEY --build-arg DATABASE_ID=$DATABASE_ID --build-arg PARTITION_KEY=$PARTITION_KEY --build-arg USERS_ID=$USERS_ID --build-arg POSTS_ID=$POSTS_ID -t $ACR_NAME.azurecr.io/testapi:latest .
# To debug with VS Code, must forward port 9229 - https://www.section.io/engineering-education/how-to-debug-a-nodejs-application-running-in-a-docker-container/
docker run -d -p 8080:8080 -p 9229:9229 --name testapi --hostname testapi $ACR_NAME.azurecr.io/testapi:latest
http://192.168.10.211:8080/api-docs
docker stop testapi
docker start testapi
