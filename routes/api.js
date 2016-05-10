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
       res.end(count.toString());
   }) 
});

/**
 * @description: Returns back specific node. Indexed by 'file'
 */

module.exports = router;
