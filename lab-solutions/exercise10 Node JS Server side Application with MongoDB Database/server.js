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
            res.end(err ? 'Error loading page' : data);
        });
    }
    else if (req.url === '/save' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            const data = querystring.parse(body);
            await collection.insertOne(data);
            
            fs.readFile('success.html', 'utf8', (err, html) => {
                if (err) {
                    res.writeHead(500);
                    res.end('Error');
                    return;
                }
                
                const userDataHtml = `
                    <p><strong>Name:</strong> ${data.name}</p>
                    <p><strong>Password:</strong> ${'*'.repeat(data.password.length)}</p>
                    <p><strong>Age:</strong> ${data.age}</p>
                    <p><strong>Mobile:</strong> ${data.mobile}</p>
                    <p><strong>Email:</strong> ${data.email}</p>
                    <p><strong>Gender:</strong> ${data.gender}</p>
                    <p><strong>State:</strong> ${data.state}</p>
                `;
                
                const finalHtml = html.replace('<div class="user-data" id="userData">', 
                    `<div class="user-data" id="userData">${userDataHtml}`);
                
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(finalHtml);
            });
        });
    }
    else if (req.url === '/viewall') {
        (async () => {
            const users = await collection.find({}).toArray();
            
            fs.readFile('viewall.html', 'utf8', (err, html) => {
                if (err) {
                    res.writeHead(500);
                    res.end('Error');
                    return;
                }
                
                let usersList = '';
                if (users.length === 0) {
                    usersList = '<div class="no-data">No users registered yet.</div>';
                } else {
                    users.forEach((u, i) => {
                        usersList += `
                        <div class="user-card">
                            <h3>User ${i + 1}</h3>
                            <p><strong>Name:</strong> ${u.name}</p>
                            <p><strong>Age:</strong> ${u.age}</p>
                            <p><strong>Mobile:</strong> ${u.mobile}</p>
                            <p><strong>Email:</strong> ${u.email}</p>
                            <p><strong>Gender:</strong> ${u.gender}</p>
                            <p><strong>State:</strong> ${u.state}</p>
                        </div>`;
                    });
                }
                
                const finalHtml = html.replace('<div id="usersList">', 
                    `<div id="usersList">${usersList}`);
                
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(finalHtml);
            });
        })();
    }
    else {
        res.writeHead(404);
        res.end('Not Found');
    }
}).listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
