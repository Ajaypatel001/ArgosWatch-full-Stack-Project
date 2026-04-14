# ========== CLOUDWATCH DASHBOARD ==========
resource "aws_cloudwatch_dashboard" "agrowatch" {
  dashboard_name = "agrowatch-${var.environment}"

  dashboard_body = jsonencode({
    widgets = [
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/ApplicationELB", "RequestCount", { "stat" = "Sum", "label" = "Frontend ALB Requests" }],
            ["AWS/ApplicationELB", "TargetResponseTime", { "stat" = "Average", "label" = "Response Time" }],
            ["AWS/ApplicationELB", "HTTPCode_Target_2XX_Count", { "stat" = "Sum", "label" = "2XX Responses" }],
            ["AWS/ApplicationELB", "HTTPCode_Target_5XX_Count", { "stat" = "Sum", "label" = "5XX Errors" }]
          ]
          period = 300
          stat   = "Average"
          region = var.aws_region
          title  = "ALB Metrics"
          width  = 24
          height = 6
        }
      },
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/AutoScaling", "GroupTotalInstances", { "stat" = "Average", "label" = "Total Instances" }],
            ["AWS/AutoScaling", "GroupDesiredCapacity", { "stat" = "Average", "label" = "Desired Capacity" }],
            ["AWS/AutoScaling", "GroupInServiceInstances", { "stat" = "Average", "label" = "In Service" }]
          ]
          period = 300
          stat   = "Average"
          region = var.aws_region
          title  = "Auto Scaling Metrics"
          width  = 12
          height = 6
        }
      },
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/EC2", "CPUUtilization", { "stat" = "Average", "label" = "Frontend CPU" }],
            ["AWS/EC2", "CPUUtilization", { "stat" = "Average", "label" = "Backend CPU" }]
          ]
          period = 300
          stat   = "Average"
          region = var.aws_region
          title  = "EC2 CPU Utilization"
          width  = 12
          height = 6
        }
      }
    ]
  })
}

# ========== SNS TOPIC FOR ALERTS ==========
resource "aws_sns_topic" "alerts" {
  name = "agro-alerts-${var.environment}"

  tags = merge(var.tags, {
    Name = "agrowatch-alerts"
  })
}

# SNS Topic Subscription (Email)
resource "aws_sns_topic_subscription" "alerts_email" {
  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "email"
  endpoint  = var.alert_email
}

# ========== CLOUDWATCH ALARMS ==========

# Frontend High CPU Alarm
resource "aws_cloudwatch_metric_alarm" "frontend_high_cpu" {
  alarm_name          = "agro-fe-high-cpu-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = 300
  statistic           = "Average"
  threshold           = 70
  alarm_description   = "Frontend CPU utilization is above 70%"
  alarm_actions       = [aws_autoscaling_policy.frontend_scale_up.arn, aws_sns_topic.alerts.arn]

  dimensions = {
    AutoScalingGroupName = aws_autoscaling_group.frontend_asg.name
  }

  tags = merge(var.tags, {
    Name = "agrowatch-frontend-high-cpu"
  })
}

# Frontend Low CPU Alarm
resource "aws_cloudwatch_metric_alarm" "frontend_low_cpu" {
  alarm_name          = "agro-fe-low-cpu-${var.environment}"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 5
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = 300
  statistic           = "Average"
  threshold           = 30
  alarm_description   = "Frontend CPU utilization is below 30%"
  alarm_actions       = [aws_autoscaling_policy.frontend_scale_down.arn]

  dimensions = {
    AutoScalingGroupName = aws_autoscaling_group.frontend_asg.name
  }

  tags = merge(var.tags, {
    Name = "agrowatch-frontend-low-cpu"
  })
}

# Backend High CPU Alarm
resource "aws_cloudwatch_metric_alarm" "backend_high_cpu" {
  alarm_name          = "agro-be-high-cpu-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = 300
  statistic           = "Average"
  threshold           = 70
  alarm_description   = "Backend CPU utilization is above 70%"
  alarm_actions       = [aws_autoscaling_policy.backend_scale_up.arn, aws_sns_topic.alerts.arn]

  dimensions = {
    AutoScalingGroupName = aws_autoscaling_group.backend_asg.name
  }

  tags = merge(var.tags, {
    Name = "agrowatch-backend-high-cpu"
  })
}

# Backend Low CPU Alarm
resource "aws_cloudwatch_metric_alarm" "backend_low_cpu" {
  alarm_name          = "agro-be-low-cpu-${var.environment}"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 5
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = 300
  statistic           = "Average"
  threshold           = 30
  alarm_description   = "Backend CPU utilization is below 30%"
  alarm_actions       = [aws_autoscaling_policy.backend_scale_down.arn]

  dimensions = {
    AutoScalingGroupName = aws_autoscaling_group.backend_asg.name
  }

  tags = merge(var.tags, {
    Name = "agrowatch-backend-low-cpu"
  })
}

# ALB 5XX Error Alarm
resource "aws_cloudwatch_metric_alarm" "alb_5xx_errors" {
  alarm_name          = "agro-alb-5xx-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "HTTPCode_ELB_5XX_Count"
  namespace           = "AWS/ApplicationELB"
  period              = 300
  statistic           = "Sum"
  threshold           = 10
  alarm_description   = "ALB has 5XX errors"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    LoadBalancer = aws_lb.frontend_alb.arn_suffix
  }

  tags = merge(var.tags, {
    Name = "agrowatch-alb-5xx-errors"
  })
}

# ========== OUTPUTS ==========
output "cloudwatch_dashboard_name" {
  description = "CloudWatch dashboard name"
  value       = aws_cloudwatch_dashboard.agrowatch.dashboard_name
}

output "sns_topic_arn" {
  description = "SNS Topic ARN for alerts"
  value       = aws_sns_topic.alerts.arn
}