# Covers the whole AWS account, not just this site.
resource "aws_budgets_budget" "monthly" {
  name         = "portfolio-monthly-cost"
  budget_type  = "COST"
  limit_amount = format("%.1f", var.monthly_budget_usd)
  limit_unit   = "USD"
  time_unit    = "MONTHLY"

  notification { # actual spend passed 80% of the limit
    comparison_operator        = "GREATER_THAN"
    threshold                  = 80
    threshold_type             = "PERCENTAGE"
    notification_type          = "ACTUAL"
    subscriber_email_addresses = [var.budget_email]
  }

  notification { # AWS forecasts you'll pass the limit this month
    comparison_operator        = "GREATER_THAN"
    threshold                  = 100
    threshold_type             = "PERCENTAGE"
    notification_type          = "FORECASTED"
    subscriber_email_addresses = [var.budget_email]
  }
}