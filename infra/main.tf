locals {
  tags = merge(
    var.tags
  )
}

resource "azurerm_resource_group" "main" {
  name     = var.rg_name
  location = var.location
  tags     = local.tags
}

resource "random_string" "main" {
  length  = 4
  upper   = false
  number  = true
  lower   = false
  special = false
}
