$(document).ready(()=>{
    // set map height
    utils.setMainRowHeight();

    mainMap.init().subscribe(
        ()=>{
            /**
             * After loading the geojson data, creating the main layer and the map,
             * the loading of all data in the spreadsheet can be started.
             */ 
            dataLoader.init().then(
                (d)=>{
                    // set the root node as default on start
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
        },
        (e)=> { console.log('onError: %s', e); },
        ()=> { console.log('onCompleted'); }
    );

});

$(window).on('resize', ()=>{
    // set map height
    utils.setMainRowHeight();
});