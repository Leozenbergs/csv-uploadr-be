const express = require('express');
const mongodb = require('mongodb');
const multer = require('multer');
// Selecionando diretorio destino do puload
const upload = multer({
    dest: './uploads'
});

const router = express.Router();


// Get posts 

router.get('/', async (req, res) => {
    const posts = await loadPosts();
    res.send(await posts.find({}).toArray());
    mongodb.close();
});

// Add post 
router.post('/', upload.single('file'), async (req, res) => {
    res.json({  file: req.file  });

    const posts = await loadPosts();

    let csvFilePath = `${req.file.path}`;
    // csvtojson
    const csv=require('csvtojson');
    csv()
    .fromFile(csvFilePath)
    .then((jsonObj)=>{
        posts.insertMany(jsonObj);
        res.status(201).send();
        
    });
    mongodb.close();
    
});

// Delete post
// router.delete('/:id', async (req, res) => {
//     const posts = await loadPosts();
//     await posts.deleteOne({_id: new mongodb.ObjectID(req.params.id)});
//     res.status(200).send();
// })

async function loadPosts(){
    const client = await mongodb.MongoClient.connect('mongodb+srv://admin:admin@prevision-test-hqcvc.mongodb.net/test?retryWrites=true&w=majority', {
        useNewUrlParser: true,
        server: {    
            auto_reconnect: true,    
            socketOptions: {
      
              keepAlive: 1,    
              connectTimeoutMS: 60000,    
              socketTimeoutMS: 60000,    
            }    
          },    
          replset: {    
            auto_reconnect: true,    
            socketOptions: {    
              keepAlive: 1,    
              connectTimeoutMS: 60000,    
             socketTimeoutMS: 60000,    
            }    
         }
    });

    return client.db('Prevision_test').collection('events');
    
}

module.exports = router;