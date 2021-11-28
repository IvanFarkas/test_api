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
