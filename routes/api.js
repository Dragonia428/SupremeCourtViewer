var express = require('express');
var router = express.Router();

var neo4j = require('neo4j');

var db = new neo4j.GraphDatabase({
    url: 'http://irvingderin.com:7474',
    auth: {username: process.env.NEO4J_USER , password: process.env.NEO4J_PASS}
});



/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/test', function (req, res, next) {
   db.cypher({
       query : "MATCH (n) RETURN (n) LIMIT 5",
       params : {}
   }, (err, data) => {
       console.log(err);
       console.log(data);
       res.end();
   })
});

router.get('/test/:id', function (req, res, next) {
    console.log(req.params);
    db.cypher({
        query : "MATCH (n {file : {id} }) RETURN (n) LIMIT 5",
        params : {
            id: req.params['id']
        }
    }, (err, data) => {
        console.log(err);
        console.log(data[0]['n']['properties']['citation_count']);
        res.end();
    })
});

/**
 * @description: Returns back the number of nodes
 */
router.get('/node/', function (req, res, next) {
   db.cypher({
       query : "MATCH (n) RETURN count(n)",
       params : {}
   }, (err, data) => {
       if(err) throw err;
       var count = data[0]['count(n)'];
       res.json({count : count});
   }) 
});

/**
 * @description: Returns back specific node. Indexed by 'file'
 *
 */
router.get('/node/:file', function (req, res, next) {
    db.cypher({
        query : "MATCH (n {file : {file}} ) RETURN n",
        params : {
            file : req.params['file']
        }
    }, (err, data) => {
        if(err) throw err;
        var node = data[0];
        res.json({node : node});
    })
});

/**
 * @description: Return relationships of a specific node. Get inbound and outbound
 */
router.get('/relationships/:file', function (req, res, next) {
    db.cypher({
        queries: [{
            query : "MATCH (n {file : {file}} ) RETURN n",
            lean : true,
            params : {
                file : req.params['file']
            }
        },
            {
            query : "MATCH (n {file : {file}} ) - [:CITES] -> (m) RETURN m.file as file, m.case_name as name, m.date_filed as filed",
            lean : true,
            params : {
                file : req.params['file']
            }
        },{
            query : "MATCH (n) - [:CITES] -> (m {file : {file}}) RETURN n.file as file, n.case_name as name, n.date_filed as filed",
            lean : true,
            params : {
                file : req.params['file']
            }
        }]

    }, (err, data) => {
        if(err) throw err;
        res.json({
            cited_cases : data[0],
            cites_cases : data[1]
        });
    })
});

module.exports = router;
