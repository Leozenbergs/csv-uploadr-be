const express = require('express');
const mongodb = require('mongodb');
const multer = require('multer');
// Selecionando diretorio destino do puload
const upload = multer({
    dest: './uploads'
});

const router = express.Router();
async function connection(){
    const client = mongodb.MongoClient.connect('mongodb+srv://admin:admin@prevision-test-hqcvc.mongodb.net/test?retryWrites=true&w=majority', {
        useNewUrlParser: true,
        server: {    
            auto_reconnect: true,    
            socketOptions: {
        
                keepAlive: 1,    
                connectTimeoutMS: 10000,    
                socketTimeoutMS: 10000,    
            }    
            },    
            replset: {    
            auto_reconnect: true,    
            socketOptions: {    
                keepAlive: 1,    
                connectTimeoutMS: 10000,    
                socketTimeoutMS: 10000,    
            }    
        }
    });

    return client;
}


// Get posts 

router.get('/', async (req, res) => {
    const posts = await loadPosts();
    res.send(await posts.toArray());
});

// Add post 
router.post('/', upload.single('file'), async (req, res) => {
    res.json({  file: req.file  });

    const conn = await connection();

    let csvFilePath = `${req.file.path}`;
    // csvtojson
    const csv=require('csvtojson');
    csv()
    .fromFile(csvFilePath)
    .then((jsonObj)=>{
        conn.db('Prevision_test').collection('events').insertMany(jsonObj);
        res.status(201).send();
        conn.db.close();
    });
});

// Delete post
// router.delete('/:id', async (req, res) => {
//     const posts = await loadPosts();
//     await posts.deleteOne({_id: new mongodb.ObjectID(req.params.id)});
//     res.status(200).send();
// })

async function loadPosts(){
    const conn = await connection();

    return conn.db('Prevision_test').collection('events').aggregate([
        {
            $lookup:{
                from: "companies",
                localField : "company_id",
                foreignField : "company_id",
                as : "company_info"
            }
        },   
        {
            $lookup:{
                from: "users", 
                localField: "user_id", 
                foreignField: "user_id",
                as: "user"
            }
        }
    ]);
    
}

module.exports = router;