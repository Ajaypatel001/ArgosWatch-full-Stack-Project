# ========== ALB OUTPUTS ==========
output "frontend_alb_dns" {
  description = "Frontend ALB DNS name"
  value       = aws_lb.frontend_alb.dns_name
}

output "backend_alb_dns" {
  description = "Backend ALB DNS name"
  value       = aws_lb.backend_alb.dns_name
}

# ========== AUTO SCALING OUTPUTS ==========
output "frontend_asg" {
  description = "Frontend Auto Scaling Group name"
  value       = aws_autoscaling_group.frontend_asg.name
}

output "backend_asg" {
  description = "Backend Auto Scaling Group name"
  value       = aws_autoscaling_group.backend_asg.name
}

# ========== RDS OUTPUTS ==========
output "rds_endpoint" {
  description = "RDS instance endpoint"
  value       = aws_db_instance.agrowatch.endpoint
}

output "rds_address" {
  description = "RDS instance address"
  value       = aws_db_instance.agrowatch.address
}

# ========== VPC OUTPUTS ==========
output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.agrowatch.id
}

output "public_subnet_ids" {
  description = "Public subnet IDs"
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "Private subnet IDs"
  value       = aws_subnet.private[*].id
}

# ========== SECURITY GROUP OUTPUTS ==========
output "bastion_sg_id" {
  description = "Bastion Security Group ID"
  value       = aws_security_group.bastion.id
}

output "alb_sg_id" {
  description = "ALB Security Group ID"
  value       = aws_security_group.alb.id
}

# ========== IAM OUTPUTS ==========
output "ec2_iam_role" {
  description = "EC2 IAM Role name"
  value       = aws_iam_role.ec2_role.name
}

# ========== ROUTE53 OUTPUTS ==========
output "frontend_domain" {
  description = "Frontend domain name"
  value       = var.frontend_domain_name
}

# ========== CLOUDWATCH OUTPUTS ==========
output "cloudwatch_dashboard" {
  description = "CloudWatch dashboard name"
  value       = aws_cloudwatch_dashboard.agrowatch.dashboard_name
}

output "sns_alert_topic" {
  description = "SNS Topic ARN for alerts"
  value       = aws_sns_topic.alerts.arn
}