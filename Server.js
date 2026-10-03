require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");

const app = express();

const PORT = process.env.PORT || 3000

const db = mysql.createPool({
    host: process.env.DB_HOST || "mysql-1f5ff728-ay177520-a9b8.d.aivencloud.com",
    user: process.env.DB_USER || "avnadmin",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "defaultdb",
    port: Number(process.env.DB_PORT || 18111),

    ssl: {
        rejectUnauthorized: false
    },

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});


app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("Public"));

app.get("/", (req, res) => {
    res.redirect("/index.html");
});


app.get("/places", (req, res) => {

    const sql = "SELECT * FROM destinations";

    db.query(sql, (err, results) => {

        if (err) {

            console.error("Database Error:", err);

            return res
                .status(500)
                .send("Database Error: " + err.message);
        }


        let html = `

        <!DOCTYPE html>

        <html>

        <head>

            <meta charset="UTF-8">

            <meta
                name="viewport"
                content="width=device-width, initial-scale=1.0"
            >

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

                    width: fit-content;

                    margin: 20px auto;

                    padding: 10px 20px;

                    background: #0077b6;

                    color: white;

                    text-decoration: none;

                    border-radius: 5px;
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

<nav style="background:#023e8a; padding:15px; text-align:center;">
    <a href="/index.html" style="color:white; text-decoration:none; margin:0 20px; font-size:18px;">
        Home
    </a>

    <a href="/places" style="color:white; text-decoration:none; margin:0 20px; font-size:18px;">
        Places
    </a>
</nav>

<h1>Tourist Places in India</h1>

            <a class="add" href="/add">

                ➕ Add Tourist Place

            </a>

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

                    ? `

                        <img
                            src="${place.photo}"
                            alt="${place.name}"
                        >

                    `

                    : `

                        <p>No photo available</p>

                    `
                }


                <a
                    class="edit"
                    href="/edit/${place.id}"
                >

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

        <!DOCTYPE html>

        <html>

        <head>

            <meta charset="UTF-8">

            <meta
                name="viewport"
                content="width=device-width, initial-scale=1.0"
            >

            <title>Add Tourist Place</title>

        </head>


        <body>

            <h1>Add Tourist Place</h1>


            <form action="/add" method="POST">


                <label>Place Name:</label><br>

                <input
                    type="text"
                    name="name"
                    required
                >


                <br><br>


                <label>Location:</label><br>

                <input
                    type="text"
                    name="location"
                    required
                >


                <br><br>


                <label>Description:</label><br>

                <textarea
                    name="description"
                    required
                ></textarea>


                <br><br>


                <label>Photo URL:</label><br>

                <input
                    type="text"
                    name="photo"
                >


                <br><br>


                <label>Price:</label><br>

                <input
                    type="number"
                    name="price"
                    step="0.01"
                    required
                >


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

        (

            name,

            location,

            description,

            photo,

            price

        )

        VALUES (?, ?, ?, ?, ?)

    `;


    db.query(

        sql,

        [

            name,

            location,

            description,

            photo,

            price

        ],

        (err) => {

            if (err) {

                console.error("Database Error:", err);

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


    const sql = `

        SELECT *

        FROM destinations

        WHERE id = ?

    `;


    db.query(

        sql,

        [id],

        (err, results) => {

            if (err) {

                console.error("Database Error:", err);

                return res
                    .status(500)
                    .send("Database Error: " + err.message);
            }


            if (results.length === 0) {

                return res.send("Place not found");

            }


            const place = results[0];


            res.send(`

                <!DOCTYPE html>

                <html>

                <head>

                    <meta charset="UTF-8">

                    <meta
                        name="viewport"
                        content="width=device-width, initial-scale=1.0"
                    >

                    <title>Edit Tourist Place</title>

                </head>


                <body>

                    <h1>Edit Tourist Place</h1>


                    <form
                        action="/edit/${place.id}"
                        method="POST"
                    >


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

        }

    );

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

                console.error("Database Error:", err);

                return res
                    .status(500)
                    .send("Database Error: " + err.message);
            }


            res.redirect("/places");

        }

    );

});


// ===============================
// Server Test
// ===============================

app.get("/test", (req, res) => {

    res.send("Tourist Project Server is Working!");

});


// ===============================
// Start Server
// ===============================

app.listen(PORT, "0.0.0.0", () => {

    console.log(`Server running on port ${PORT}`);

});