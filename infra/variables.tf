variable "budget_email" {
  description = "Email address that receives budget alerts."
  type        = string
}

variable "monthly_budget_usd" {
  description = "Monthly cost limit for the alarm, in USD."
  type        = number
  default     = 5
}