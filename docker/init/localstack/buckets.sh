#!/bin/bash
set -x
awslocal s3 mb s3://${REPLICATION_S3_BUCKET_WAL2JSON}
# ./kinesis.sh
set +x
