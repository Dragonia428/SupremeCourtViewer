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
            nodeSpacing : 100,
            parentCentralization : true

        }
    },
    edges: {
    },
    physics : false
};

var ourStory = {
    '118149' : "In State Oil V. Khan, years of Anti-Trust litigation were overruled when Vertical Price Fixing was given a new latitude. " +
    "Despite the young age of this case, several cases have already taken advantage of this decision"
}

var network = new vis.Network(container, data, options);
network.on('click', function (params){
    var clicked_node = params['nodes'][0];
    var nodeTitle = nodes.get(clicked_node);
    console.log(clicked_node)
    $('#case_name_span').text(nodeTitle.label);
    if( ourStory[clicked_node]){
        $('#case_story_span').text(ourStory[clicked_node])
    }
});

getRelationships(118149).then( (result) => {
    console.log(result);
    nodes.add({
        id : result['original_case']['file'],
        label : result['original_case']['case_name'],
        title : result['original_case']['filed'],
        shape : "box",
        level : 1
    });
    for(var i = 0; i < result['cited_cases'].length; ++i){
        nodes.add({
            id : result['cited_cases'][i]['file'],
            label : result['cited_cases'][i]['name'],
            title : result['cited_cases'][i]['filed'],
            shape : "box",
            level : 2
        });
        edges.add({
            to : result['cited_cases'][i]['file'],
            from: result['original_case']['file'],
            arrows: 'middle'
        })
    }
    
    for(var j = 0; j < result['cites_cases'].length; ++j){
        nodes.add({
            id: result['cites_cases'][j]['file'],
            label: result['cites_cases'][j]['name'],
            title : result['cites_cases'][j]['filed'],
            shape : "box",
            level : 0
        });
        edges.add({
            from : result['cites_cases'][j]['file'],
            to: result['original_case']['file'],
            arrows: 'middle'
        })
        
    }
});


function getNode(fileNumber){
    return $.get('/api/node/' + fileNumber);
}

function getRelationships(fileNumber){
    return $.get('/api/relationships/' + fileNumber)
}
