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
       query : "MATCH (n: Cluster ) RETURN count(n)",
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
        query : "MATCH (n: Cluster  {file : {file}} ) RETURN n",
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
            query : "MATCH (n: Cluster {file : {file}} ) RETURN n",
            lean : true,
            params : {
                file : req.params['file']
            }
        },
            {
            query : "MATCH (n: Cluster  {file : {file}} ) - [:CITES] -> (m: Cluster ) " +
            "RETURN m.file as file, m.case_name as name, m.date_filed as filed",
            lean : true,
            params : {
                file : req.params['file']
            }
        },{
            query : "MATCH (n: Cluster ) - [:CITES] -> (m: Cluster  {file : {file}}) " +
            "RETURN n.file as file, n.case_name as name, n.date_filed as filed",
            lean : true,
            params : {
                file : req.params['file']
            }
        }]

    }, (err, data) => {
        if(err) throw err;
        // Queries that are in an array return as an array. Same positions
        res.json({
            original_case : data[0][0]['n'],
            cites_cases : data[1],
            cited_cases : data[2]
        });
    })
});

/**
 * @description: API for getting cool functions and queries
 */
router.get('/firstDegree/:file', function (req, res, next) {
    db.cypher({
        query : "MATCH (citing:Cluster {file : {file}})-[:CITES]->(node)-[:CITES]->(cited:Cluster) " +
        "WITH  DISTINCT cited,node " +
        "MATCH (cited)-[:CITES]-(firstDegree) " +
        "RETURN count(firstDegree),cited.file, node.file",
        params : {
            file : req.params['file']
        }
    }, (err, data) => {
        if(err) throw err;
        var node = data;
        res.json({node : node});
    })
});

/**
 * @description: Get conservative and liberal decsision
 */
router.get('/decision/:direction', function (req, res, next) {
    // Allow for null case
    if(req.params['direction'] === '0'){
        db.cypher({
            query : "MATCH (n:Cluster) " +
            "WHERE n.scdb_decision_direction IS NULL " + 
            "RETURN n.case_name as case_name, n.file as file_number",
            params : {
                direction : req.params['direction']
            }
        }, (err, data) => {
            if (err) throw err;
            res.json({decisions : data, direction : req.params['direction']})
        })
    }
    else {
        db.cypher({
            query : "MATCH (n:Cluster {scdb_decision_direction : {direction == '1'}})" +
            "RETURN n.case_name as case_name, n.file as file_number",
            params : {
                direction : req.params['direction']
            }
        }, (err, data) => {
            if (err) throw err;
            res.json({decisions : data, direction : req.params['direction']})
        })
    }
});

module.exports = router;
