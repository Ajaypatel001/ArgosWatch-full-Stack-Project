# ========== SSL CERTIFICATE ==========

# Request SSL Certificate
resource "aws_acm_certificate" "frontend_cert" {
  domain_name       = var.frontend_domain_name
  validation_method = "DNS"

  subject_alternative_names = [
    "www.${var.frontend_domain_name}"
  ]

  tags = merge(var.tags, {
    Name = "agrowatch-frontend-cert"
  })

  lifecycle {
    create_before_destroy = true
  }
}

# ========== OUTPUTS ==========
output "acm_certificate_arn" {
  description = "ACM Certificate ARN"
  value       = aws_acm_certificate.frontend_cert.arn
}