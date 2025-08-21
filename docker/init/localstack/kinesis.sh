#!/bin/bash
set -x
awslocal kinesis create-stream --stream-name ${REPLICATION_KINESIS_STREAM_NAME_WAL2JSON} --shard-count 1
awslocal firehose create-delivery-stream --cli-input-json file:///etc/localstack/init/ready.d/firehose_kinesis_source_wal2json.json
set +x
