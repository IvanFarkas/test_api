# Terraform Environment Variables - https://www.terraform.io/docs/commands/environment-variables.html
# export TF_VAR_client_id=$CLIENT_ID
# export TF_VAR_client_secret=$CLIENT_ID

# To be provided as TF_VAR_client_secret ENV variable
# client_id     = ""
# client_secret = ""

#TODO: location = "eastus2" - # Fix Error: Code="ServiceUnavailable" Message="Database account creation failed. Operation Id: 425df4be-0fa7-4595-baeb-ad0b85a5c909, Error : Sorry, we are currently experiencing high demand in this region, and cannot fulfill your request at this time. We work continuously to bring more and more capacity online, and encourage you to try again shortly.
location = "eastus"
rg_name  = "testapi2"

cosmos_db = {
  account_name    = "test-api-6296"
  db_name         = "testdb"
  container_names = ["posts", "users"]
}

tags = {
  Name        = "Test API"
  Environment = "Development"
}
