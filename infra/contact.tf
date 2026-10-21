# Contact form backend: CloudFront /api/* → API Gateway (HTTP API) → Lambda → Amazon SES → my inbox.
# Same origin as the site, so no CORS and no CSP change. Cost at portfolio volume: ~$0
# (Lambda and API Gateway free tier; SES $0.10 per 1,000 emails).

variable "contact_to" {
  description = "Inbox that receives contact-form messages (verified in SES; you click a link once)."
  type        = string
  default     = "chaabi.nourelhouda@esprit.tn"
}

locals {
  contact_from = "contact@${var.domain_name}"
}

# ── SES: send as contact@chaabinourelhouda.com (DKIM-signed through Route 53) ──
resource "aws_sesv2_email_identity" "domain" {
  email_identity = var.domain_name
}

resource "aws_route53_record" "ses_dkim" {
  count   = 3 # SES Easy DKIM always returns three tokens
  zone_id = data.aws_route53_zone.site.zone_id
  name    = "${aws_sesv2_email_identity.domain.dkim_signing_attributes[0].tokens[count.index]}._domainkey.${var.domain_name}"
  type    = "CNAME"
  ttl     = 1800
  records = ["${aws_sesv2_email_identity.domain.dkim_signing_attributes[0].tokens[count.index]}.dkim.amazonses.com"]
}

# While SES is in its sandbox it only delivers to verified addresses: verifying my own inbox is enough.
resource "aws_sesv2_email_identity" "inbox" {
  email_identity = var.contact_to
}

# ── Lambda ──
data "archive_file" "contact" {
  type        = "zip"
  source_file = "${path.module}/lambda/contact/index.mjs"
  output_path = "${path.module}/.build/contact.zip"
}

resource "aws_iam_role" "contact" {
  name = "portfolio-contact-lambda"
  assume_role_policy = jsonencode({
    Version   = "2012-10-17"
    Statement = [{ Effect = "Allow", Principal = { Service = "lambda.amazonaws.com" }, Action = "sts:AssumeRole" }]
  })
}

# Least privilege: write its own logs, send email only as the two verified identities.
resource "aws_iam_role_policy" "contact" {
  name = "send-contact-email"
  role = aws_iam_role.contact.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      { Effect = "Allow", Action = ["logs:CreateLogStream", "logs:PutLogEvents"], Resource = "${aws_cloudwatch_log_group.contact.arn}:*" },
      { Effect = "Allow", Action = "ses:SendEmail", Resource = [aws_sesv2_email_identity.domain.arn, aws_sesv2_email_identity.inbox.arn] },
    ]
  })
}

resource "aws_cloudwatch_log_group" "contact" {
  name              = "/aws/lambda/portfolio-contact"
  retention_in_days = 14
}

resource "aws_lambda_function" "contact" {
  function_name    = "portfolio-contact"
  role             = aws_iam_role.contact.arn
  runtime          = "nodejs22.x"
  handler          = "index.handler"
  architectures    = ["arm64"]
  filename         = data.archive_file.contact.output_path
  source_code_hash = data.archive_file.contact.output_base64sha256
  memory_size      = 128
  timeout          = 10

  environment {
    variables = {
      FROM_ADDRESS = "Portfolio contact form <${local.contact_from}>"
      TO_ADDRESS   = var.contact_to
    }
  }

  depends_on = [aws_cloudwatch_log_group.contact]
}

# ── API Gateway HTTP API: one route, throttled so the form can't be used to flood my inbox ──
resource "aws_apigatewayv2_api" "contact" {
  name          = "portfolio-contact"
  protocol_type = "HTTP"
}

resource "aws_apigatewayv2_integration" "contact" {
  api_id                 = aws_apigatewayv2_api.contact.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.contact.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "contact" {
  api_id    = aws_apigatewayv2_api.contact.id
  route_key = "POST /api/contact"
  target    = "integrations/${aws_apigatewayv2_integration.contact.id}"
}

resource "aws_apigatewayv2_stage" "contact" {
  api_id      = aws_apigatewayv2_api.contact.id
  name        = "$default"
  auto_deploy = true

  default_route_settings {
    throttling_rate_limit  = 1 # requests per second, across all visitors
    throttling_burst_limit = 5
  }
}

resource "aws_lambda_permission" "contact" {
  statement_id  = "AllowApiGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.contact.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.contact.execution_arn}/*/*/api/contact"
}

# ── CloudFront pieces used by the /api/* behaviour in cdn.tf ──
data "aws_cloudfront_cache_policy" "disabled" {
  name = "Managed-CachingDisabled"
}

data "aws_cloudfront_origin_request_policy" "all_viewer_except_host" {
  name = "Managed-AllViewerExceptHostHeader"
}
