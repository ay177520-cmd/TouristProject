const express = require("express");
const mysql = require("mysql2");

const app = express();
const PORT = 3000;

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "MySQL12345",
    database: "tourist_db"
});

db.connect((err) => {
    if (err) {
        console.log("MySQL connection failed:", err.message);
    } else {
        console.log("MySQL Connected Successfully!");
    }
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.send(`
        <h1>Welcome to Tourist Guide Project</h1>
        <p><a href="/places">View Tourist Places</a></p>
    `);
});
app.get("/places", (req, res) => {

    const sql = "SELECT * FROM destinations";

    db.query(sql, (err, results) => {

        if (err) {
            return res.status(500).send("Database Error: " + err.message);
        }

        let html = `
        <html>
        <head>
            <title>Tourist Places</title>

            <style>
                body {
                    font-family: Arial, sans-serif;
                    background: #f2f6f8;
                    padding: 20px;
                }

                h1 {
                    text-align: center;
                    color: #0077b6;
                }

                .add {
                    display: block;
                    text-align: center;
                    margin: 20px;
                }

                .place {
                    background: white;
                    padding: 15px;
                    margin: 15px auto;
                    max-width: 600px;
                    border-radius: 10px;
                    box-shadow: 0 0 5px gray;
                }

                .place img {
                    width: 100%;
                    max-height: 300px;
                    object-fit: cover;
                    border-radius: 8px;
                }

                .price {
                    color: green;
                    font-weight: bold;
                }

                .edit {
                    display: inline-block;
                    margin-top: 10px;
                    padding: 8px 15px;
                    background: #0077b6;
                    color: white;
                    text-decoration: none;
                    border-radius: 5px;
                }
            </style>

        </head>

        <body>

        <h1>Tourist Places in India</h1>

        <a class="add" href="/add">➕ Add Tourist Place</a>
        `;

        results.forEach(place => {

            html += `
            <div class="place">

                <h2>${place.name}</h2>

                <p>
                    <b>Location:</b> ${place.location}
                </p>

                <p>
                    <b>Description:</b> ${place.description}
                </p>

                <p class="price">
                    💰 Price: ₹${place.price || 0}
                </p>

                ${
                    place.photo
                    ? `<img src="${place.photo}" alt="${place.name}">`
                    : `<p>No photo available</p>`
                }

                <a class="edit" href="/edit/${place.id}">
                    ✏️ Edit Place
                </a>

            </div>
            `;
        });

        html += `
        </body>
        </html>
        `;

        res.send(html);
    });
});

app.get("/add", (req, res) => {

    res.send(`
        <html>

        <head>
            <title>Add Tourist Place</title>
        </head>

        <body>

            <h1>Add Tourist Place</h1>

            <form action="/add" method="POST">

                <label>Place Name:</label><br>
                <input type="text" name="name" required>
                <br><br>

                <label>Location:</label><br>
                <input type="text" name="location" required>
                <br><br>

                <label>Description:</label><br>
                <textarea name="description" required></textarea>
                <br><br>

                <label>Photo URL:</label><br>
                <input type="text" name="photo">
                <br><br>

                <label>Price:</label><br>
                <input type="number" name="price" step="0.01" required>
                <br><br>

                <button type="submit">
                    Add Place
                </button>

            </form>

            <br>

            <a href="/places">
                Back to Places
            </a>

        </body>

        </html>
    `);
});

app.post("/add", (req, res) => {

    const {
        name,
        location,
        description,
        photo,
        price
    } = req.body;

    const sql = `
        INSERT INTO destinations
        (name, location, description, photo, price)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [name, location, description, photo, price],
        (err) => {

            if (err) {
                return res
                    .status(500)
                    .send("Database Error: " + err.message);
            }

            res.redirect("/places");
        }
    );
});

app.get("/edit/:id", (req, res) => {

    const id = req.params.id;

    const sql = "SELECT * FROM destinations WHERE id = ?";

    db.query(sql, [id], (err, results) => {

        if (err) {
            return res.status(500).send("Database Error: " + err.message);
        }

        if (results.length === 0) {
            return res.send("Place not found");
        }

        const place = results[0];

        res.send(`
            <html>

            <head>
                <title>Edit Tourist Place</title>
            </head>

            <body>

                <h1>Edit Tourist Place</h1>

                <form action="/edit/${place.id}" method="POST">

                    <label>Place Name:</label><br>
                    <input
                        type="text"
                        name="name"
                        value="${place.name}"
                        required
                    >
                    <br><br>

                    <label>Location:</label><br>
                    <input
                        type="text"
                        name="location"
                        value="${place.location}"
                        required
                    >
                    <br><br>

                    <label>Description:</label><br>
                    <textarea
                        name="description"
                        required
                    >${place.description}</textarea>
                    <br><br>

                    <label>Photo URL:</label><br>
                    <input
                        type="text"
                        name="photo"
                        value="${place.photo || ""}"
                    >
                    <br><br>

                    <label>Price:</label><br>
                    <input
                        type="number"
                        name="price"
                        value="${place.price || 0}"
                        step="0.01"
                        required
                    >
                    <br><br>

                    <button type="submit">
                        Update Place
                    </button>

                </form>

                <br>

                <a href="/places">
                    Back to Places
                </a>

            </body>

            </html>
        `);
    });
});

app.post("/edit/:id", (req, res) => {

    const id = req.params.id;

    const {
        name,
        location,
        description,
        photo,
        price
    } = req.body;

    const sql = `
        UPDATE destinations
        SET
            name = ?,
            location = ?,
            description = ?,
            photo = ?,
            price = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [
            name,
            location,
            description,
            photo,
            price,
            id
        ],
        (err) => {

            if (err) {
                return res
                    .status(500)
                    .send("Database Error: " + err.message);
            }

            res.redirect("/places");
        }
    );
});

app.get("/test", (req, res) => {
    res.send("Tourist Project Server is Working!");
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
