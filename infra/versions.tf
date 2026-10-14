terraform {
  required_version = ">= 1.10"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }

  backend "s3" {
    bucket       = "nour-portfolio-tfstate-1ba702a9"
    key          = "portfolio/terraform.tfstate"
    region       = "eu-west-3"
    encrypt      = true
    use_lockfile = true # S3-native locking: no DynamoDB table needed
  }
}

provider "aws" {
  region = "eu-west-3"

  default_tags {
    tags = {
      Project   = "portfolio"
      ManagedBy = "terraform"
      Stack     = "site"
    }
  }
}

provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"

  default_tags {
    tags = {
      Project   = "portfolio"
      ManagedBy = "terraform"
      Stack     = "site"
    }
  }
}