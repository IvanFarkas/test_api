# For creating Terraform backend see ../infra/notes.sh
terraform init -backend-config="storage_account_name=$TF_STATE_SA_NAME" -backend-config="container_name=$TF_STATE_CONTAINER" -backend-config="access_key=$TF_STATE_SA_KEY" -backend-config="key=$COSMOSDB_TF_STATE_KEY"
terraform plan
terraform apply -auto-approve
