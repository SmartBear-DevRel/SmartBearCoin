FROM node:22

RUN npm install -g aws-cdk \
    && npm install -g aws-cdk-local \
    && npm install -g aws-sdk

RUN mkdir -p /root/.aws && touch /root/.aws/credentials

RUN apt-get update && apt-get install -y python3 pipx \
    && pipx install awscli-local \
    && pipx ensurepath

# Install AWS CLI v2 via curl and unzip
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-$(uname -m).zip" -o "awscliv2.zip" \
    && unzip awscliv2.zip \
    && ./aws/install \
    && rm -rf awscliv2.zip aws

ENV PATH="/root/.local/bin:${PATH}"

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ENTRYPOINT ["bash", "-c", "cdklocal bootstrap && cdklocal deploy --require-approval=never && awslocal s3 cp website s3://$(awslocal s3 ls --bucket-name-prefix cdkui | awk -F' ' '{print $3}') --recursive"]