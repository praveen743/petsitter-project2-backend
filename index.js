const express = require("express");
const app = express();
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jswt = require("jsonwebtoken");
const secret = "AkYeHoPkd";
const mongodb = require("mongodb");
const mongoClient = mongodb.MongoClient;
const URL = "mongodb+srv://praveen:prmdb7@cluster0.4mskv.mongodb.net?retryWrites=true&w=majority";


app.use(express.json())
app.use(cors({
    origin: "*"
}))

let authenticate = function (req, res, next) {
    if (req.headers.authorization) {
        let result = jswt.verify(req.headers.authorization, secret);
        if (result) {
            next();
        }
        else {
            res.status(401).json({ message: "token invalid" })
        }
    }
    else {
        res.status(401).json({ message: "not authorized" })
    }
}


app.post('/register', async function (req, res) {
    try {
        let connection = await mongoClient.connect(URL);
        let db = connection.db("petsitter");
        let user = await db.collection("registeration").findOne({ email: req.body.email });
        if (user) {
            res.json({ message: "Email already exist!" });
            connection.close();
        }
        else {
            let salt = await bcrypt.genSalt(10);
            let hash = await bcrypt.hash(req.body.password, salt);
            req.body.password = hash;
            await db.collection("registeration").insertOne(req.body)
            res.json({ message: "registered" });
            connection.close();
        }
    } catch (error) {
        console.log(error)
        res.json(["error"])
    }
})

app.get("/login", async function (req, res) {
    try {
        let connection = await mongoClient.connect(URL);
        let db = connection.db("petsitter");
        let attendancedata = await db.collection("registeration").find({}).project({ "_id": 0 }).toArray();
        await connection.close();
        res.json(attendancedata);
    } catch (error) {
        console.log(error)
    }

});

app.post('/login', async function (req, res) {
    try {
        let connection = await mongoClient.connect(URL);
        let db = connection.db("petsitter");
        let user = await db.collection("registeration").findOne({ email: req.body.email });
        if (user) {
            let passwordcheck = await bcrypt.compare(req.body.password, user.password)
            if (passwordcheck) {
                let token = jswt.sign({ userid: user._id }, secret, { expiresIn: '1h' });
                res.json({ message: "login", user, token });
            }
            else {
                res.json({ message: "email id or password incorrect" });
            }
        }
        else {
            res.json({ message: "email id or password incorrect" });
        }
        connection.close();

    } catch (error) {
        res.json(["email id or password incorrect"])
    }
})


app.post("/customer", async function (req, res) {
    try {
        let connection = await mongoClient.connect(URL);
        let db = connection.db("petsitter")
        await db.collection("customer").insertOne(req.body)
        await connection.close();
        res.json({ message: "posted :)" })
    } catch (error) {
        console.log(error)
    }
});

app.post("/accept", async function (req, res) {
    try {
        let connection = await mongoClient.connect(URL);
        let db = connection.db("petsitter")
        await db.collection("accept").insertOne(req.body)
        await connection.close();
        res.json({ message: "posted :)" })
    } catch (error) {
        console.log(error)
    }
});

app.get("/accept/:id", async function (req, res) {
    try {
        let connection = await mongoClient.connect(URL);
        let db = connection.db("petsitter")
        var orderarr = await db.collection("accept").find({ "id": req.params.id }).toArray();
        await connection.close();
        res.json(orderarr);
    } catch (error) {
        console.log(error)
    }
});

app.delete("/accept/:id", async function (req, res) {
    try {
        let connection = await mongoClient.connect(URL);
        let db = connection.db("petsitter");
        let objId = mongodb.ObjectId(req.params.id)
        var orderarr = await db.collection("accept").deleteOne({ _id: objId })

        await connection.close();
        res.json(orderarr);
    } catch (error) {
        console.log(error)
    }
});

app.get("/customer", async function (req, res) {
    try {
        let connection = await mongoClient.connect(URL);
        let db = connection.db("petsitter")
        var orderarr = await db.collection("customer").find({}).toArray();
        await connection.close();
        res.json(orderarr);
    } catch (error) {
        console.log(error)
    }
});

app.get("/myorder/:id", async function (req, res) {
    try {
        let connection = await mongoClient.connect(URL);
        let db = connection.db("petsitter")
        let objId = mongodb.ObjectId(req.params.id)
        var orderarr = await db.collection("customer").find({ _id: objId }).toArray();
        await connection.close();
        res.json(orderarr);
    } catch (error) {
        console.log(error)
    }
});

app.get("/order/:id", authenticate, async function (req, res) {
    try {
        let connection = await mongoClient.connect(URL);
        let db = connection.db("petsitter")
        var orderarr = await db.collection("customer").find({ "username": req.params.id }).toArray();
        await connection.close();
        res.json(orderarr);
    } catch (error) {
        console.log(error)
    }
});

app.put("/order/:id", async function (req, res) {
    try {
        let connection = await mongoClient.connect(URL);
        let db = connection.db("petsitter");
        let objId = mongodb.ObjectId(req.params.id)

        //    console.log(req.body.username)
        var updatedarr = await db.collection("customer").updateMany({ _id: objId }, { $set: req.body })
        console.log(updatedarr);
        await connection.close();
        res.json({ message: "User Updated" })
    } catch (error) {
        res.json(error);
        console.log(error)
    }
});

app.delete("/order:id", async function (req, res) {
    try {
        let connection = await mongoClient.connect(URL);
        let db = connection.db("petsitter");
        let objId = mongodb.ObjectId(req.params.id)
        var deldata = await db.collection("customer").deleteOne({ _id: objId })

        await connection.close();
        res.json({ message: "User Deleted" })
    } catch (error) {
        console.log(error)
    }
    // let index = usersList.findIndex(obj => obj.id == req.params.id);
    // usersList.splice(index,1);
    // res.json({message : "Deleted!"})
});

// crud
app.listen(3003, () => { console.log("app is running") })
