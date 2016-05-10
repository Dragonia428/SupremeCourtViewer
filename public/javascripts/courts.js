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

$.get('/api/node/100000', function (data){
    console.log(data['node']['n']);
    var node = data['node']['n'];
    nodes.add({
        id: node.properties['file'],
        label: node.properties['case_name']
    });
    console.log(nodes);
});