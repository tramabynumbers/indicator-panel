$(document).ready(()=>{
    // set map height
    utils.setMainRowHeight();
    mainMap.init();
    dataLoader.init().then(
        (d)=>{
            mainMap.updateMainLayer(d[0][0]);
            // start TreeView
            let events=treeview.display(dataLoader.dataModel);
            events.subscribe(
                (value)=>{
                    d[0].find(
                        (el,i)=>{
                            if(el.key==value){
                                mainMap.updateMainLayer(d[0][i]);
                            }
                        });
                },
                ()=>{
                    // on error, set the root node as default
                    mainMap.updateMainLayer(d[0][0]);
                }
            );
        }
    );
});

$(window).on('resize', ()=>{
    // set map height
    utils.setMainRowHeight();
});