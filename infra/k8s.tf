locals {
  ssh_key_data = file(var.ssh_public_key)
}

resource "azurerm_kubernetes_cluster" "main" {
  name                = var.k8s.cluster_name
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  kubernetes_version  = var.k8s.version
  dns_prefix          = var.k8s.dns_prefix
  linux_profile {
    admin_username = "ubuntu"
    ssh_key {
      key_data = local.ssh_key_data
    }
  }
  default_node_pool {
    name       = var.k8s.node_pool.name
    node_count = var.k8s.node_pool.node_count
    vm_size    = var.k8s.node_pool.vm_size
  }
  service_principal {
    client_id     = var.client_id
    client_secret = var.client_secret
  }
  addon_profile {
    oms_agent {
      enabled                    = true
      log_analytics_workspace_id = azurerm_log_analytics_workspace.main.id
    }
  }
  network_profile {
    load_balancer_sku = "Standard"
    network_plugin    = "kubenet"
  }
  tags = local.tags
}
