# OAC: CloudFront signs every request to S3 (SigV4),so the bucket can stay private.
resource "aws_cloudfront_origin_access_control" "site" {
  name                              = "portfolio-site-oac"
  description                       = "CloudFront signs requests to the private site bucket"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_function" "spa_rewrite" {
  name    = "portfolio-spa-rewrite"
  runtime = "cloudfront-js-2.0"
  comment = "Serve index.html for app routes like /work/k8s-autoguard"
  publish = true
  code    = file("${path.module}/functions/spa-rewrite.js")
}

# AWS-managed cache policy: gzip/brotli, no cookies or query strings in the cache key.
data "aws_cloudfront_cache_policy" "optimized" {
  name = "Managed-CachingOptimized"
}

locals {
  # The browser cache rule for each kind of file.
  cache_control = {
    assets = "public, max-age=31536000, immutable" # Vite file names contain a content hash: never change
    pages  = "no-cache"                            # HTML and unhashed files: always revalidate
  }

  # Only load scripts, fonts and images from this site. Inline styles are allowed
  # because React sets style attributes (animation delays).
  csp = join("; ", [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ])
}

# Two response-headers policies: same security headers, different Cache-Control.
resource "aws_cloudfront_response_headers_policy" "site" {
  for_each = local.cache_control
  name     = "portfolio-${each.key}"

  security_headers_config {
    strict_transport_security { # force HTTPS for a year
      access_control_max_age_sec = 31536000
      include_subdomains         = true
      override                   = true
    }
    content_type_options { # stop browsers guessing file types
      override = true
    }
    frame_options { # can't be embedded in other sites (clickjacking)
      frame_option = "DENY"
      override     = true
    }
    referrer_policy {
      referrer_policy = "strict-origin-when-cross-origin"
      override        = true
    }
    content_security_policy {
      content_security_policy = local.csp
      override                = true
    }
  }

  custom_headers_config {
    items {
      header   = "Cache-Control"
      value    = each.value
      override = true
    }
    items {
      header   = "Permissions-Policy"
      value    = "camera=(), microphone=(), geolocation=()"
      override = true
    }
  }
}

resource "aws_cloudfront_distribution" "site" {
  enabled             = true
  comment             = "Portfolio site"
  default_root_object = "index.html"
  aliases             = local.site_names
  is_ipv6_enabled     = true
  http_version        = "http2and3"
  price_class         = "PriceClass_100" # cheapest edge locations (North America + Europe)

  origin {
    origin_id                = "site-bucket"
    domain_name              = aws_s3_bucket.site.bucket_regional_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.site.id
  }

  # Everything except /assets/*: pages and unhashed files, with the SPA rewrite.
  default_cache_behavior {
    target_origin_id           = "site-bucket"
    viewer_protocol_policy     = "redirect-to-https"
    allowed_methods            = ["GET", "HEAD"]
    cached_methods             = ["GET", "HEAD"]
    compress                   = true
    cache_policy_id            = data.aws_cloudfront_cache_policy.optimized.id
    response_headers_policy_id = aws_cloudfront_response_headers_policy.site["pages"].id

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.spa_rewrite.arn
    }
  }

  # Hashed Vite build files: cached for a year, no rewrite needed.
  ordered_cache_behavior {
    path_pattern               = "/assets/*"
    target_origin_id           = "site-bucket"
    viewer_protocol_policy     = "redirect-to-https"
    allowed_methods            = ["GET", "HEAD"]
    cached_methods             = ["GET", "HEAD"]
    compress                   = true
    cache_policy_id            = data.aws_cloudfront_cache_policy.optimized.id
    response_headers_policy_id = aws_cloudfront_response_headers_policy.site["assets"].id
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate_validation.site.certificate_arn
    ssl_support_method       = "sni-only"     # free; "vip" (dedicated IP) costs $600/month
    minimum_protocol_version = "TLSv1.2_2021" # refuse old, insecure TLS versions
  }
}