resource "aws_internet_gateway" "agrowatch" {
  vpc_id = aws_vpc.agrowatch.id

  tags = merge(var.tags, {
    Name        = "agrowatch-igw-${var.environment}"
    Environment = var.environment
    Project     = "AgroWatch"
  })
}