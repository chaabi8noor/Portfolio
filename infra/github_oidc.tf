variable "github_repo" {
  description = "The only GitHub repository allowed to deploy (owner/name)."
  type        = string
  default     = "chaabi8noor/Portfolio"
}

# Tells AWS to trust tokens signed by GitHub Actions (one per account).
resource "aws_iam_openid_connect_provider" "github" {
  url            = "https://token.actions.githubusercontent.com"
  client_id_list = ["sts.amazonaws.com"]
}

# Who may assume the deploy role: workflows from this repo, on the main branch only.
data "aws_iam_policy_document" "github_trust" {
  statement {
    actions = ["sts:AssumeRoleWithWebIdentity"]
    principals {
      type        = "Federated"
      identifiers = [aws_iam_openid_connect_provider.github.arn]
    }
    condition { # the token was issued for AWS STS
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }
    condition { # exact repo + branch: forks, other branches and PRs are refused
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:sub"
      values   = ["repo:${var.github_repo}:ref:refs/heads/main"]
    }
  }
}

resource "aws_iam_role" "deploy" {
  name                 = "portfolio-github-deploy"
  description          = "Assumed by GitHub Actions (main branch) to publish the site"
  assume_role_policy   = data.aws_iam_policy_document.github_trust.json
  max_session_duration = 3600 # credentials expire after 1 hour
}

# What the role may do: upload to THIS bucket and clear THIS distribution's cache. Nothing else.
data "aws_iam_policy_document" "deploy" {
  statement {
    sid       = "ListSiteBucket" # s3 sync compares local files with what's already there
    actions   = ["s3:ListBucket"]
    resources = [aws_s3_bucket.site.arn]
  }
  statement {
    sid       = "WriteSiteObjects"
    actions   = ["s3:PutObject", "s3:DeleteObject"]
    resources = ["${aws_s3_bucket.site.arn}/*"]
  }
  statement {
    sid       = "InvalidateSiteCache"
    actions   = ["cloudfront:CreateInvalidation"]
    resources = [aws_cloudfront_distribution.site.arn]
  }
}

resource "aws_iam_role_policy" "deploy" {
  name   = "deploy-site"
  role   = aws_iam_role.deploy.id
  policy = data.aws_iam_policy_document.deploy.json
}

output "deploy_role_arn" {
  value = aws_iam_role.deploy.arn
}