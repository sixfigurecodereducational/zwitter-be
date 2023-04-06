import * as cdk from 'aws-cdk-lib';
import ZwitterStack from '../lib/zwitter-stack.js';
import dotenv from 'dotenv';
dotenv.config();

const app = new cdk.App();
new ZwitterStack(app, 'ZwitterStack', {
  env: {
    region: 'us-east-1',
    account: process.env.CDK_DEFAULT_ACCOUNT
  }
});
