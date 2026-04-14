resource "aws_vpc" "agrowatch" {
  cidr_block           = var.vpc_cidr
  instance_tenancy     = "default"
  enable_dns_support   = true
  enable_dns_hostnames = true

   tags = merge(var.tags, {
    Name        = "agrowatch-vpc-${var.environment}"
    Environment = var.environment
    Project     = "AgroWatch"
    ManagedBy   = "Terraform"
  })
}