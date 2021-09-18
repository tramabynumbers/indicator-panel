// To change, pass another value as parameter, utils.setMainRowHeight(offset Value)
var offsetHeight=0.5;
$(document).ready(()=>{
    // set map height.
    utils.setMainRowHeight(offsetHeight);

    dataSourceSelector.init().subscribe(
        (ds)=>{
            let d=dataSourceSelector.getDataSourceById(ds.defaultSelectorId);
            dataSourceSelector.applyDataSourceChange(d);
            radar.init();
        },
        (e)=> { console.log('onError: %s', e); },
        ()=> { console.log('onCompleted'); }
    );// datasource loader end
});// window ready end

$(window).on('resize', ()=>{
    // set map height
    utils.setMainRowHeight(offsetHeight);
    treeview.redraw();
    radar.init();
    // treeview.update(treeview.selectedNode);
});