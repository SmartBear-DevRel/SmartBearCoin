import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';


export class PostgresStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // VPC
        // const vpc = new ec2.Vpc(this, 'PostgresVpc', { maxAzs: 2 });

        // RDS PostgreSQL Instance
        // Use an existing Postgres URL from environment variable instead of creating an RDS instance
        const dbInstance = {
            dbInstanceEndpointAddress: process.env.POSTGRES_URL ?? 'localhost:5432',
        };


        // Secrets Manager for DB credentials
        // Store DB credentials securely using AWS Secrets Manager, reading values from environment variables
        const dbSecret = new secretsmanager.Secret(this, 'PostgresSecret', {
            secretObjectValue: {
                // username: cdk.SecretValue.unsafePlainText(process.env.DB_USERNAME ?? 'postgres'),
                // username_rep: cdk.SecretValue.unsafePlainText(process.env.DB_USERNAME_REP ?? 'postgres_rep'),
                // database: cdk.SecretValue.unsafePlainText(process.env.DB_DATABASE ?? 'postgres'),
                // password: cdk.SecretValue.unsafePlainText(process.env.DB_PASSWORD ?? 'postgres'),
                host: cdk.SecretValue.unsafePlainText(dbInstance.dbInstanceEndpointAddress)
            },
        });

        // IAM Role for Lambda/API access
        const apiRole = new iam.Role(this, 'ApiIamRole', {
            assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
            managedPolicies: [
                iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
            ],
        });

        dbSecret.grantRead(apiRole);


        // Lambda function to access Postgres

            const bundleCommand = [
      'bash', '-c', [
        'cp -r . /asset-output/',
      ].join(' && ')
    ]

        const dbLambda = new lambda.Function(this, 'PostgresApiLambda', {
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lib/lambda-to-postgres'), {
        bundling: {
          image: lambda.Runtime.NODEJS_LATEST.bundlingImage,
          command: bundleCommand,
        },
      }),
            environment: {
                DB_SECRET_ARN: dbSecret.secretArn,
                DB_HOST: dbInstance.dbInstanceEndpointAddress,
            },
            // vpc,
            role: apiRole,
            // vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
            timeout: cdk.Duration.seconds(10),
        });

        // dbInstance.connections.allowDefaultPortFrom(dbLambda);

        // API Gateway
        const api = new apigateway.LambdaRestApi(this, 'PostgresApi', {
            handler: dbLambda,
            proxy: true,
            defaultMethodOptions: {
                authorizationType: apigateway.AuthorizationType.IAM,
            },
        });

        new cdk.CfnOutput(this, 'ApiEndpoint', { value: api.url });
        new cdk.CfnOutput(this, 'DbSecretArn', { value: dbSecret.secretArn });
        new cdk.CfnOutput(this, 'IamRoleArn', { value: apiRole.roleArn });
    }
}