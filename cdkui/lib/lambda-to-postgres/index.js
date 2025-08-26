const { Client } = require('pg');
const { SecretsManager } = require('@aws-sdk/client-secrets-manager');
const { user } = require('pg/lib/defaults');

const secretsManager = new SecretsManager();

/**
 * Lambda function that connects to PostgreSQL and executes a query
 */
exports.handler = async (event) => {
  console.log('Event received:', JSON.stringify(event));

  const secretArn = process.env.DB_SECRET_ARN;
  // const dbName = process.env.DB_NAME;
  try {
    // Get database credentials from Secrets Manager

    console.log(`Retrieving secret from ${secretArn}`);
    const secretResponse = await secretsManager.getSecretValue({ SecretId: secretArn });
    console.log('Secret retrieved successfully', secretResponse);
    const secret = JSON.parse(secretResponse.SecretString);
    const logSecret = {...secret};
    console.log(logSecret);

    // split the pg connection string
    // postgres://postgres:postgres@192.168.1.187:5432/postgres
    let [userInfo, hostInfo] = secret.host.split('@');
    console.log(userInfo, hostInfo);
    let [host, port] = hostInfo.split(':');
    console.log(host, port);
    const dbName = port ? port.split('/')[1] : null;
    console.log('DB Name:', dbName);
    port = port.split('/')[0]
    userInfo = userInfo.replace('postgres://', '');
    console.log(userInfo);
    const [username, password] = userInfo.split(':');
    console.log(username, password);
    // Create PostgreSQL client
    const client = new Client({
      host,
      port,
      user: username,
      password,
      // ssl: {
      //   rejectUnauthorized: false, // For demo purposes only, consider proper SSL setup in production
      // },
      connectionTimeoutMillis: 10000,
    });

    // // Connect to the database
    console.log('Connecting to PostgreSQL database...');
    await client.connect();

    // // Check if our demo table exists, if not create it
    console.log('Creating demo table if it does not exist...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS demo_table (
        id SERIAL PRIMARY KEY,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert a record
    const message = event.message || 'Hello from Lambda!';
    console.log(`Inserting message: ${message}`);
    await client.query('INSERT INTO demo_table (message) VALUES ($1)', [message]);

    // Query the records
    console.log('Querying records...');
    const result = await client.query('SELECT * FROM demo_table ORDER BY created_at DESC LIMIT 10');

    // Close the connection
    await client.end();

    // Return the results
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Query executed successfully',
        records: result.rows,
      }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error executing query',
        error: error.message,
      }),
    };
  }
};