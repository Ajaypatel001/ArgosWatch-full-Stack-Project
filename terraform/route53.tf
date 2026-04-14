# ========== DATA SOURCE FOR EXISTING HOSTED ZONE ==========
# NOTE: You must have already created a hosted zone in Route53 for your domain
# If not, you'll need to create one manually in AWS Console first

data "aws_route53_zone" "frontend_zone" {
  name         = var.frontend_domain_name
  private_zone = false
}

# ========== DNS RECORDS ==========

# A Record for Frontend Domain
resource "aws_route53_record" "frontend_a" {
  zone_id = data.aws_route53_zone.frontend_zone.zone_id
  name    = var.frontend_domain_name
  type    = "A"

  alias {
    name                   = aws_lb.frontend_alb.dns_name
    zone_id                = aws_lb.frontend_alb.zone_id
    evaluate_target_health = true
  }
}

# A Record for www subdomain
resource "aws_route53_record" "frontend_www" {
  zone_id = data.aws_route53_zone.frontend_zone.zone_id
  name    = "www.${var.frontend_domain_name}"
  type    = "A"

  alias {
    name                   = aws_lb.frontend_alb.dns_name
    zone_id                = aws_lb.frontend_alb.zone_id
    evaluate_target_health = true
  }
}

# DNS Validation Records for ACM Certificate
resource "aws_route53_record" "cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.frontend_cert.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = data.aws_route53_zone.frontend_zone.zone_id
}

# Certificate Validation
resource "aws_acm_certificate_validation" "frontend_cert" {
  certificate_arn         = aws_acm_certificate.frontend_cert.arn
  validation_record_fqdns = [for record in aws_route53_record.cert_validation : record.fqdn]
}

