# SmartBearCoin
Sample project demonstrating a collaborative API design and delivery journey using SmartBear tooling - API &amp; Insight Hub / Swagger / Spectral /  ReadyAPI / PactFlow / BugSnag

## FrontEnd

```sh
npm install -g aws-cdk-local aws-cdk
mkdir cdkui && cd cdkui
cdk init app --language typescript
npm install @aws-cdk/aws-s3 @aws-cdk/aws-s3-deployment
cdklocal synth
cdklocal bootstrap
cdklocal deploy
export CDKUI_BUCKET=$(awslocal s3 ls --bucket-name-prefix cdkui | awk -F' ' '{print $3}')
awslocal s3 cp website s3://${CDKUI_BUCKET} --recursive
```

### Issues

#### cdk / local s3 bug

On successful deploy, assets are not copied over into the s3 bucket, when running locally.

https://stackoverflow.com/questions/72791021/localstack-with-cdk-is-not-deploying-directory-to-s3-bucket

```sh
export CDKUI_BUCKET=$(awslocal s3 ls --bucket-name-prefix cdkui | awk -F' ' '{print $3}')
awslocal s3 cp website s3://${CDKUI_BUCKET} --recursive
```