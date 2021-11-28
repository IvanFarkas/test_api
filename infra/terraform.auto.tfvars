# Terraform Environment Variables - https://www.terraform.io/docs/commands/environment-variables.html
# export TF_VAR_client_id=$CLIENT_ID
# export TF_VAR_client_secret=$CLIENT_ID

# To be provided as TF_VAR_client_secret ENV variable
# client_id     = ""
# client_secret = ""

ssh_public_key = "~/.ssh/id_rsa.pub"
location       = "eastus2"
rg_name        = "testapi"

cosmos_db = {
  account_name   = "test-api"
  db_name        = "testdb"
  container_names = ["posts", "users"]
}

acr = {
  name          = "hdsoftacr"
  sku           = "Basic"
  admin_enabled = true
}

k8s = {
  cluster_name = "testapi-k8s"
  dns_prefix   = "testapi"
  version      = "1.22.2"
  node_pool = {
    name       = "agentpool"
    node_count = 1
    vm_size    = "standard_d2_v5"
  }
}

log_analytics_workspace = {
  name              = "test-api-la-ws"
  location          = "eastus2"   // refer https://azure.microsoft.com/global-infrastructure/services/?products=monitor for log analytics available regions
  sku               = "PerGB2018" // refer https://azure.microsoft.com/pricing/details/monitor/ for log analytics pricing 
  retention_in_days = 30

  # Free does not work
  #   Error: operationalinsights.WorkspacesClient#CreateOrUpdate:
  #   Failure sending request: StatusCode=400 -- 
  #   Original Error: Code="BadRequest" Message="Pricing tier doesn't match the subscription's billing model.
  #   Read http://aka.ms/PricingTierWarning for more details." Target="PricingTier"
  # sku               = "Free"
  # retention_in_days = 7
}

apim = {
  name = "hdsofttestapim"
  sku  = "Developer_1"
  publisher = {
    name  = "Test API Co"
    email = "TestAPIk8s@outlook.com"
  }
}

tags = {
  Name        = "Test API"
  Environment = "Development"
}
