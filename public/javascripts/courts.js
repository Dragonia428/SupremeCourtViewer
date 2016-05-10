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
    interaction : {
        dragNodes : true,
        hover : true
    },
    layout: {
        hierarchical: {
            sortMethod: 'directed',
            direction : 'LR',
            levelSeparation : 450,
            parentCentralization : true

        }
    },
    edges: {
    },
    physics : false
};

var network = new vis.Network(container, data, options);
network.on('click', function (params){
    var clicked_node = params['nodes'][0];
    var nodeTitle = nodes.get(clicked_node);
    console.log(nodeTitle);
    $('#case_name_span').text(nodeTitle.label);
});

getRelationships(118149).then( (result) => {
    console.log(result);
    nodes.add({
        id : result['original_case']['file'],
        label : result['original_case']['case_name'],
        title : result['original_case']['filed'],
        level : 1
    });
    for(var i = 0; i < result['cited_cases'].length; ++i){
        nodes.add({
            id : result['cited_cases'][i]['file'],
            label : result['cited_cases'][i]['name'],
            title : result['cited_cases'][i]['filed'],
            level : 2
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
            label: result['cites_cases'][j]['name'],
            title : result['cites_cases'][j]['filed'],
            level : 0
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
