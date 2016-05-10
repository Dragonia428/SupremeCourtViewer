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
var options = {interaction : {hover:true}};
var network = new vis.Network(container, data, options);

for(var i = 0; i < 5; i++){
    getNode(100000 + i).then( (result) => {
        console.log(result['node']['n']);
        nodes.add({
            id : result['node']['n']['properties']['file'],
            label : result['node']['n']['properties']['case_name']
        })
    });
}

function getNode(fileNumber){
    return $.get('/api/node/' + fileNumber);
}

function getRelationships(fileNumber){
    return $.get('/api/node/' + fileNumber)
}
