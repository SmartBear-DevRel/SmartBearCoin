.PHONY: docker 

LOCALSTACK_URL?=localhost:4566

# Allow for LocalStack existing running instance
up:
	if curl -sSf $$LOCALSTACK_URL> /dev/null; then\
		make docker_no_localstack;\
	else\
		make docker;\
	fi
docker:
	docker-compose up -d --build
docker_no_localstack:
	docker-compose config --services | grep -v localstack | xargs docker-compose up -d 

sql:
	psql -h localhost -c "INSERT INTO DummyData(Name, Age, City) VALUES('Foo', 55, 'Austin') RETURNING *;"

s3_stream:
	awslocal s3 cp --recursive s3://replication-bucket-wal2json/firehose/ ./tmp/wal2json
jq_stream:
	 cat tmp/wal2json/*/*/*/*/*  | jq

logs_postgres:
	docker logs -f smartbearcoin-postgres-1
logs_localstack:
	docker logs -f smartbearcoin-localstack-1
logs_stream:
	docker logs -f smartbearcoin-stream_wal2json-1