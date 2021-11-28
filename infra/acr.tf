resource "azurerm_container_registry" "main" {
  name                = var.acr.name
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  sku                 = var.acr.sku
  admin_enabled       = var.acr.admin_enabled
  tags                = local.tags
}
