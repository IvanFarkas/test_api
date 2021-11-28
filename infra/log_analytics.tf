locals {
  la_ws_name = "${var.log_analytics_workspace.name}-${random_string.main.result}"
}

resource "azurerm_log_analytics_workspace" "main" {
  # The WorkSpace name has to be unique across the whole of azure, not just the current subscription/tenant.
  name                = local.la_ws_name
  location            = var.log_analytics_workspace.location
  resource_group_name = azurerm_resource_group.main.name
  sku                 = var.log_analytics_workspace.sku
  retention_in_days   = var.log_analytics_workspace.retention_in_days
  tags                = local.tags
}

resource "azurerm_log_analytics_solution" "main" {
  solution_name         = "ContainerInsights"
  location              = azurerm_log_analytics_workspace.main.location
  resource_group_name   = azurerm_resource_group.main.name
  workspace_resource_id = azurerm_log_analytics_workspace.main.id
  workspace_name        = azurerm_log_analytics_workspace.main.name
  plan {
    publisher = "Microsoft"
    product   = "OMSGallery/ContainerInsights"
  }
  tags = local.tags
}
