/**
 * Created by scarzer on 5/10/16.
 */
console.log("Hello World");
var container = document.getElementById('networkGraphColumn');
var nodes = new vis.DataSet();
var edges = new vis.DataSet();
var data = {
    nodes : nodes,
    edges : edges
};
var options = {
    layout: {
        hierarchical: {
            sortMethod: 'directed',
            direction : 'LR'
        }
    },
    edges: {
    },
    physics : false
};

var network = new vis.Network(container, data, options);

/*
for(var i = 0; i < 5; i++){
    getNode(100000 + i).then( (result) => {
        //console.log(result['node']['n']);
        nodes.add({
            id : result['node']['n']['properties']['file'],
            label : result['node']['n']['properties']['case_name']
        })
    });
}
*/

getRelationships(118149).then( (result) => {
    console.log(result);
    nodes.add({
        id : result['original_case']['file'],
        label : result['original_case']['case_name'],
        title : result['original_case']['filed']
    });
    for(var i = 0; i < result['cited_cases'].length; ++i){
        nodes.add({
            id : result['cited_cases'][i]['file'],
            label : result['cited_cases'][i]['name']
        });
        edges.add({
            from : result['cited_cases'][i]['file'],
            to: result['original_case']['file'],
            arrows: 'from'
        })
    }
    
    for(var j = 0; j < result['cites_cases'].length; ++j){
        nodes.add({
            id: result['cites_cases'][j]['file'],
            label: result['cites_cases'][j]['name']
        });
        edges.add({
            to : result['cites_cases'][j]['file'],
            from: result['original_case']['file'],
            arrows: 'from'
        })
        
    }
});

function getNode(fileNumber){
    return $.get('/api/node/' + fileNumber);
}

function getRelationships(fileNumber){
    return $.get('/api/relationships/' + fileNumber)
}
