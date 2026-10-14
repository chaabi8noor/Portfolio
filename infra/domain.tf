variable "domain_name" {
  description = "Domain registered in Route 53 for the site."
  type        = string
  default     = "chaabinourelhouda.com"
}

locals {
  site_names = [var.domain_name, "www.${var.domain_name}"]

  # One A (IPv4) and one AAAA (IPv6) record for each name: 4 records.
  alias_records = {
    for pair in setproduct(local.site_names, ["A", "AAAA"]) :
    "${pair[0]}-${pair[1]}" => { name = pair[0], type = pair[1] }
  }
}

# The hosted zone Route 53 created when you registered the domain.
data "aws_route53_zone" "site" {
  name         = var.domain_name
  private_zone = false
}

# Free public certificate for both names, issued once DNS proves you own the domain.
resource "aws_acm_certificate" "site" {
  provider                  = aws.us_east_1
  domain_name               = var.domain_name
  subject_alternative_names = ["www.${var.domain_name}"]
  validation_method         = "DNS"

  lifecycle {
    create_before_destroy = true # a replacement certificate is ready before the old one goes
  }
}

# ACM asks for specific CNAME records as proof of ownership; create them.
resource "aws_route53_record" "cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.site.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      type   = dvo.resource_record_type
      record = dvo.resource_record_value
    }
  }

  zone_id         = data.aws_route53_zone.site.zone_id
  name            = each.value.name
  type            = each.value.type
  records         = [each.value.record]
  ttl             = 300
  allow_overwrite = true
}

# Waits until ACM has checked those records and issued the certificate.
resource "aws_acm_certificate_validation" "site" {
  provider                = aws.us_east_1
  certificate_arn         = aws_acm_certificate.site.arn
  validation_record_fqdns = [for r in aws_route53_record.cert_validation : r.fqdn]
}

# chaabinourelhouda.com and www.chaabinourelhouda.com → CloudFront.
resource "aws_route53_record" "site" {
  for_each = local.alias_records

  zone_id = data.aws_route53_zone.site.zone_id
  name    = each.value.name
  type    = each.value.type

  alias {
    name                   = aws_cloudfront_distribution.site.domain_name
    zone_id                = aws_cloudfront_distribution.site.hosted_zone_id
    evaluate_target_health = false
  }
}