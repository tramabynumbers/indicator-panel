var dataSourceSelector={
    path: "conf/datasource.json",// configuration path
    observer:null,
    ds:null,// the conf file in memory
    selectedId:null, // selected datasource id

    init:()=>{
        return new rxjs.Observable(
            (observer)=>{
                dataSourceSelector.observer=observer;
                dataSourceSelector.fetchConf();
            },
            ()=>{
                // on error, set .... as default
                console.log("Missing error handler");
            }
        );
    },

    fetchConf(){
        fetch(dataSourceSelector.path)
        .then(
            (response)=>{
                // on sucess
                response.json()
                .then(
                    (ds)=>{
                        if(dataSourceSelector.observer){
                            dataSourceSelector.ds=ds;
                            dataSourceSelector.selectedId=ds.defaultSelectorId;
                            dataSourceSelector.displaySelector(ds);
                            dataSourceSelector.observer.next(ds);
                        }
                    }
                );
            },
            ()=>{
                // on reject
                console.log("Falhou ao ler o arquivo de configuração de fontes de dados.");
                dataSourceSelector.observer.error("Falhou ao ler o arquivo de configuração de fontes de dados.");
            }
        );
    },

    setPanelTitle: (panelTitle)=>{
        $('#main-txt-menu-bar').html(panelTitle);//ds.panelTitle
    },

    displaySelector: (ds)=>{
        let dss= $('#datasourse-selector')
        ds.dataSet.forEach(
            d => {
                let a=$("<a></a>").text(d.shortName);
                a.addClass("dropdown-item");
                a.on("click",dataSourceSelector.onDataSourceChange);
                a.attr("title",d.description);
                a.attr("id",d.selectorId);
                dss.append(a);
            }
        );
    },

    onDataSourceChange:(e)=>{
        dataSourceSelector.selectedId=e.target.id,
        d=dataSourceSelector.getSelected();
        dataSourceSelector.applyDataSourceChange(d);
    },

    getSelected:()=>{
        return dataSourceSelector.getDataSourceById(dataSourceSelector.selectedId);
    },

    getDataSourceById:(id)=>{
        return dataSourceSelector.ds.dataSet.find(
            (d)=>{
                if(d.selectorId==id) return d;
            }
        );
    },

    applyDataSourceChange:(selectedDataSource)=>{
        dataSourceSelector.setPanelTitle(selectedDataSource.panelTitle);
        mainMap.init(selectedDataSource).subscribe(
            ()=>{
                /**
                 * After loading the geojson data, creating the main layer and the map,
                 * then loading of all data in the spreadsheet can be started.
                 */ 
                dataLoader.init(selectedDataSource).then(
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
                                            detail.setSelectedIndicator(d[0][i]).updatePanel();
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
    }
};