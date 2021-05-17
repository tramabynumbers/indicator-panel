var treeview = {

    jsonEntryData: null,
    selectedNode: null,
    csvName: null,
    observer: null,
    maxDepth: 6,
    i: 0,// serial id for nodes

    selectedNodeChanges:()=>{
        return new rxjs.Observable(
            (observer)=>{
                treeview.observer=observer;
            }
        );
    },

    makeJsonEntryData: (d) => {
        treeview.jsonEntryData = treeview.nodesFromModel(d);
    },

    nodesFromModel: (obj) => {
        let node = {
            "key": "",
            "children": [],
            "equal": (n)=>{
                let that=node;
                return (!that.parent && !n.parent)?
                (that.key==n.key):
                (that.parent && n.parent)?
                (that.key==n.key && that.parent.key==n.parent.key):
                (false);
            }
        };
        for (let prop in obj) {
            if (Object.prototype.toString.call(obj[prop]) == "[object Array]" && obj[prop].length) {
                obj[prop].forEach(element => {
                    node["children"].push(treeview.nodesFromModel(element));
                });
            } else {
                if (prop == "key") {
                    node["key"] = obj[prop];
                }
                if (prop == "description") {
                    node["description"] = obj[prop];
                }
            }
        }
        if (!node["children"].length) delete node.children;
        return node;
    },

    display: (d) => {
        treeview.makeJsonEntryData(d);
        let observable=treeview.selectedNodeChanges();
        treeview.redraw();
        return observable;
    },

    redraw: ()=>{
        let to=(treeview.timeoutCtrl)?(200):(1);
        clearTimeout(treeview.timeoutCtrl);
        treeview.timeoutCtrl=setTimeout(
            ()=>{
                //let oldSelection=(treeview.selectedNode)?(treeview.selectedNode.key):(null);
                let bounds=treeview.getBounds();
                treeview.initTree(bounds);
                treeview.initRoot(bounds.height);
                // if(oldSelection) {
                //     let node = treeview.getNodeByKey(oldSelection, treeview.root);
                //     if(node) treeview.update(node);
                // }
            }
        ,to);
    },

    // getNodeByKey: (key, node)=>{
    //     if(node.key==key) return node;
    //     else if(node.children) {
    //         return node.children.find(
    //             (n)=>{
    //                 return treeview.getNodeByKey(key, n);
    //             }
    //         );
    //     }
    // },

    initTree: (bounds)=>{

        let margin = treeview.getMargins();

        treeview.duration = 350;
        treeview.tree = d3v3.layout.tree()
            .size([bounds.height, bounds.width]);

        treeview.diagonal = d3v3.svg.diagonal()
            .projection(function (d) { return [d.y, d.x]; });

        if(treeview.svg) {
            d3v3.select("#treeview svg").remove();
        }

        treeview.svg = d3v3.select("#treeview").append("svg")
            .attr("width", bounds.width + margin.right + margin.left)
            .attr("height", bounds.height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    },

    getBounds: ()=>{
        let w = $('#treeview').width();
        let h = $('#treeview').height();

        let margin = treeview.getMargins(),
            width = w - margin.right - margin.left,
            height = h - margin.top - margin.bottom;
        return {width:width,height:height};
    },

    getMargins: ()=>{
        return { top: 10, right: 50, bottom: 10, left: 80 };
    },

    initRoot: (height) => {
        treeview.root = treeview.jsonEntryData;

        treeview.root.x0 = height / 2;
        treeview.root.y0 = 0;

        treeview.collapse =
            (d) => {
                if (d.children) {
                    d._children = d.children;
                    d._children.forEach(treeview.collapse);
                    d.children = null;
                }
            };

        treeview.root.children.forEach(treeview.collapse);
        treeview.update(treeview.root);

        d3v3.select(self.frameElement).style("height", height);
    },

    resetBounds: ()=>{

        let bounds = treeview.getBounds();
        let margin = treeview.getMargins();

        treeview.tree.size([bounds.height, bounds.width]);

        treeview.svg
            .attr("width", bounds.width + margin.right + margin.left)
            .attr("height", bounds.height + margin.top + margin.bottom);
    },

    update: (source) => {

        // store selected node
        treeview.csvName = ((source.depth >= 1) ? (source.parent.key + "-") : ("")) + source.key;
        treeview.selectedNode = source;
        if(treeview.observer) treeview.observer.next(treeview.csvName);

        // Compute the new tree layout.
        var nodes = treeview.tree.nodes(treeview.root).reverse(),
            links = treeview.tree.links(nodes);

        // Normalize for fixed-depth.
        let maxWidth=$('#treeview').innerWidth()/(treeview.maxDepth+1);
        nodes.forEach(function (d) { d.x0 = d.depth * parseInt(maxWidth); });

        // Update the nodes…
        var node = treeview.svg.selectAll("g.node")
            .data(nodes, function (d) { return d.id || (d.id = ++treeview.i); });

        // Enter any new nodes at the parent's previous position.
        var nodeEnter = node.enter().append("g")
            .attr("class", "node")
            .attr("transform", function (d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
            .on("click", treeview.click);

        nodeEnter.append("circle")
            .attr("r", 1e-6)
            .style("fill", function (d) { return d._children ? "lightsteelblue" : "#fff"; });

        nodeEnter.append("title")
            .text(function (d) { return d.description; });

        nodeEnter.append("text")
            .attr("x", function (d) { return d.children || d._children ? -10 : 10; })
            .attr("dy", ".35em")
            .attr("text-anchor", function (d) { return d.children || d._children ? "end" : "start"; })
            .text(function (d) { return d.key; })
            .style("fill-opacity", 1e-6);

        // Transition nodes to their new position.
        var nodeUpdate = node.transition()
            .duration(treeview.duration)
            .attr("transform", function (d) { return "translate(" + d.y + "," + d.x + ")"; });

        nodeUpdate.select("circle")
            .attr("r", 4.5)
            .style("fill", function (d) {
                let color = d._children ? "lightsteelblue" : "#fff";
                color = d.equal(treeview.selectedNode) ? "#f00" : color;
                return color;
            });

        nodeUpdate.select("text")
            .style("fill-opacity", 1);

        // Transition exiting nodes to the parent's new position.
        var nodeExit = node.exit().transition()
            .duration(treeview.duration)
            .attr("transform", function (d) { return "translate(" + source.y + "," + source.x + ")"; })
            .remove();

        nodeExit.select("circle")
            .attr("r", 1e-6);

        nodeExit.select("text")
            .style("fill-opacity", 1e-6);

        // Update the links…
        var link = treeview.svg.selectAll("path.link")
            .data(links, function (d) { return d.target.id; });

        // Enter any new links at the parent's previous position.
        link.enter().insert("path", "g")
            .attr("class", "link")
            .attr("d", function (d) {
                var o = { x: source.x0, y: source.y0 };
                return treeview.diagonal({ source: o, target: o });
            });

        // Transition links to their new position.
        link.transition()
            .duration(treeview.duration)
            .attr("d", treeview.diagonal);

        // Transition exiting nodes to the parent's new position.
        link.exit().transition()
            .duration(treeview.duration)
            .attr("d", function (d) {
                var o = { x: source.x, y: source.y };
                return treeview.diagonal({ source: o, target: o });
            })
            .remove();

        // Stash the old positions for transition.
        nodes.forEach(function (d) {
            d.x0 = d.x;
            d.y0 = d.y;
        });
    },

    // Toggle children on click.
    click: (d) => {
        if (d.children) {
            d._children = d.children;
            d.children = null;
        } else {
            d.children = d._children;
            d._children = null;
        }
        treeview.update(d);
    }
};