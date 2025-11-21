const http = require('http');
const fs = require('fs');
const querystring = require('querystring');
const { MongoClient } = require('mongodb');

const PORT = 3000;
let collection;

MongoClient.connect('mongodb://localhost:27017')
    .then(client => {
        console.log('Connected to MongoDB');
        collection = client.db('ecommerce').collection('customers');
    })
    .catch(err => console.error('MongoDB error:', err.message));

http.createServer((req, res) => {
    if (req.url === '/') {
        fs.readFile('index.html', (err, data) => {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(err ? 'Error' : data);
        });
    }
    else if (req.url === '/save' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            const data = querystring.parse(body);
            await collection.insertOne(data);
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(`
<html>
<head><title>Success</title></head>
<body style="font-family:Arial; padding:20px; background:#f0f0f0;">
    <div style="max-width:600px; margin:auto; background:white; padding:30px; border-radius:8px;">
        <h1 style="color:#4040ff; text-align:center;">Success!</h1>
        <div style="background:#4CAF50; color:white; padding:10px; text-align:center; border-radius:5px; margin:20px 0;">
            Data saved to MongoDB!
        </div>
        <div style="margin:10px 0; padding:10px; background:#f8f8ff; border-radius:4px;">
            <strong>Name:</strong> ${data.name}<br>
            <strong>Age:</strong> ${data.age}<br>
            <strong>Mobile:</strong> ${data.mobile}<br>
            <strong>Email:</strong> ${data.email}<br>
            <strong>Gender:</strong> ${data.gender}<br>
            <strong>State:</strong> ${data.state}
        </div>
        <a href="/" style="color:#6060ff; text-align:center; display:block; margin-top:20px;">Back</a>
    </div>
</body>
</html>
            `);
        });
    }
    else if (req.url === '/viewall') {
        (async () => {
            const users = await collection.find({}).toArray();
            let list = users.length === 0 ? '<p>No users yet.</p>' : '';
            users.forEach((u, i) => {
                list += `
                <div style="margin:20px 0; padding:15px; background:#f8f8ff; border-radius:5px;">
                    <h3>User ${i + 1}</h3>
                    <p><strong>Name:</strong> ${u.name}</p>
                    <p><strong>Age:</strong> ${u.age}</p>
                    <p><strong>Mobile:</strong> ${u.mobile}</p>
                    <p><strong>Email:</strong> ${u.email}</p>
                    <p><strong>Gender:</strong> ${u.gender}</p>
                    <p><strong>State:</strong> ${u.state}</p>
                </div>`;
            });
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(`
<html>
<head><title>All Users</title></head>
<body style="font-family:Arial; padding:20px; background:#f0f0f0;">
    <div style="max-width:800px; margin:auto; background:white; padding:30px; border-radius:8px;">
        <h1 style="color:#4040ff; text-align:center;">All Users</h1>
        ${list}
        <a href="/" style="color:#6060ff; text-align:center; display:block; margin-top:20px;">Back</a>
    </div>
</body>
</html>
            `);
        })();
    }
    else {
        res.writeHead(404);
        res.end('Not Found');
    }
}).listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
