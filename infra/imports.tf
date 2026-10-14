# One-time: adopt resources that already exist in AWS into the new state
# (the original state was lost when the state bucket was recreated).
# Importing creates and changes nothing. Delete this file after a successful apply.

import {
  to = aws_s3_bucket.site
  id = "nour-portfolio-site-3bbc7b27839daac46ccb52b6ef"
}
import {
  to = aws_s3_bucket_public_access_block.site
  id = "nour-portfolio-site-3bbc7b27839daac46ccb52b6ef"
}
import {
  to = aws_s3_bucket_server_side_encryption_configuration.site
  id = "nour-portfolio-site-3bbc7b27839daac46ccb52b6ef"
}
import {
  to = aws_s3_bucket_policy.site
  id = "nour-portfolio-site-3bbc7b27839daac46ccb52b6ef"
}
import {
  to = aws_cloudfront_origin_access_control.site
  id = "E1D2XND87RRF59"
}
import {
  to = aws_cloudfront_function.spa_rewrite
  id = "portfolio-spa-rewrite"
}
import {
  to = aws_cloudfront_response_headers_policy.site["pages"]
  id = "b2c616eb-340e-44e0-b454-f26b2c61ec43"
}
import {
  to = aws_cloudfront_response_headers_policy.site["assets"]
  id = "8f81506b-727b-409e-b1e6-3f35103034cb"
}
import {
  to = aws_cloudfront_distribution.site
  id = "E2XLWZ4DETJFOI"
}
import {
  to = aws_budgets_budget.monthly
  id = "068648884578:portfolio-monthly-cost"
}
import {
  to = aws_iam_openid_connect_provider.github
  id = "arn:aws:iam::068648884578:oidc-provider/token.actions.githubusercontent.com"
}
import {
  to = aws_iam_role.deploy
  id = "portfolio-github-deploy"
}
import {
  to = aws_iam_role_policy.deploy
  id = "portfolio-github-deploy:deploy-site"
}