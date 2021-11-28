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

variable "tags" {
  description = "tags"
  type = object({
    Name        = string
    Environment = string
  })
}
