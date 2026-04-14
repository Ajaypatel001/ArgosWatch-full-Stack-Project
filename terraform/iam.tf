resource "aws_iam_role" "ec2_role" {
  name = "${var.iam_role_name}-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })

  tags = merge(var.tags, {
    Name = "agrowatch-ec2-role"
  })
}

# ========== IAM POLICY FOR CLOUDWATCH ==========
resource "aws_iam_policy" "cloudwatch_agent" {
  name        = "agro-cloudwatch-agent-policy-${var.environment}"
  description = "Allow EC2 to send metrics to CloudWatch"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "cloudwatch:PutMetricData",
          "cloudwatch:GetMetricStatistics",
          "cloudwatch:ListMetrics",
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:DescribeLogStreams"
        ]
        Resource = "*"
      }
    ]
  })
}

# ========== IAM POLICY FOR SSM (Systems Manager) ==========
resource "aws_iam_policy" "ssm_agent" {
  name        = "agro-ssm-agent-policy-${var.environment}"
  description = "Allow EC2 to use Systems Manager"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ssm:DescribeAssociation",
          "ssm:GetDeployablePatchSnapshotForInstance",
          "ssm:GetDocument",
          "ssm:DescribeDocument",
          "ssm:GetManifest",
          "ssm:GetParameter",
          "ssm:GetParameters",
          "ssm:ListAssociations",
          "ssm:ListInstanceAssociations",
          "ssm:PutInventory",
          "ssm:PutComplianceItems",
          "ssm:PutConfigurePackageResult",
          "ssm:UpdateAssociationStatus",
          "ssm:UpdateInstanceAssociationStatus",
          "ssm:UpdateInstanceInformation"
        ]
        Resource = "*"
      }
    ]
  })
}

# ========== ATTACH POLICIES TO ROLE ==========
resource "aws_iam_role_policy_attachment" "cloudwatch_agent" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = aws_iam_policy.cloudwatch_agent.arn
}

resource "aws_iam_role_policy_attachment" "ssm_agent" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = aws_iam_policy.ssm_agent.arn
}

# Attach AWS managed policies
resource "aws_iam_role_policy_attachment" "ssm_core" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_role_policy_attachment" "cloudwatch_agent_server" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy"
}

# ========== IAM INSTANCE PROFILE ==========
resource "aws_iam_instance_profile" "ec2_profile" {
  name = "agro-ec2-profile-${var.environment}"
  role = aws_iam_role.ec2_role.name

  tags = merge(var.tags, {
    Name = "agro-ec2-profile"
  })
}

