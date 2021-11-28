# Terraform Environment Variables - https://www.terraform.io/docs/commands/environment-variables.html
# export TF_VAR_client_id=$CLIENT_ID
# export TF_VAR_client_secret=$CLIENT_ID

variable "client_id" {
  description = "client id"
  type        = string
}

variable "client_secret" {
  description = "client secret"
  type        = string
}

variable "ssh_public_key" {
  description = "SSH public key"
  type        = string
}

variable "location" {
  description = "location"
  type        = string
}

variable "rg_name" {
  description = "rg name"
  type        = string
}

# Cosmos Db
variable "cosmos_db" {
  description = "Cosmos Db"
  type = object({
    account_name    = string
    db_name         = string
    container_names = list(string)
  })
}

# ACR - Container Rigistry
variable "acr" {
  description = "ACR - Container Rigistry"
  type = object({
    name          = string
    sku           = string
    admin_enabled = bool
  })
}

# k8s
# Run Kubernetes in Azure the Cheap Way - https://trstringer.com/cheap-kubernetes-in-azure
variable "k8s" {
  description = "k8s"
  type = object({
    cluster_name = string
    dns_prefix   = string
    version      = string
    node_pool = object({
      name       = string
      node_count = number
      vm_size    = string
    })
  })
}

# log analytics
variable "log_analytics_workspace" {
  description = "log analytics workspace"
  type = object({
    name              = string
    location          = string // refer https://azure.microsoft.com/global-infrastructure/services/?products=monitor for log analytics available regions
    sku               = string // refer https://azure.microsoft.com/pricing/details/monitor/ for log analytics pricing 
    retention_in_days = number
  })
}

# API Management (APIM)
variable "apim" {
  description = "API Management (APIM)"
  type = object({
    name = string
    sku  = string
    publisher = object({
      name  = string
      email = string
    })
  })
}

variable "tags" {
  description = "tags"
  type = object({
    Name        = string
    Environment = string
  })
}
