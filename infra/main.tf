terraform {
  required_version = ">= 1.0.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }

    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.23"
    }

    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.11"
    }

    null = {
      source  = "hashicorp/null"
      version = "~> 3.2"
    }

    random = {
      source  = "hashicorp/random"
      version = "~> 3.5"
    }

    tls = {
      source  = "hashicorp/tls"
      version = "~> 4.0"
    }
  }
}

resource "null_resource" "minikube_cluster" {
  count = var.use_local_cluster ? 1 : 0

  provisioner "local-exec" {
    command = <<-EOT
      if minikube status -p ${var.minikube_profile_name} 2>/dev/null | grep -q "Running"; then
        echo "Minikube cluster '${var.minikube_profile_name}' is already running."
      else
        echo "Creating Minikube cluster '${var.minikube_profile_name}'..."
        minikube start \
          --profile=${var.minikube_profile_name} \
          --driver=${var.minikube_driver} \
          --cpus=${var.minikube_cpus} \
          --memory=${var.minikube_memory} \
          --kubernetes-version=v${var.kubernetes_version}.0 \
          --addons=metrics-server \
          --addons=ingress
        
        echo "Minikube cluster '${var.minikube_profile_name}' created successfully!"
      fi
    EOT
  }

  provisioner "local-exec" {
    when    = destroy
    command = <<-EOT
      echo "Deleting Minikube cluster '${self.triggers.profile_name}'..."
      minikube delete --profile=${self.triggers.profile_name} || true
    EOT
  }

  triggers = {
    profile_name = var.minikube_profile_name
  }
}

provider "kubernetes" {
  config_path    = var.use_local_cluster ? "~/.kube/config" : null
  config_context = var.use_local_cluster ? var.minikube_profile_name : null
}

provider "helm" {
  kubernetes {
    config_path    = var.use_local_cluster ? "~/.kube/config" : null
    config_context = var.use_local_cluster ? var.minikube_profile_name : null
  }
}

resource "kubernetes_namespace" "app" {
  count = var.use_local_cluster ? 1 : 0
  
  depends_on = [null_resource.minikube_cluster]

  metadata {
    name = var.project_name
    
    labels = {
      name        = var.project_name
      environment = var.environment
      managed-by  = "terraform"
    }
  }
}

resource "kubernetes_config_map" "app" {
  count = var.use_local_cluster ? 1 : 0
  
  depends_on = [kubernetes_namespace.app]

  metadata {
    name      = "${var.project_name}-config"
    namespace = kubernetes_namespace.app[0].metadata[0].name
    
    labels = {
      app         = var.project_name
      tier        = "backend"
      environment = var.environment
    }
  }

  data = {
    SERVER_HOST        = "http://0.0.0.0"
    SERVER_PORT        = tostring(var.app_port)
    NODE_ENV           = var.environment
    DB_HOST            = "postgres-service"
    DB_PORT            = "5432"
    DB_NAME            = var.db_name
    PASSWORD_HASH_SALT = tostring(var.password_hash_salt)
    MAILING_ENABLED    = "true"
    SMTP_HOST          = "sandbox.smtp.mailtrap.io"
    SMTP_PORT          = "587"
  }
}

resource "random_password" "db_password" {
  count   = var.use_local_cluster ? 1 : 0
  length  = 16
  special = false
}

resource "kubernetes_secret" "app" {
  count = var.use_local_cluster ? 1 : 0
  
  depends_on = [kubernetes_namespace.app]

  metadata {
    name      = "${var.project_name}-secret"
    namespace = kubernetes_namespace.app[0].metadata[0].name
    
    labels = {
      app         = var.project_name
      tier        = "backend"
      environment = var.environment
    }
  }

  data = {
    DB_USER                  = var.db_username
    DB_PASSWORD              = random_password.db_password[0].result
    JWT_ACCESS_TOKEN_SECRET  = var.jwt_access_token_secret
    JWT_REFRESH_TOKEN_SECRET = var.jwt_refresh_token_secret
    SMTP_USERNAME            = ""
    SMTP_PASSWORD            = ""
  }

  type = "Opaque"
}

resource "kubernetes_secret" "postgres" {
  count = var.use_local_cluster ? 1 : 0
  
  depends_on = [kubernetes_namespace.app]

  metadata {
    name      = "postgres-secret"
    namespace = kubernetes_namespace.app[0].metadata[0].name
    
    labels = {
      app         = "postgres"
      tier        = "database"
      environment = var.environment
    }
  }

  data = {
    POSTGRES_USER     = var.db_username
    POSTGRES_PASSWORD = random_password.db_password[0].result
    POSTGRES_DB       = var.db_name
  }

  type = "Opaque"
}

resource "kubernetes_persistent_volume_claim" "postgres" {
  count = var.use_local_cluster ? 1 : 0
  
  depends_on = [kubernetes_namespace.app]

  metadata {
    name      = "postgres-pvc"
    namespace = kubernetes_namespace.app[0].metadata[0].name
    
    labels = {
      app         = "postgres"
      tier        = "database"
      environment = var.environment
    }
  }

  spec {
    access_modes = ["ReadWriteOnce"]
    
    resources {
      requests = {
        storage = "5Gi"
      }
    }
  }
}

resource "kubernetes_deployment" "postgres" {
  count = var.use_local_cluster ? 1 : 0
  
  depends_on = [
    kubernetes_secret.postgres,
    kubernetes_persistent_volume_claim.postgres
  ]

  metadata {
    name      = "postgres"
    namespace = kubernetes_namespace.app[0].metadata[0].name
    
    labels = {
      app         = "postgres"
      tier        = "database"
      environment = var.environment
    }
  }

  spec {
    replicas = 1

    selector {
      match_labels = {
        app  = "postgres"
        tier = "database"
      }
    }

    template {
      metadata {
        labels = {
          app         = "postgres"
          tier        = "database"
          environment = var.environment
        }
      }

      spec {
        container {
          name  = "postgres"
          image = "postgres:16-alpine"

          port {
            container_port = 5432
            protocol       = "TCP"
          }

          env_from {
            secret_ref {
              name = kubernetes_secret.postgres[0].metadata[0].name
            }
          }

          resources {
            requests = {
              cpu    = "100m"
              memory = "256Mi"
            }
            limits = {
              cpu    = "500m"
              memory = "512Mi"
            }
          }

          volume_mount {
            name       = "postgres-data"
            mount_path = "/var/lib/postgresql/data"
          }

          liveness_probe {
            exec {
              command = ["pg_isready", "-U", "postgres"]
            }
            initial_delay_seconds = 30
            period_seconds        = 10
            timeout_seconds       = 5
            failure_threshold     = 3
          }

          readiness_probe {
            exec {
              command = ["pg_isready", "-U", "postgres"]
            }
            initial_delay_seconds = 5
            period_seconds        = 5
            timeout_seconds       = 3
            failure_threshold     = 3
          }
        }

        volume {
          name = "postgres-data"
          persistent_volume_claim {
            claim_name = kubernetes_persistent_volume_claim.postgres[0].metadata[0].name
          }
        }
      }
    }
  }
}

resource "kubernetes_service" "postgres" {
  count = var.use_local_cluster ? 1 : 0
  
  depends_on = [kubernetes_deployment.postgres]

  metadata {
    name      = "postgres-service"
    namespace = kubernetes_namespace.app[0].metadata[0].name
    
    labels = {
      app         = "postgres"
      tier        = "database"
      environment = var.environment
    }
  }

  spec {
    selector = {
      app  = "postgres"
      tier = "database"
    }

    port {
      name        = "postgres"
      port        = 5432
      target_port = 5432
      protocol    = "TCP"
    }

    type = "ClusterIP"
  }
}

resource "kubernetes_deployment" "app" {
  count = var.use_local_cluster ? 1 : 0
  
  depends_on = [
    kubernetes_config_map.app,
    kubernetes_secret.app,
    kubernetes_service.postgres
  ]

  metadata {
    name      = var.project_name
    namespace = kubernetes_namespace.app[0].metadata[0].name
    
    labels = {
      app         = var.project_name
      tier        = "backend"
      environment = var.environment
    }
  }

  spec {
    replicas = var.app_replicas

    selector {
      match_labels = {
        app  = var.project_name
        tier = "backend"
      }
    }

    template {
      metadata {
        labels = {
          app         = var.project_name
          tier        = "backend"
          environment = var.environment
        }
      }

      spec {
        container {
          name              = var.project_name
          image             = var.app_image
          image_pull_policy = var.use_local_cluster ? "Never" : "Always"

          port {
            container_port = var.app_port
            protocol       = "TCP"
            name           = "http"
          }

          env_from {
            config_map_ref {
              name = kubernetes_config_map.app[0].metadata[0].name
            }
          }

          env {
            name = "DB_USER"
            value_from {
              secret_key_ref {
                name = kubernetes_secret.app[0].metadata[0].name
                key  = "DB_USER"
              }
            }
          }

          env {
            name = "DB_PASSWORD"
            value_from {
              secret_key_ref {
                name = kubernetes_secret.app[0].metadata[0].name
                key  = "DB_PASSWORD"
              }
            }
          }

          env {
            name  = "DATABASE_URL"
            value = "postgresql://$(DB_USER):$(DB_PASSWORD)@postgres-service:5432/${var.db_name}?schema=public"
          }

          env {
            name = "JWT_ACCESS_TOKEN_SECRET"
            value_from {
              secret_key_ref {
                name = kubernetes_secret.app[0].metadata[0].name
                key  = "JWT_ACCESS_TOKEN_SECRET"
              }
            }
          }

          env {
            name = "JWT_REFRESH_TOKEN_SECRET"
            value_from {
              secret_key_ref {
                name = kubernetes_secret.app[0].metadata[0].name
                key  = "JWT_REFRESH_TOKEN_SECRET"
              }
            }
          }

          resources {
            requests = {
              cpu    = "100m"
              memory = "256Mi"
            }
            limits = {
              cpu    = "500m"
              memory = "512Mi"
            }
          }

          liveness_probe {
            http_get {
              path = "/health"
              port = var.app_port
            }
            initial_delay_seconds = 30
            period_seconds        = 10
            timeout_seconds       = 5
            failure_threshold     = 3
          }

          readiness_probe {
            http_get {
              path = "/health"
              port = var.app_port
            }
            initial_delay_seconds = 10
            period_seconds        = 5
            timeout_seconds       = 3
            failure_threshold     = 3
          }
        }

        termination_grace_period_seconds = 30
      }
    }
  }
}

resource "kubernetes_service" "app" {
  count = var.use_local_cluster ? 1 : 0
  
  depends_on = [kubernetes_deployment.app]

  metadata {
    name      = "${var.project_name}-service"
    namespace = kubernetes_namespace.app[0].metadata[0].name
    
    labels = {
      app         = var.project_name
      tier        = "backend"
      environment = var.environment
    }
  }

  spec {
    selector = {
      app  = var.project_name
      tier = "backend"
    }

    port {
      name        = "http"
      port        = 80
      target_port = var.app_port
      protocol    = "TCP"
    }

    type = "ClusterIP"
  }
}

resource "kubernetes_service" "app_nodeport" {
  count = var.use_local_cluster ? 1 : 0
  
  depends_on = [kubernetes_deployment.app]

  metadata {
    name      = "${var.project_name}-nodeport"
    namespace = kubernetes_namespace.app[0].metadata[0].name
    
    labels = {
      app         = var.project_name
      tier        = "backend"
      environment = var.environment
    }
  }

  spec {
    selector = {
      app  = var.project_name
      tier = "backend"
    }

    port {
      name        = "http"
      port        = 80
      target_port = var.app_port
      node_port   = 30080
      protocol    = "TCP"
    }

    type = "NodePort"
  }
}

resource "kubernetes_horizontal_pod_autoscaler_v2" "app" {
  count = var.use_local_cluster ? 1 : 0
  
  depends_on = [kubernetes_deployment.app]

  metadata {
    name      = "${var.project_name}-hpa"
    namespace = kubernetes_namespace.app[0].metadata[0].name
    
    labels = {
      app         = var.project_name
      tier        = "backend"
      environment = var.environment
    }
  }

  spec {
    scale_target_ref {
      api_version = "apps/v1"
      kind        = "Deployment"
      name        = kubernetes_deployment.app[0].metadata[0].name
    }

    min_replicas = 2
    max_replicas = 10

    metric {
      type = "Resource"
      resource {
        name = "cpu"
        target {
          type                = "Utilization"
          average_utilization = 70
        }
      }
    }

    metric {
      type = "Resource"
      resource {
        name = "memory"
        target {
          type                = "Utilization"
          average_utilization = 80
        }
      }
    }

    behavior {
      scale_up {
        stabilization_window_seconds = 60
        select_policy                = "Max"
        policy {
          type          = "Pods"
          value         = 2
          period_seconds = 60
        }
        policy {
          type          = "Percent"
          value         = 100
          period_seconds = 60
        }
      }
      scale_down {
        stabilization_window_seconds = 300
        select_policy                = "Min"
        policy {
          type          = "Pods"
          value         = 1
          period_seconds = 120
        }
      }
    }
  }
}
