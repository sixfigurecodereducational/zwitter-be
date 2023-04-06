import * as cdk from 'aws-cdk-lib';
import iam from 'aws-cdk-lib/aws-iam';
import dynamodb from "aws-cdk-lib/aws-dynamodb";
import lambda from "aws-cdk-lib/aws-lambda";
import apigateway from "aws-cdk-lib/aws-apigateway";
import path from "path";

export default class ZwitterStack extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    const zwitterLambdaRole = new iam.Role(
      this,
      "ZwitterLambdaRole",
      {
        assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
        description: "Zwitter Lambda Role.",
      }
    );

    zwitterLambdaRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName(
        "service-role/AWSLambdaBasicExecutionRole"
      )
    );

    zwitterLambdaRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName(
        "service-role/AWSLambdaVPCAccessExecutionRole"
      )
    );

    zwitterLambdaRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName(
        "AmazonDynamoDBFullAccess"
      )
    );

    const zwitterDynamoDB = new dynamodb.Table(this, "ZwitterDynamoDBTable", {
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING }
    });

    const zwitterLambda = new lambda.Function(this, "ZwitterLambda", {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: "index.handler",
      role: zwitterLambdaRole,
      code: lambda.Code.fromAsset(path.join(path.resolve(), 'dist')),
      environment: {
        DYNAMO_TABLE_NAME: zwitterDynamoDB.tableName,
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID
      }
    });

    new apigateway.LambdaRestApi(this, "ZwitterAPI", {
      restApiName: 'ZwitterAPI',
      handler: zwitterLambda,
      defaultCorsPreflightOptions: {
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowOrigins: ['http://localhost:3000', 'https://zwitter-beta.vercel.app', 'https://zwitter-sixfigurecodereducational.vercel.app', 'https://zwitter-git-main-sixfigurecodereducational.vercel.app'],
        allowHeaders: apigateway.Cors.DEFAULT_HEADERS,
        allowCredentials: true
      }
    });
  }
}
