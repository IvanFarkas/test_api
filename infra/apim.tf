resource "azurerm_api_management" "main" {
  name                = var.apim.name
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  sku_name            = var.apim.sku
  publisher_name      = var.apim.publisher.name
  publisher_email     = var.apim.publisher.email
  tags                = local.tags
}
